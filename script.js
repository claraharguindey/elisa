// ─── DATA ────────────────────────────────────────────────────────────────────

const projects = [
  {
    id: 0,
    title: "Earth Bone",
    year: "2024",
    line: "diagrams",
    formats: ["installation", "algorithm"],
    img: "",
  },
  {
    id: 1,
    title: "Filtrar un mar",
    year: "2023",
    line: "liquid",
    formats: ["installation", "performance"],
    img: "",
  },
  {
    id: 2,
    title: "Possible cone factory",
    year: "2022",
    line: "liquid",
    formats: ["installation", "audio"],
    img: "",
  },
  {
    id: 3,
    title: "Un Lugar Perfecto",
    year: "2021–",
    line: "diagrams",
    formats: ["video", "installation"],
    img: "",
  },
  {
    id: 4,
    title: "A.I.R.",
    year: "2020–21",
    line: "making",
    formats: ["installation", "research"],
    img: "",
  },
  {
    id: 5,
    title: "El lenguaje de la fuente",
    year: "2023",
    line: "liquid",
    formats: ["installation"],
    img: "",
  },
  {
    id: 6,
    title: "Skeens",
    year: "2019–20",
    line: "interfaces",
    formats: ["installation", "data visualization"],
    img: "",
  },
  {
    id: 7,
    title: "Cartografía Crítica",
    year: "2024–",
    line: "making",
    formats: ["research", "design"],
    img: "",
  },
  {
    id: 8,
    title: "Au revoir, Appendix",
    year: "2021",
    line: "diagrams",
    formats: ["performance"],
    img: "",
  },
  {
    id: 9,
    title: "Cartography Choreography",
    year: "2020",
    line: "interfaces",
    formats: ["performance", "data visualization"],
    img: "",
  },
  {
    id: 10,
    title: "Birds don't take the train",
    year: "2022",
    line: "making",
    formats: ["workshop", "lecture"],
    img: "",
  },
  {
    id: 11,
    title: "Deriva Metabólica",
    year: "2020–",
    line: "liquid",
    formats: ["research", "installation"],
    img: "",
  },
];

// Líneas de investigación — color propio para las conexiones. Escalable.
const researchLines = {
  liquid: { label: "Liquid & porous", color: "#5DA9E9" }, // azul claro vivo
  diagrams: { label: "Operative diagrams", color: "#C77DFF" }, // violeta luminoso
  interfaces: { label: "Embodied interfaces", color: "#38B000" }, // verde intenso
  making: { label: "Making w/ others", color: "#FF9F1C" }, // naranja brillante
};
const formatColors = {
  installation: "#1d1c1c",
  performance: "#1d1c1c",
  research: "#1d1c1c",
  "data visualization": "#1d1c1c",
  video: "#1d1c1c",
  audio: "#1d1c1c",
  design: "#1d1c1c",
  workshop: "#1d1c1c",
  lecture: "#1d1c1c",
  algorithm: "#1d1c1c",
};

const lineLabels = Object.fromEntries(
  Object.entries(researchLines).map(([k, v]) => [k, v.label]),
);

// Posiciones gestionadas por d3.forceSimulation — no hay coordenadas fijas

// ─── STATE ───────────────────────────────────────────────────────────────────

const allFormats = [...new Set(projects.flatMap((p) => p.formats))].sort();
const activeLines = new Set(Object.keys(researchLines));
let activeFormats = new Set(allFormats);
let currentLine = "all";
let currentView = "gallery";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isAllActive() {
  return activeFormats.size === allFormats.length;
}

function projectVisible(p) {
  const lineOk = currentLine === "all" || p.line === currentLine;

  const formatOk = isAllActive() || p.formats.some((f) => activeFormats.has(f));

  return lineOk && formatOk;
}

// ─── CURSOR IMAGE PREVIEW ────────────────────────────────────────────────────

const preview = document.createElement("div");
preview.id = "row-preview";
preview.style.cssText = [
  "position:fixed",
  "pointer-events:none",
  "z-index:1000",
  "width:220px",
  "aspect-ratio:4/3",
  "background:var(--img-bg,#e8e6e0)",
  "overflow:hidden",
  "opacity:0",
  "transition:opacity 0.2s ease",
].join(";");
const previewImg = document.createElement("img");
previewImg.style.cssText =
  "width:100%;height:100%;object-fit:cover;display:block;";
preview.appendChild(previewImg);
document.body.appendChild(preview);

document.addEventListener("mousemove", (e) => {
  preview.style.left = e.clientX + 20 + "px";
  preview.style.top = e.clientY - 60 + "px";
});

function showPreview(src) {
  previewImg.style.display = src ? "block" : "none";
  if (src) previewImg.src = src;
  preview.style.opacity = "1";
}
function hidePreview() {
  preview.style.opacity = "0";
}

