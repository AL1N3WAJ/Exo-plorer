import axios from 'axios';
import pool from './pool.js';
import { computeBiosignatureScore } from '../utils/scorer.js';
import dotenv from 'dotenv';

dotenv.config();

const NASA_TAP_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,pl_orbsmax,pl_masse,pl_rade,st_lum,st_mass,st_teff,sy_dist+from+pscomppars&format=json';

const ingest = async () => {
  console.log('🚀 Starting NASA Exoplanet Archive ingestion...');

  let rawData;
  try {
    console.log('📡 Fetching from NASA TAP endpoint...');
    const response = await axios.get(NASA_TAP_URL, {
      timeout: 120000,
      headers: { 'Accept': 'application/json' }
    });
    rawData = response.data;

    if (!Array.isArray(rawData)) {
      console.error('❌ Unexpected response format:', typeof rawData);
      process.exit(1);
    }

    console.log(`📡 Fetched ${rawData.length} records from NASA.`);
  } catch (err) {
    console.error('❌ Failed to fetch from NASA:', err.message);
    process.exit(1);
  }

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    for (const row of rawData) {
      const planetName = row.pl_name?.trim();
      const hostname = row.hostname?.trim();

      if (!planetName || !hostname) {
        skipped++;
        continue;
      }

      const planet = {
        planet_name: planetName,
        hostname,
        discovery_method: null,
        orbital_period_days: row.pl_orbper ?? null,
        semi_major_axis_au: row.pl_orbsmax ?? null,
        planet_mass_earth: row.pl_masse ?? null,
        planet_radius_earth: row.pl_rade ?? null,
        stellar_luminosity_log10: row.st_lum ?? null,
        stellar_mass_solar: row.st_mass ?? null,
        stellar_teff_k: row.st_teff ?? null,
        distance_pc: row.sy_dist ?? null,
        h2o_abundance_pct: 0,
        o2_abundance_pct: 0,
        ch4_abundance_pct: 0,
        co2_abundance_pct: 0,
        has_spectral_data: false,
      };

      planet.biosignature_score = computeBiosignatureScore(planet);

      await client.query(
        `INSERT INTO exoplanets (
          planet_name, hostname, discovery_method,
          orbital_period_days, semi_major_axis_au,
          planet_mass_earth, planet_radius_earth,
          stellar_luminosity_log10, stellar_mass_solar, stellar_teff_k,
          distance_pc,
          has_spectral_data, o2_abundance_pct, ch4_abundance_pct,
          h2o_abundance_pct, co2_abundance_pct,
          biosignature_score, last_updated
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW()
        )
        ON CONFLICT (planet_name) DO UPDATE SET
          hostname = EXCLUDED.hostname,
          discovery_method = EXCLUDED.discovery_method,
          orbital_period_days = EXCLUDED.orbital_period_days,
          semi_major_axis_au = EXCLUDED.semi_major_axis_au,
          planet_mass_earth = EXCLUDED.planet_mass_earth,
          planet_radius_earth = EXCLUDED.planet_radius_earth,
          stellar_luminosity_log10 = EXCLUDED.stellar_luminosity_log10,
          stellar_mass_solar = EXCLUDED.stellar_mass_solar,
          stellar_teff_k = EXCLUDED.stellar_teff_k,
          distance_pc = EXCLUDED.distance_pc,
          biosignature_score = EXCLUDED.biosignature_score,
          last_updated = NOW()`,
        [
          planet.planet_name, planet.hostname, planet.discovery_method,
          planet.orbital_period_days, planet.semi_major_axis_au,
          planet.planet_mass_earth, planet.planet_radius_earth,
          planet.stellar_luminosity_log10, planet.stellar_mass_solar, planet.stellar_teff_k,
          planet.distance_pc,
          planet.has_spectral_data, planet.o2_abundance_pct, planet.ch4_abundance_pct,
          planet.h2o_abundance_pct, planet.co2_abundance_pct,
          planet.biosignature_score,
        ]
      );

      inserted++;
      if (inserted % 500 === 0) {
        console.log(`  ⏳ Processed ${inserted} planets so far...`);
      }
    }

    console.log(`✅ Ingestion complete. Upserted: ${inserted} | Skipped: ${skipped}`);
    const countResult = await client.query('SELECT COUNT(*) FROM exoplanets');
    console.log(`🌍 Total planets in database: ${countResult.rows[0].count}`);
  } catch (err) {
    console.error('❌ Ingestion error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
};

ingest();