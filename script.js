// ─── DATA ────────────────────────────────────────────────────────────────────

const projects = [
  { id: 0,  title: "Earth Bone",                  year: "2024",    line: "diagrams",   formats: ["installation", "algorithm"] },
  { id: 1,  title: "Filtrar un mar",               year: "2023",    line: "liquid",     formats: ["installation", "performance"] },
  { id: 2,  title: "Possible cone factory",        year: "2022",    line: "liquid",     formats: ["installation", "audio"] },
  { id: 3,  title: "Un Lugar Perfecto",            year: "2021–",   line: "diagrams",   formats: ["video", "installation"] },
  { id: 4,  title: "A.I.R.",                       year: "2020–21", line: "making",     formats: ["installation", "research"] },
  { id: 5,  title: "El lenguaje de la fuente",     year: "2023",    line: "liquid",     formats: ["installation"] },
  { id: 6,  title: "Skeens",                       year: "2019–20", line: "interfaces", formats: ["installation", "data visualization"] },
  { id: 7,  title: "Cartografía Crítica",          year: "2024–",   line: "making",     formats: ["research", "design"] },
  { id: 8,  title: "Au revoir, Appendix",          year: "2021",    line: "diagrams",   formats: ["performance"] },
  { id: 9,  title: "Cartography Choreography",     year: "2020",    line: "interfaces", formats: ["performance", "data visualization"] },
  { id: 10, title: "Birds don't take the train",   year: "2022",    line: "making",     formats: ["workshop", "lecture"] },
  { id: 11, title: "Deriva Metabólica",            year: "2020–",   line: "liquid",     formats: ["research", "installation"] },
];

const lineLabels = {
  liquid:     "Liquid & porous",
  diagrams:   "Operative diagrams",
  interfaces: "Embodied interfaces",
  making:     "Making w/ others",
};

const clusters = {
  liquid:     { cx: 210, cy: 200, color: "#b5a99a", label: "Liquid & porous" },
  diagrams:   { cx: 650, cy: 180, color: "#8a9baa", label: "Operative diagrams" },
  interfaces: { cx: 195, cy: 440, color: "#a8aa8a", label: "Embodied interfaces" },
  making:     { cx: 655, cy: 430, color: "#aa8a9b", label: "Making w/ others" },
};

const offsets = {
  liquid:     [[-62,-38],[22,-68],[72,4],[-38,52],[52,52],[0,-22]],
  diagrams:   [[-58,-22],[32,-55],[62,28],[-18,48]],
  interfaces: [[-52,-20],[38,-40],[50,38]],
  making:     [[-62,-20],[20,-60],[56,20],[6,54]],
};

const formatColors = {
  "installation":       "#c8b89a",
  "performance":        "#9aac9a",
  "research":           "#9aabc8",
  "data visualization": "#c89aac",
  "video":              "#b8c89a",
  "audio":              "#c89ab8",
  "design":             "#aac8b8",
  "workshop":           "#c8c09a",
  "lecture":            "#b09ac8",
  "algorithm":          "#9ab8c8",
};

// ─── STATE ───────────────────────────────────────────────────────────────────

const allFormats = [...new Set(projects.flatMap(p => p.formats))].sort();
const activeFormats = new Set(allFormats);
let currentFilter = "all";
let currentView = "table";
let nodePositions = {};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── CURSOR IMAGE PREVIEW ────────────────────────────────────────────────────

const preview = document.createElement("div");
preview.id = "row-preview";
preview.style.cssText = [
  "position:fixed", "pointer-events:none", "z-index:1000",
  "width:220px", "aspect-ratio:4/3", "background:var(--img-bg,#e8e6e0)",
  "overflow:hidden", "opacity:0", "transition:opacity 0.2s ease"
].join(";");
const previewImg = document.createElement("img");
previewImg.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
preview.appendChild(previewImg);
document.body.appendChild(preview);

