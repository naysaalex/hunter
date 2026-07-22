(function(){
  "use strict";

  const stateByCode = Object.fromEntries(STATE_DATA.map(s => [s.code, s]));

  /* ---------------- Contour background (signature element) ---------------- */
  function buildContours(){
    const el = document.getElementById("contourField");
    const w = 1200, h = 600;
    let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">`;
    for(let i=0;i<9;i++){
      const yBase = 40 + i*58;
      const amp = 18 + (i%4)*10;
      const freq = 0.006 + (i%3)*0.002;
      let d = `M0 ${yBase}`;
      for(let x=0;x<=w;x+=20){
        const y = yBase + Math.sin(x*freq + i)*amp;
        d += ` L${x} ${y.toFixed(1)}`;
      }
      const opacity = 0.14 + (i%3)*0.05;
      svg += `<path d="${d}" fill="none" stroke="#9FB688" stroke-width="1" opacity="${opacity}"/>`;
    }
    svg += `</svg>`;
    el.innerHTML = svg;
  }
  buildContours();

  /* ---------------- Populate calculator selects ---------------- */
  const stateSelect = document.getElementById("stateSelect");
  const speciesSelect = document.getElementById("speciesSelect");
  const pointsInput = document.getElementById("pointsInput");
  const stateMeta = document.getElementById("stateMeta");
  const resultsEl = document.getElementById("results");

  STATE_DATA
    .slice()
    .sort((a,b)=>a.name.localeCompare(b.name))
    .forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s.code; opt.textContent = s.name;
      stateSelect.appendChild(opt);
    });

  function tagClass(system){
    return { preference:"tag-preference", bonus:"tag-bonus", lottery:"tag-lottery",
             mixed:"tag-mixed", otc:"tag-otc" }[system] || "tag-mixed";
  }

  function refreshSpeciesOptions(){
    const s = stateByCode[stateSelect.value];
    speciesSelect.innerHTML = "";
    (s.species || []).forEach(sp=>{
      const opt = document.createElement("option");
      opt.value = sp; opt.textContent = sp[0].toUpperCase()+sp.slice(1);
      speciesSelect.appendChild(opt);
    });
    renderStateMeta(s);
  }

  function renderStateMeta(s){
    stateMeta.innerHTML = `
      <span class="tag ${tagClass(s.system)}">${s.system}</span>
      <span>${s.agency}</span>
      <div class="confidence-flag ${s.confidence}">${
        s.confidence === "verified"
          ? "Draw-system classification verified against agency/source material this session."
          : "General classification from published hunting guides — confirm current rules with the agency link above."
      }</div>
    `;
  }

  stateSelect.addEventListener("change", refreshSpeciesOptions);
  stateSelect.value = "CO";
  refreshSpeciesOptions();

  /* ---------------- Calculate + render permit-tag results ---------------- */
  function tierClass(tier){
    return { strong:"tier-strong", moderate:"tier-moderate", long:"tier-long" }[tier] || "tier-moderate";
  }

  function runCalculation(){
    const code = stateSelect.value;
    const species = speciesSelect.value;
    const points = Math.max(0, parseInt(pointsInput.value || "0", 10));
    const s = stateByCode[code];

    const units = (UNIT_DATA[code] && UNIT_DATA[code][species]) || [];

    if(!units.length){
      resultsEl.innerHTML = `<div class="empty-state">No unit-level data loaded yet for ${s.name} · ${species}. System type is <strong>${s.system}</strong> (${s.confidence}). ${s.notes}</div>`;
      return;
    }

    const ranked = DrawEngine.recommend({
      stateCode: code, species, userPoints: points, systemType: s.system, units
    });

    resultsEl.innerHTML = ranked.map(r => `
      <div class="permit">
        <div class="permit-main">
          <div class="permit-unit">${r.unitName}</div>
          <div class="permit-note">${r.label}</div>
          ${r.isSample ? '<span class="permit-sample">Sample data</span>' : ''}
        </div>
        <div class="permit-stub">
          <div class="permit-pct">${r.pct}%</div>
          <div class="permit-tier ${tierClass(r.tier)}">${r.tier}</div>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("calcBtn").addEventListener("click", runCalculation);
  runCalculation();

  /* ---------------- State reference table ---------------- */
  const tbody = document.getElementById("stateTableBody");
  let activeFilter = "all";
  let searchTerm = "";

  function renderTable(){
    const rows = STATE_DATA
      .filter(s => activeFilter === "all" || s.system === activeFilter)
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b)=>a.name.localeCompare(b.name))
      .map(s => `
        <tr>
          <td class="state-name">${s.name}</td>
          <td><span class="tag ${tagClass(s.system)}">${s.system}</span></td>
          <td>${(s.species||[]).join(", ")}</td>
          <td class="state-notes">${s.notes}</td>
        </tr>
      `).join("");
    tbody.innerHTML = rows || `<tr><td colspan="4" class="state-notes">No states match.</td></tr>`;
  }

  document.getElementById("stateSearch").addEventListener("input", e=>{
    searchTerm = e.target.value; renderTable();
  });
  document.querySelectorAll(".filter-chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".filter-chip").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderTable();
    });
  });

  renderTable();
})();