// ─── FORMAT FILTERS ──────────────────────────────────────────────────────────

function buildFormatFilters() {
  const group = document.getElementById("format-filters");

  const allTag = document.createElement("span");
  allTag.className = "tag active";
  allTag.textContent = "ALL";
  allTag.dataset.type = "all";

  allTag.onclick = () => {
    activeFormats = new Set(allFormats);
    document.querySelectorAll("#format-filters .tag[data-type='format']")
      .forEach(t => t.classList.remove("active"));
    allTag.classList.add("active");
    applyFilters();
  };

  group.appendChild(allTag);

  allFormats.forEach((fmt) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = fmt;
    tag.dataset.type = "format";

    tag.onclick = () => {
      // Desmarcar ALL
      allTag.classList.remove("active");

      if (activeFormats.size === allFormats.length) {
        // Primera selección individual: mostrar solo este
        activeFormats = new Set([fmt]);
        document.querySelectorAll("#format-filters .tag[data-type='format']")
          .forEach(t => t.classList.remove("active"));
        tag.classList.add("active");
      } else if (activeFormats.has(fmt)) {
        activeFormats.delete(fmt);
        tag.classList.remove("active");
        // Si queda vacío, volver a ALL
        if (activeFormats.size === 0) {
          activeFormats = new Set(allFormats);
          allTag.classList.add("active");
        }
      } else {
        activeFormats.add(fmt);
        tag.classList.add("active");
      }

      applyFilters();
    };

    group.appendChild(tag);
  });
}

function buildLineFilters() {
  const group = document.querySelector(".filter-group:first-child");
  const allTag = group.querySelector('.tag[onclick*="all"]');
  group.innerHTML = "";
  group.appendChild(
    document.querySelector(".filter-label") ||
      (() => {
        const l = document.createElement("span");
        l.className = "filter-label";
        l.textContent = "Research line";
        return l;
      })(),
  );

  const all = document.createElement("span");
  all.className = "tag active";
  all.textContent = "All";
  all.onclick = () => setFilter("all", all);
  group.appendChild(all);

  Object.entries(researchLines).forEach(([key, rl]) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `<span class="line-dot" style="background:${rl.color}"></span>${rl.label}`;
    tag.onclick = () => setFilter(key, tag);
    group.appendChild(tag);
  });
}

function applyFilters() {
  document.querySelectorAll("#view-table tbody tr").forEach((r) => {
    r.classList.toggle("hidden", !projectVisible(projects[+r.dataset.id]));
  });
  document.querySelectorAll(".gallery-card").forEach((c) => {
    c.classList.toggle("hidden", !projectVisible(projects[+c.dataset.id]));
  });
  if (currentView === "constellation") buildConstellation();
}

// ─── TABLE ───────────────────────────────────────────────────────────────────

