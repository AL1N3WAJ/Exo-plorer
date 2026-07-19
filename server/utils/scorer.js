/**
 * Biosignature Confidence Scoring Engine
 * Computes an integer score 0–100 based on orbital, stellar, mass, and atmospheric parameters.
 */

export function computeBiosignatureScore(planet) {
  let score = 0;

  // ── Habitable Zone Check (+40 pts) ──────────────────────────────────────────
  const { stellar_luminosity_log10, semi_major_axis_au } = planet;
  if (stellar_luminosity_log10 != null && semi_major_axis_au != null) {
    const L = Math.pow(10, parseFloat(stellar_luminosity_log10));
    const innerEdge = Math.sqrt(L / 1.1);
    const outerEdge = Math.sqrt(L / 0.53);
    const sma = parseFloat(semi_major_axis_au);
    if (sma >= innerEdge && sma <= outerEdge) {
      score += 40;
    }
  }

  // ── Mass Safeguards ──────────────────────────────────────────────────────────
  const mass = parseFloat(planet.planet_mass_earth);
  if (!isNaN(mass)) {
    if (mass > 5.0) {
      score -= 30; // Gas giant / mini-Neptune penalty
    } else if (mass >= 0.5 && mass <= 2.0) {
      score += 10; // Ideal rocky planet profile
    }
  }

  // ── Chemical Multipliers (Atmospheric Simulation Tier) ───────────────────────
  const h2o = parseFloat(planet.h2o_abundance_pct) || 0;
  const o2 = parseFloat(planet.o2_abundance_pct) || 0;
  const ch4 = parseFloat(planet.ch4_abundance_pct) || 0;

  if (h2o > 0) {
    score += 10; // Liquid water presence
  }

  if (o2 > 5 && ch4 > 5) {
    score += 30; // Atmospheric disequilibrium — persistent biological replenishment signal
  }

  // ── Clamp to [0, 100] ───────────────────────────────────────────────────────
  return Math.max(0, Math.min(100, score));
}

/**
 * Determines if a planet is in the habitable zone (used for badge tagging).
 */
export function isInHabitableZone(planet) {
  const { stellar_luminosity_log10, semi_major_axis_au } = planet;
  if (stellar_luminosity_log10 == null || semi_major_axis_au == null) return false;
  const L = Math.pow(10, parseFloat(stellar_luminosity_log10));
  const innerEdge = Math.sqrt(L / 1.1);
  const outerEdge = Math.sqrt(L / 0.53);
  const sma = parseFloat(semi_major_axis_au);
  return sma >= innerEdge && sma <= outerEdge;
}
