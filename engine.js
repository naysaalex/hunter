/* ==========================================================================
   DRAW ODDS CALCULATION ENGINE
   Implements the three core draw models validated against published agency
   rules, plus a "mixed" resolver that picks the right model per hunt.
   ========================================================================== */

const DrawEngine = (() => {

  /**
   * Preference point model (e.g. Colorado, Wyoming's point pool, Oklahoma).
   * Near-deterministic: if your points meet/exceed last year's cutoff for
   * that unit, you have a strong (not certain — quotas shift) shot at the
   * 1st-choice round. Below the cutoff, your realistic path is 2nd-4th
   * choice / leftover / secondary draw, which are random among leftovers.
   */
  function preferenceOdds({ userPoints, minPointsLastYear, tags, applicants, trend }) {
    const meetsThreshold = userPoints >= minPointsLastYear;
    let label, pct, tier;

    if (meetsThreshold) {
      // Above threshold: very likely, but point creep / quota shifts keep it
      // short of "guaranteed." The margin above the cutoff nudges confidence.
      const margin = userPoints - minPointsLastYear;
      pct = Math.min(97, 80 + margin * 3);
      tier = "strong";
      label = `Meets or exceeds last year's cutoff (${minPointsLastYear} pts) — high confidence for the 1st-choice round.`;
    } else {
      // Below threshold: essentially locked out of 1st-choice; realistic
      // odds come from leftover/2nd-4th-choice/secondary draw, modeled as
      // a small random pool.
      const leftoverPool = Math.max(tags * 0.15, 1);
      pct = Math.min(35, (leftoverPool / applicants) * 100);
      tier = pct > 15 ? "moderate" : "long";
      label = `Below last year's cutoff (needs ${minPointsLastYear} pts, you have ${userPoints}) — realistic path is leftover/later-choice rounds only.`;
    }

    if (trend === "rising" && meetsThreshold) {
      label += " Note: this unit shows point creep — the cutoff has been climbing, so banking extra points is wise.";
    }

    return { pct: Math.round(pct), tier, label, model: "preference" };
  }

  /**
   * Bonus point model (e.g. Arizona standard, Oregon, Utah, Washington).
   * Probabilistic: each bonus point adds one extra entry to the pool, on
   * top of the application's own entry. No guarantee at any point level.
   */
  function bonusOdds({ userPoints, tags, applicants, avgBonusPointsOfDrawn }) {
    const userEntries = 1 + userPoints;
    // Approximate total weighted entries in the pool using the average
    // bonus points held by people who *were* drawn as a rough proxy for
    // the applicant pool's average point level.
    const estAvgEntriesPerApplicant = 1 + (avgBonusPointsOfDrawn || 2);
    const totalEntries = applicants * estAvgEntriesPerApplicant;
    const pct = Math.min(90, (tags * userEntries / totalEntries) * 100);

    let tier = pct >= 25 ? "strong" : pct >= 8 ? "moderate" : "long";
    let label = `~${userEntries} weighted entries in the pool (1 base + ${userPoints} bonus). Odds improve with points but are never guaranteed.`;

    return { pct: Math.round(pct * 10) / 10, tier, label, model: "bonus" };
  }

  /**
   * Pure lottery model (e.g. Alaska, Idaho, New Mexico, Iowa, Kansas).
   * Points don't exist / don't affect odds — flat probability for everyone.
   */
  function lotteryOdds({ tags, applicants }) {
    const pct = Math.min(100, (tags / applicants) * 100);
    const tier = pct >= 20 ? "strong" : pct >= 8 ? "moderate" : "long";
    return {
      pct: Math.round(pct * 10) / 10,
      tier,
      label: "Pure random draw — every valid applicant has identical odds regardless of history.",
      model: "lottery"
    };
  }

  /**
   * Scores one hunt-choice record using the right model, then returns a
   * normalized result the UI can render/sort on.
   */
  function scoreUnit(systemType, userPoints, unit) {
    let result;
    switch (systemType) {
      case "preference":
        result = preferenceOdds({
          userPoints,
          minPointsLastYear: unit.minPointsLastYear ?? 0,
          tags: unit.tags,
          applicants: unit.applicants,
          trend: unit.trend
        });
        break;
      case "bonus":
        result = bonusOdds({
          userPoints,
          tags: unit.tags,
          applicants: unit.applicants,
          avgBonusPointsOfDrawn: unit.avgBonusPointsOfDrawn
        });
        break;
      case "lottery":
      default:
        result = lotteryOdds({ tags: unit.tags, applicants: unit.applicants });
        break;
    }
    return { unitName: unit.unit, isSample: !!unit.isSample, ...result };
  }

  /**
   * Ranks all known units for a state/species by the user's odds, best first.
   */
  function recommend({ stateCode, species, userPoints, systemType, units }) {
    const list = (units || []).map(u => scoreUnit(systemType, userPoints, u));
    list.sort((a, b) => b.pct - a.pct);
    return list;
  }

  return { preferenceOdds, bonusOdds, lotteryOdds, scoreUnit, recommend };
})();

if (typeof module !== "undefined") module.exports = { DrawEngine };
