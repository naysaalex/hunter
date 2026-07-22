/* ==========================================================================
   UNIT-LEVEL HISTORICAL DRAW DATA — DEMO / SAMPLE DATA ONLY
   ==========================================================================
   Real per-unit draw statistics are published by each agency as PDF/report
   documents (e.g. CPW's "Draw Recap Reports"), not as an open API or CSV.
   To make the recommendation engine fully accurate, this file needs to be
   replaced/expanded with data ingested from each state's official reports.

   The records below are illustrative sample data — realistic in shape and
   consistent with publicly described trends (e.g. Colorado point creep,
   Arizona bonus-point odds curves) — so the engine and UI can be built and
   tested end-to-end. They are NOT this year's real published numbers.
   Each record is tagged isSample:true so the UI can visibly flag it.
   ========================================================================== */

const UNIT_DATA = {

  // ---- Colorado (preference point system) ----
  CO: {
    elk: [
      { unit:"Unit 61 (Archery Bull)", tags:45, applicants:420, minPointsLastYear:3, trend:"rising", isSample:true },
      { unit:"Unit 76 (Rifle Bull)",   tags:20, applicants:610, minPointsLastYear:9, trend:"rising", isSample:true },
      { unit:"Unit 12 (Cow, 2nd choice avail.)", tags:150, applicants:260, minPointsLastYear:0, trend:"stable", isSample:true },
      { unit:"Unit 201 (Rifle Bull, RFW)", tags:8,  applicants:340, minPointsLastYear:15, trend:"rising", isSample:true }
    ],
    deer: [
      { unit:"Unit 54 (Buck)", tags:60, applicants:500, minPointsLastYear:6, trend:"rising", isSample:true },
      { unit:"Unit 130 (Buck)", tags:90, applicants:230, minPointsLastYear:1, trend:"stable", isSample:true }
    ],
    pronghorn: [
      { unit:"Unit 87 (Buck)", tags:75, applicants:180, minPointsLastYear:2, trend:"stable", isSample:true }
    ]
  },

  // ---- Arizona (bonus point system) ----
  AZ: {
    elk: [
      { unit:"Unit 9 (Early Bull)", tags:35, applicants:900, avgBonusPointsOfDrawn:8, trend:"rising", isSample:true },
      { unit:"Unit 23 (Late Bull)", tags:60, applicants:520, avgBonusPointsOfDrawn:3, trend:"stable", isSample:true }
    ],
    deer: [
      { unit:"Unit 27 (Coues Buck)", tags:80, applicants:610, avgBonusPointsOfDrawn:4, trend:"rising", isSample:true }
    ],
    pronghorn: [
      { unit:"Unit 10 (Buck)", tags:25, applicants:700, avgBonusPointsOfDrawn:10, trend:"rising", isSample:true }
    ]
  },

  // ---- Idaho (pure lottery) ----
  ID: {
    elk: [
      { unit:"Unit 14 (Controlled Hunt Bull)", tags:40, applicants:480, isSample:true },
      { unit:"Unit 39 (Controlled Hunt Bull)", tags:15, applicants:610, isSample:true }
    ],
    deer: [
      { unit:"Unit 76 (Controlled Hunt Buck)", tags:70, applicants:390, isSample:true }
    ]
  }
};

if (typeof module !== "undefined") module.exports = { UNIT_DATA };