document.addEventListener("mousemove", (e) => {
  preview.style.left = (e.clientX + 20) + "px";
  preview.style.top  = (e.clientY - 60) + "px";
});

// ─── TABLE ───────────────────────────────────────────────────────────────────

function buildTable() {
  const tbody = document.querySelector("#view-table tbody");
  tbody.innerHTML = "";

  projects.forEach(p => {
    const tr = document.createElement("tr");
    tr.dataset.lines = p.line;
    // tr.onclick = () => location.href = `projects/${slugify(p.title)}.html`;
    tr.onclick = () => location.href = `/detail.html`;

    const imgSrc = p.img || "";
    tr.addEventListener("mouseenter", () => {
      previewImg.style.display = imgSrc ? "block" : "none";
      if (imgSrc) previewImg.src = imgSrc;
      preview.style.opacity = "1";
    });
    tr.addEventListener("mouseleave", () => {
      preview.style.opacity = "0";
    });

    tr.innerHTML = `
      <td class="row-title">${p.title}</td>
      <td class="row-year">${p.year}</td>
      <td class="row-tags">${p.formats.map(f => `<span class="row-tag">${f}</span>`).join("")}</td>
      <td class="row-line">${lineLabels[p.line]}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ─── FORMAT LEGEND ───────────────────────────────────────────────────────────

function buildFmtLegend() {
  const legend = document.getElementById("fmt-legend");
  legend.innerHTML = "";

  allFormats.forEach(fmt => {
    const color = formatColors[fmt] || "#bbb";
    const el = document.createElement("div");
    el.className = "fmt-tag on";
    el.dataset.fmt = fmt;
    el.style.background = color + "22";
    el.style.borderColor = color + "88";
    el.style.color = "var(--fg)";
    el.innerHTML = `<span class="fmt-swatch" style="background:${color}"></span>${fmt}`;
    el.addEventListener("click", () => toggleFormat(fmt, el));
    legend.appendChild(el);
  });
}

function toggleFormat(fmt, el) {
  if (activeFormats.has(fmt)) {
    activeFormats.delete(fmt);
    el.classList.remove("on");
    el.classList.add("off");
  } else {
    activeFormats.add(fmt);
    el.classList.remove("off");
    el.classList.add("on");
  }
  const svg = document.getElementById("constellation-svg");
  const cls = `fmt-${fmt.replace(/\s+/g, "-")}`;
  svg.querySelectorAll("." + cls).forEach(l => {
    l.style.display = activeFormats.has(fmt) ? "" : "none";
  });
}

// ─── CONSTELLATION ───────────────────────────────────────────────────────────

function buildConstellation(filter) {
  const svg = document.getElementById("constellation-svg");
  svg.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";
  nodePositions = {};

  const visible = projects.filter(p => filter === "all" || p.line === filter);
  const grouped = {};
  visible.forEach(p => {
    if (!grouped[p.line]) grouped[p.line] = [];
    grouped[p.line].push(p);
  });

  Object.entries(grouped).forEach(([line, projs]) => {
    const cl = clusters[line];
    const offs = offsets[line] || [];
    projs.forEach((p, i) => {
      const off = offs[i] || [Math.cos(i * 1.4) * 65, Math.sin(i * 1.4) * 65];
      nodePositions[p.id] = { x: cl.cx + off[0], y: cl.cy + off[1], line };
    });
  });

  let delay = 0;
  const D = 80;

  // Layer 0: cross-cluster faint lines
  [
    ["liquid", "diagrams"], ["liquid", "interfaces"],
    ["diagrams", "making"], ["interfaces", "making"],
    ["liquid", "making"],   ["diagrams", "interfaces"],
  ].forEach(([a, b]) => {
    const ca = clusters[a], cb = clusters[b];
    if (filter !== "all" && a !== filter && b !== filter) return;
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", ca.cx); l.setAttribute("y1", ca.cy);
    l.setAttribute("x2", cb.cx); l.setAttribute("y2", cb.cy);
    l.setAttribute("stroke", "#dddbd3");
    l.setAttribute("stroke-width", "0.5");
    l.setAttribute("stroke-dasharray", "1 8");
    l.classList.add("anim-ring");
    l.style.animationDelay = delay + "ms";
    l.style.animationFillMode = "forwards";
    svg.appendChild(l);
  });
  delay += D;

  // Layer 1: cluster rings + labels
  Object.entries(clusters).forEach(([key, cl]) => {
    if (filter !== "all" && key !== filter) return;

    const ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", cl.cx); ring.setAttribute("cy", cl.cy);
    ring.setAttribute("r", "102");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", cl.color);
    ring.setAttribute("stroke-width", "0.5");
    ring.setAttribute("stroke-dasharray", "2 5");
    ring.classList.add("anim-ring");
    ring.style.animationDelay = delay + "ms";
    ring.style.animationFillMode = "forwards";
    svg.appendChild(ring);

    const lbl = document.createElementNS(ns, "text");
    lbl.setAttribute("x", cl.cx); lbl.setAttribute("y", cl.cy - 112);
    lbl.setAttribute("text-anchor", "middle");
    lbl.setAttribute("font-family", "var(--sans)");
    lbl.setAttribute("font-size", "9");
    lbl.setAttribute("letter-spacing", "0.1em");
    lbl.setAttribute("fill", "#888880");
    lbl.classList.add("anim-ring");
    lbl.style.animationDelay = delay + 40 + "ms";
    lbl.style.animationFillMode = "forwards";
    lbl.textContent = cl.label.toUpperCase();
    svg.appendChild(lbl);
  });
  delay += D;

  // Layer 2: spokes
  Object.entries(grouped).forEach(([line, projs]) => {
    const cl = clusters[line];
    projs.forEach((p, i) => {
      const pos = nodePositions[p.id]; if (!pos) return;
      const spoke = document.createElementNS(ns, "line");
      spoke.setAttribute("x1", cl.cx); spoke.setAttribute("y1", cl.cy);
      spoke.setAttribute("x2", pos.x); spoke.setAttribute("y2", pos.y);
      spoke.setAttribute("stroke", cl.color);
      spoke.setAttribute("stroke-width", "0.5");
      spoke.classList.add("anim-spoke");
      spoke.style.animationDelay = delay + i * 25 + "ms";
      spoke.style.animationFillMode = "forwards";
      svg.appendChild(spoke);
    });
  });
  delay += D * 1.5;

  // Layer 3: format connection lines
  const formatLinks = {};
  visible.forEach(p => p.formats.forEach(fmt => {
    if (!formatLinks[fmt]) formatLinks[fmt] = [];
    formatLinks[fmt].push(p.id);
  }));

  let fmtDelay = delay;
  Object.entries(formatLinks).forEach(([fmt, ids]) => {
    if (ids.length < 2) return;
    const color = formatColors[fmt] || "#bbb";
    const isActive = activeFormats.has(fmt);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = nodePositions[ids[i]], b = nodePositions[ids[j]];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * 18;
        const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * 18;
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "0.8");
        path.setAttribute("stroke-dasharray", "3 5");
        path.setAttribute("class", `fmt-line fmt-${fmt.replace(/\s+/g, "-")}`);
        path.classList.add("anim-fmt");
        path.style.animationDelay = fmtDelay + "ms";
        path.style.animationFillMode = "forwards";
        path.style.display = isActive ? "" : "none";
        fmtDelay += 12;
        svg.appendChild(path);
      }
    }
  });
  delay = fmtDelay + D;

  // Layer 4: nodes
  let nodeDelay = delay;
  Object.entries(grouped).forEach(([line, projs]) => {
    const cl = clusters[line];
    projs.forEach((p, i) => {
      const pos = nodePositions[p.id]; if (!pos) return;
      const ng = document.createElementNS(ns, "g");
      ng.style.cursor = "pointer";
      ng.classList.add("anim-node");
      ng.style.animationDelay = nodeDelay + i * 35 + "ms";
      ng.style.animationFillMode = "forwards";

      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", pos.x); circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", "4.5");
      circle.setAttribute("fill", cl.color);
      circle.setAttribute("stroke", "#f9f8f4");
      circle.setAttribute("stroke-width", "1.5");
      circle.style.transition = "r .2s";

      const labelX = pos.x > 450 ? pos.x - 10 : pos.x + 10;
      const anchor  = pos.x > 450 ? "end" : "start";

      const txt = document.createElementNS(ns, "text");
      txt.setAttribute("x", labelX); txt.setAttribute("y", pos.y + 4);
      txt.setAttribute("text-anchor", anchor);
      txt.setAttribute("font-family", "'DM Serif Display', Georgia, serif");
      txt.setAttribute("font-size", "12");
      txt.setAttribute("font-style", "italic");
      txt.setAttribute("fill", "#1a1a18");
      txt.setAttribute("opacity", "0");
      txt.style.transition = "opacity .2s";
      txt.style.pointerEvents = "none";
      txt.textContent = p.title;

      const yr = document.createElementNS(ns, "text");
      yr.setAttribute("x", labelX); yr.setAttribute("y", pos.y + 17);
      yr.setAttribute("text-anchor", anchor);
      yr.setAttribute("font-family", "'DM Sans', system-ui, sans-serif");
      yr.setAttribute("font-size", "9");
      yr.setAttribute("fill", "#888880");
      yr.setAttribute("opacity", "0");
      yr.style.transition = "opacity .2s";
      yr.style.pointerEvents = "none";
      yr.textContent = p.year;

      ng.addEventListener("mouseenter", () => {
        circle.setAttribute("r", "7");
        txt.setAttribute("opacity", "1");
        yr.setAttribute("opacity", "1");
        svg.querySelectorAll(".fmt-line").forEach(l => {
          if (l.style.display !== "none") l.setAttribute("opacity", "0.1");
        });
        const fmts = p.formats.map(f => `.fmt-${f.replace(/\s+/g, "-")}`).join(",");
        svg.querySelectorAll(fmts).forEach(l => {
          if (l.style.display !== "none") l.setAttribute("opacity", "1");
        });
      });

      ng.addEventListener("mouseleave", () => {
        circle.setAttribute("r", "4.5");
        txt.setAttribute("opacity", "0");
        yr.setAttribute("opacity", "0");
        svg.querySelectorAll(".fmt-line").forEach(l => {
          if (l.style.display !== "none") l.setAttribute("opacity", "0.6");
        });
      });

      ng.addEventListener("click", () => {
        location.href = `projects/${slugify(p.title)}.html`;
      });

      ng.appendChild(circle); ng.appendChild(txt); ng.appendChild(yr);
      svg.appendChild(ng);
    });
    nodeDelay += 40;
  });
}

// ─── FILTERS & VIEW TOGGLE ───────────────────────────────────────────────────

function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  document.querySelectorAll("#view-table tbody tr").forEach(r => {
    if (filter === "all" || r.dataset.lines === filter) r.classList.remove("hidden");
    else r.classList.add("hidden");
  });
  if (currentView === "constellation") buildConstellation(filter);
}

function setView(view, el) {
  currentView = view;
  document.querySelectorAll(".vbtn").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  const tableEl = document.getElementById("view-table");
  const constEl = document.getElementById("view-constellation");
  if (view === "table") {
    tableEl.classList.remove("hidden");
    constEl.style.display = "none";
  } else {
    tableEl.classList.add("hidden");
    constEl.style.display = "block";
    buildConstellation(currentFilter);
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────

buildTable();
buildFmtLegend();