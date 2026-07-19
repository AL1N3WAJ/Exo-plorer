import { Router } from 'express';
import pool from '../db/pool.js';
import { isInHabitableZone } from '../utils/scorer.js';

const router = Router();

// GET /api/exoplanets
// Query params: page, limit, minScore, habitableOnly, searchQuery
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const minScore = parseInt(req.query.minScore) || 0;
    const habitableOnly = req.query.habitableOnly === 'true';
    const searchQuery = req.query.searchQuery?.trim() || '';

    const conditions = ['biosignature_score >= $1'];
    const params = [minScore];
    let idx = 2;

    if (searchQuery) {
      conditions.push(`(planet_name ILIKE $${idx} OR hostname ILIKE $${idx})`);
      params.push(`%${searchQuery}%`);
      idx++;
    }

    if (habitableOnly) {
      // Habitable zone: semi_major_axis_au between sqrt(L/1.1) and sqrt(L/0.53)
      // where L = 10^stellar_luminosity_log10
      conditions.push(`
        stellar_luminosity_log10 IS NOT NULL AND
        semi_major_axis_au IS NOT NULL AND
        semi_major_axis_au BETWEEN
          SQRT(POWER(10, stellar_luminosity_log10) / 1.1) AND
          SQRT(POWER(10, stellar_luminosity_log10) / 0.53)
      `);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM exoplanets ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT * FROM exoplanets ${whereClause}
       ORDER BY biosignature_score DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    // Annotate each planet with computed flags
    const planets = dataResult.rows.map((p) => ({
      ...p,
      in_habitable_zone: isInHabitableZone(p),
      is_rocky: p.planet_mass_earth != null && p.planet_mass_earth <= 5.0,
      is_gas_giant: p.planet_mass_earth != null && p.planet_mass_earth > 5.0,
    }));

    res.json({
      data: planets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/exoplanets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exoplanets/stats — overview metrics
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_planets,
        COUNT(*) FILTER (
          WHERE stellar_luminosity_log10 IS NOT NULL
            AND semi_major_axis_au IS NOT NULL
            AND semi_major_axis_au BETWEEN
              SQRT(POWER(10, stellar_luminosity_log10) / 1.1) AND
              SQRT(POWER(10, stellar_luminosity_log10) / 0.53)
        ) AS habitable_zone_count,
        COUNT(*) FILTER (WHERE biosignature_score >= 70) AS high_confidence_count,
        AVG(biosignature_score)::NUMERIC(5,1) AS avg_score
      FROM exoplanets
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/exoplanets/stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exoplanets/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM exoplanets WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planet not found' });
    }

    const p = result.rows[0];
    const L = p.stellar_luminosity_log10 != null
      ? Math.pow(10, parseFloat(p.stellar_luminosity_log10))
      : null;

    res.json({
      ...p,
      in_habitable_zone: isInHabitableZone(p),
      is_rocky: p.planet_mass_earth != null && p.planet_mass_earth <= 5.0,
      is_gas_giant: p.planet_mass_earth != null && p.planet_mass_earth > 5.0,
      computed: {
        stellar_luminosity_solar: L,
        habitable_zone_inner_au: L ? Math.sqrt(L / 1.1).toFixed(4) : null,
        habitable_zone_outer_au: L ? Math.sqrt(L / 0.53).toFixed(4) : null,
      },
    });
  } catch (err) {
    console.error('GET /api/exoplanets/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
