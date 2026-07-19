import pool from './pool.js';

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exoplanets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        planet_name VARCHAR(255) UNIQUE NOT NULL,
        hostname VARCHAR(255) NOT NULL,
        discovery_method VARCHAR(100),
        orbital_period_days NUMERIC,
        semi_major_axis_au NUMERIC,
        planet_mass_earth NUMERIC,
        planet_radius_earth NUMERIC,
        stellar_luminosity_log10 NUMERIC,
        stellar_mass_solar NUMERIC,
        stellar_teff_k NUMERIC,
        distance_pc NUMERIC,

        has_spectral_data BOOLEAN DEFAULT FALSE,
        o2_abundance_pct NUMERIC DEFAULT 0.0,
        ch4_abundance_pct NUMERIC DEFAULT 0.0,
        h2o_abundance_pct NUMERIC DEFAULT 0.0,
        co2_abundance_pct NUMERIC DEFAULT 0.0,

        biosignature_score INT DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exoplanets_score ON exoplanets(biosignature_score DESC);
    `);

    console.log('✅ Migrations complete.');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