function buildTable() {
  const tbody = document.querySelector("#view-table tbody");
  tbody.innerHTML = "";
  projects.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.dataset.id = i;
    tr.dataset.lines = p.line;
    tr.onclick = () => (location.href = `projects/${slugify(p.title)}.html`);
    tr.addEventListener("mouseenter", () => showPreview(p.img));
    tr.addEventListener("mouseleave", hidePreview);
    tr.innerHTML = `
      <td class="row-title">${p.title}</td>
      <td class="row-year">${p.year}</td>
      <td class="row-tags">${p.formats.map((f) => `<span class="row-tag">${f}</span>`).join("")}</td>
      <td class="row-line"><span class="line-dot" style="background:${researchLines[p.line]?.color || "#bbb"}"></span>${lineLabels[p.line]}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────

// Aspect ratios variados por id — cuando haya imágenes reales se quitan
const imgRatios = [
  "16/9",
  "3/4",
  "1/1",
  "4/3",
  "3/4",
  "16/9",
  "4/3",
  "3/4",
  "1/1",
  "3/4",
  "4/3",
  "16/9",
];

function buildGallery() {
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";
  projects.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.dataset.id = i;
    card.dataset.lines = p.line;
    card.onclick = () => (location.href = `projects/${slugify(p.title)}.html`);
    card.innerHTML = `
      <div class="gallery-img" style="aspect-ratio:${imgRatios[i % imgRatios.length]};${p.img ? `background-image:url(${p.img})` : ""}"></div>
      <div class="gallery-overlay">
        <div class="gallery-info">
          <div class="gallery-meta">
            <span class="pub-type">${p.formats[0]}</span>
            <span class="row-year">${p.year}</span>
          </div>
          <div class="gallery-title">${p.title}</div>
          <div class="gallery-line">${lineLabels[p.line]}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── LINE LEGEND ─────────────────────────────────────────────────────────────

function buildLineLegend() {
  const legend = document.getElementById("line-legend");
  legend.innerHTML = "";
  Object.entries(researchLines).forEach(([key, rl]) => {
    const el = document.createElement("div");
    el.className = "line-legend-item on";
    el.dataset.line = key;

    const dot = document.createElement("span");
    dot.className = "line-dot";
    dot.style.background = rl.color;

    const lbl = document.createElement("span");
    lbl.textContent = rl.label;

    el.appendChild(dot);
    el.appendChild(lbl);
    el.addEventListener("click", () => toggleLine(key, el));
    legend.appendChild(el);
  });
}

function toggleLine(key, el) {
  if (activeLines.has(key)) {
    activeLines.delete(key);
    el.classList.remove("on");
    el.classList.add("off");
  } else {
    activeLines.add(key);
    el.classList.remove("off");
    el.classList.add("on");
  }
  const svg = document.getElementById("constellation-svg");
  svg.querySelectorAll(`[data-research-line="${key}"]`).forEach((g) => {
    g.style.display = activeLines.has(key) ? "" : "none";
  });
}

function buildFmtLegend() {
  const legend = document.getElementById("fmt-legend");
  legend.innerHTML = "";
  allFormats.forEach((fmt) => {
    const color = formatColors[fmt] || "#bbb";
    const el = document.createElement("div");
    el.className = "fmt-tag";
    el.innerHTML = `<span class="fmt-swatch" style="background:${color}"></span>${fmt}`;
    legend.appendChild(el);
  });
}

// ─── CONSTELLATION ───────────────────────────────────────────────────────────
// D3 force simulation — los nodos se distribuyen solos, escalable sin coords fijas

let simulation = null;

function buildConstellation() {
  if (typeof d3 === "undefined") {
    console.warn("D3 no cargado");
    return;
  }

  const container = document.getElementById("view-constellation");
  const W = container.clientWidth || window.innerWidth;
  const H = window.innerHeight - container.getBoundingClientRect().top - 16;

  const svgEl = document.getElementById("constellation-svg");
  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.setAttribute("width", W);
  svgEl.setAttribute("height", H);
  svgEl.style.display = "block";

  if (simulation) simulation.stop();
  const svg = d3.select("#constellation-svg");
  svg.selectAll("*").remove();

  const visible = projects.filter((p) => projectVisible(p));

  // Construir links
  const links = [];
  const grouped = {};
  visible.forEach((p) => {
    if (!grouped[p.line]) grouped[p.line] = [];
    grouped[p.line].push(p);
  });

  // Links de línea — conectan proyectos de la misma línea (fuerza fuerte)
  Object.entries(grouped).forEach(([line, projs]) => {
    for (let i = 0; i < projs.length; i++) {
      for (let j = i + 1; j < projs.length; j++) {
        links.push({
          source: projs[i].id,
          target: projs[j].id,
          line,
          type: "line",
        });
      }
    }
  });

  // Links de formato — conectan proyectos de distintas líneas que comparten formato (fuerza débil)
  const formatMap = {};
  visible.forEach((p) => {
    p.formats.forEach((fmt) => {
      if (!formatMap[fmt]) formatMap[fmt] = [];
      formatMap[fmt].push(p);
    });
  });
  Object.entries(formatMap).forEach(([fmt, projs]) => {
    for (let i = 0; i < projs.length; i++) {
      for (let j = i + 1; j < projs.length; j++) {
        if (projs[i].line !== projs[j].line) {
          links.push({
            source: projs[i].id,
            target: projs[j].id,
            line: "format",
            type: "format",
            fmt,
          });
        }
      }
    }
  });

  // Nodos con posición inicial aleatoria centrada
  const nodes = visible.map((p) => ({
    id: p.id,
    title: p.title,
    year: p.year,
    line: p.line,
    formats: p.formats,
    x: W / 2 + (Math.random() - 0.5) * 200,
    y: H / 2 + (Math.random() - 0.5) * 200,
  }));
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Capa de links de formato (puentes entre líneas) — siempre visible, muy tenue
  const formatLinkG = svg.append("g").attr("class", "format-links");
  const formatLinkSel = formatLinkG
    .selectAll("line")
    .data(links.filter((l) => l.type === "format"))
    .enter()
    .append("line")
    .attr("stroke", "#0a0a0a")
    .attr("stroke-width", 0.4)
    .attr("opacity", 0.35)
    .attr("stroke-dasharray", "2 4");

  // Capas de links de línea — una por línea para poder activar/desactivar
  const linkGroups = {};
  Object.keys(researchLines).forEach((line) => {
    const g = svg
      .append("g")
      .attr("data-research-line", line)
      .style("display", activeLines.has(line) ? "" : "none");
    linkGroups[line] = g;
  });

  const linkSels = {};
  Object.entries(researchLines).forEach(([line, rl]) => {
    linkSels[line] = linkGroups[line]
      .selectAll("line")
      .data(links.filter((l) => l.line === line))
      .enter()
      .append("line")
      .attr("stroke", rl.color)
      .attr("stroke-width", 0.8)
      .attr("opacity", 0.55);
  });

  // Capa de nodos (encima de todos los links)
  const nodeG = svg.append("g");

  const nodeEls = nodeG
    .selectAll("g.node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("cursor", "pointer")
    .on("click", (e, d) => {
      location.href = `projects/${slugify(d.title)}.html`;
    });

  nodeEls
    .append("circle")
    .attr("r", 5)
    .attr("fill", (d) => formatColors[d.formats[0]] || "#bbb")
    .attr("stroke", "#f9f8f4")
    .attr("stroke-width", 1.5)
    .style("transition", "r .2s");

  const labelG = nodeEls
    .append("g")
    .attr("class", "node-label")
    .style("opacity", 0)
    .style("pointer-events", "none");

  labelG
    .append("text")
    .text((d) => d.title)
    .attr("font-family", "'DM Serif Display', Georgia, serif")
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .attr("fill", "#1a1a18")
    .attr("dy", 4);

  labelG
    .append("text")
    .text((d) => d.year)
    .attr("font-family", "'DM Sans', system-ui, sans-serif")
    .attr("font-size", 9)
    .attr("fill", "#888880")
    .attr("dy", 17);

  nodeEls
    .on("mouseenter", function () {
      d3.select(this).select("circle").attr("r", 7);
      d3.select(this).select(".node-label").style("opacity", 1);
    })
    .on("mouseleave", function () {
      d3.select(this).select("circle").attr("r", 5);
      d3.select(this).select(".node-label").style("opacity", 0);
    });

  // Simulación de fuerzas
  simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => (d.type === "format" ? W * 0.35 : W * 0.22))
        .strength((d) => (d.type === "format" ? 0.03 : 0.15)),
    )
    .force("charge", d3.forceManyBody().strength(-W * 0.6))
    .force("center", d3.forceCenter(W / 2, H / 2).strength(0.04))
    .force("collision", d3.forceCollide(40))
    .force("bounds", () => {
      nodes.forEach((n) => {
        n.x = Math.max(60, Math.min(W - 60, n.x));
        n.y = Math.max(40, Math.min(H - 40, n.y));
      });
    })
    .on("tick", () => {
      // Actualizar posición de links de formato
      formatLinkSel
        .attr("x1", (d) => nodeById[d.source.id ?? d.source]?.x ?? 0)
        .attr("y1", (d) => nodeById[d.source.id ?? d.source]?.y ?? 0)
        .attr("x2", (d) => nodeById[d.target.id ?? d.target]?.x ?? 0)
        .attr("y2", (d) => nodeById[d.target.id ?? d.target]?.y ?? 0);

      // Actualizar posición de links de línea
      Object.entries(linkSels).forEach(([line, sel]) => {
        sel
          .attr("x1", (d) => nodeById[d.source.id ?? d.source]?.x ?? 0)
          .attr("y1", (d) => nodeById[d.source.id ?? d.source]?.y ?? 0)
          .attr("x2", (d) => nodeById[d.target.id ?? d.target]?.x ?? 0)
          .attr("y2", (d) => nodeById[d.target.id ?? d.target]?.y ?? 0);
      });

      // Actualizar posición de nodos
      nodeEls.attr("transform", (d) => {
        const lx = d.x > W / 2 ? -10 : 10;
        const anchor = d.x > W / 2 ? "end" : "start";
        d3.select(nodeEls.nodes()[nodes.indexOf(d)])
          .select(".node-label")
          .attr("transform", `translate(${lx}, 0)`)
          .selectAll("text")
          .attr("text-anchor", anchor);
        return `translate(${d.x},${d.y})`;
      });
    });

  // Redibujar al cambiar tamaño
  window.addEventListener(
    "resize",
    () => {
      if (
        document.getElementById("view-constellation").style.display !== "none"
      ) {
        buildConstellation();
      }
    },
    { once: true },
  );
}

// ─── FILTERS & VIEW TOGGLE ───────────────────────────────────────────────────

function setFilter(filter, el) {
  currentLine = filter;
  document
    .querySelectorAll(".filter-group:first-child .tag")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  applyFilters();
}

function setView(view, el) {
  currentView = view;
  document
    .querySelectorAll(".vbtn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("view-table").style.display =
    view === "table" ? "block" : "none";
  document.getElementById("view-gallery").style.display =
    view === "gallery" ? "block" : "none";
  document.getElementById("view-constellation").style.display =
    view === "constellation" ? "block" : "none";
  if (view === "constellation") buildConstellation();
}

// ─── INIT ────────────────────────────────────────────────────────────────────

buildTable();
buildGallery();
buildFormatFilters();
buildLineFilters();