/* MeetProsody interactive companion — vanilla JS, no build step */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const SIGNAL = "#4dd0b1", AMBER = "#f2b45c", INK = "#eef2fb", INKSOFT = "#9aa8c4", LINE = "#2a3752", BG = "#0e1524";

  document.addEventListener("DOMContentLoaded", () => {
    drawWaves();
    renderRQs();
    renderSetup();
    renderProbing();
    renderJudges();
    renderAblation();
    renderTakeaways();
    renderScreening();
    renderLimitations();
    buildExplorer();
    setupReveal();
  });

  /* ---------- Waveform SVGs ---------- */
  function wavePath(amps, w = 400, h = 56) {
    const mid = h / 2, n = amps.length, step = w / (n - 1);
    let d = "";
    amps.forEach((a, i) => {
      const x = i * step, y1 = mid - a * mid, y2 = mid + a * mid;
      d += `M${x.toFixed(1)},${y1.toFixed(1)} L${x.toFixed(1)},${y2.toFixed(1)} `;
    });
    return d;
  }
  function drawWaves() {
    // audio: varied amplitudes (rich prosody)
    const audioAmps = [];
    for (let i = 0; i < 64; i++) {
      const env = Math.sin(i / 6) * 0.5 + 0.5;
      const jit = (Math.sin(i * 1.7) * 0.3 + Math.sin(i * 0.9) * 0.4);
      audioAmps.push(Math.max(0.08, Math.min(0.95, env * 0.6 + Math.abs(jit) * 0.5)));
    }
    // text: near-flat (prosody discarded) but present
    const textAmps = [];
    for (let i = 0; i < 64; i++) textAmps.push(0.12 + (i % 2 ? 0.03 : 0));

    injectWave("#wave-audio", audioAmps, SIGNAL);
    injectWave("#wave-text", textAmps, AMBER);
  }
  function injectWave(sel, amps, color) {
    const svg = $(sel);
    svg.innerHTML = `<path d="${wavePath(amps)}" stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9"/>`;
  }

  /* ---------- Research questions ---------- */
  function renderRQs() {
    const g = $("#rq-grid");
    DATA.rqs.forEach(r => {
      g.appendChild(el("div", "rq",
        `<div class="tag">RQ${r.n}</div>
         <div class="q">${r.q}</div>
         <div class="a">${r.a}</div>
         <div class="d">${r.detail}</div>`));
    });
  }

  /* ---------- Setup band + corpora ---------- */
  function renderSetup() {
    const s = DATA.setup;
    const band = $("#setup-band");
    band.appendChild(el("div", "scard", `<div class="k">Model</div><div class="v">${s.model}</div><div class="n">${s.hardware}</div>`));
    band.appendChild(el("div", "scard", `<div class="k">Comparison</div><div class="v">${s.cap}</div><div class="n">Identical lexical content, channel is the only variable</div>`));
    band.appendChild(el("div", "scard", `<div class="k">Sections scored</div><div class="v">4 labelled sections</div><div class="n">${s.sections.join(" · ")}</div>`));
    $("#setup-note").textContent = s.note;

    const c = $("#corpora");
    s.corpora.forEach(x => {
      c.appendChild(el("div", "corp",
        `<h4>${x.name}</h4>
         <div class="row"><span>Meetings</span><b>${x.meetings}</b></div>
         <div class="row"><span>Avg length</span><b>${x.avgLen}</b></div>
         <div class="row"><span>Type</span><b>${x.type}</b></div>
         <div class="row"><span>Truncated by 40-min cap</span><b>${x.truncated}</b></div>`));
    });
  }

  /* ---------- Probing ---------- */
  function renderProbing() {
    const p = DATA.probing;
    // rank bars: before=327 is full height, kept short enough to clear the label
    const maxH = 110;
    $("#rank-pre").style.height = maxH + "px";
    $("#rank-post").style.height = Math.round(maxH * p.rankDrop.after / p.rankDrop.before) + "px";
    $("#rank-pre-n").textContent = p.rankDrop.before;
    $("#rank-post-n").textContent = p.rankDrop.after;

    const tb = $("#probe-table tbody");
    p.features.forEach(f => {
      const cls = f.verdict.includes("Lost") ? "lost" : f.verdict.includes("Partial") ? "partial" : "never";
      tb.appendChild(el("tr", null,
        `<td><b>${f.name}</b><br><span style="font-size:.74rem;color:${INKSOFT}">${f.metric}</span></td>
         <td>${f.ami_pre} → ${f.ami_post}</td>
         <td>${f.icsi_pre} → ${f.icsi_post}</td>
         <td><span class="vpill ${cls}">${f.verdict}</span></td>`));
    });
    $("#probe-note").textContent = p.note;
  }

  /* ---------- Judges ---------- */
  function renderJudges() {
    const j = DATA.judges;
    const g = $("#tradeoff");
    j.tradeoff.forEach(t => {
      const cls = t.winner.startsWith("Text") ? "text" : t.winner.startsWith("Audio") ? "audio" : "close";
      g.appendChild(el("div", "tocard",
        `<div><span class="dim">${t.dim}</span><span class="win ${cls}">${t.winner}</span></div><p>${t.note}</p>`));
    });
    $("#kappa").innerHTML = `Judges: <b>${j.j1}</b> and <b>${j.j2}</b> · agreement <b style="color:var(--signal);font-family:var(--mono)">${j.agreement}</b> — ${j.agreementNote}`;
  }

  /* ---------- Ablation ---------- */
  function renderAblation() {
    const a = DATA.ablation;
    $("#null-headline").textContent = a.headline;
    $("#null-sub").textContent = "BERTScore stays within 0.007 of baseline in both corpora; ROUGE-Lsum deltas are small and unsystematic.";
    const g = $("#checks");
    a.checks.forEach(c => g.appendChild(el("div", "check", `<div class="ct">${c.title}</div><p>${c.body}</p>`)));
    $("#null-concl").textContent = a.conclusion;
  }

  /* ---------- Takeaways ---------- */
  function renderTakeaways() {
    const g = $("#takeaways-grid");
    DATA.takeaways.forEach((t, i) => {
      g.appendChild(el("div", "take", `<div class="n">0${i + 1}</div><div class="t">${t.short}</div><p>${t.text}</p>`));
    });
  }

  /* ---------- Screening ---------- */
  function renderScreening() {
    const g = $("#screen-grid");
    DATA.screening.forEach(s => {
      g.appendChild(el("div", "sccard" + (s.chosen ? " chosen" : ""),
        `<div class="mn">${s.model}</div><div class="mf">${s.family}</div><div class="mr">${s.result}</div>${s.chosen ? '<span class="pick">★ Selected for the study</span>' : ''}`));
    });
  }

  /* ---------- Limitations + future ---------- */
  function renderLimitations() {
    const lim = $("#limitations"), fut = $("#futurework");
    DATA.limitations.forEach(x => lim.appendChild(el("li", null, x)));
    DATA.futureWork.forEach(x => fut.appendChild(el("li", null, x)));
  }

  /* ---------- Interactive audio-vs-text explorer ---------- */
  let chart, curCorpus = "AMI", curMetric = "bert";
  const NOTES = {
    "AMI-bert": "On AMI, audio matches or exceeds text semantically in every commitment-bearing section — Decisions, Actions, and Problems all show a paired difference excluding zero.",
    "AMI-rouge": "Lexically on AMI the pattern is mixed: audio leads on Problems, but text reuses more exact gold wording in the Abstract — the audio condition paraphrases more while preserving meaning.",
    "ICSI-bert": "On ICSI the semantic edge narrows to parity — no section shows a reliable audio advantage. The benefit does not generalise from AMI.",
    "ICSI-rouge": "On naturalistic ICSI the clean transcript wins decisively, leading on Decisions, Progress, and Problems, and winning the per-meeting mean on all six meetings."
  };

  function buildExplorer() {
    const ct = $("#corpus-toggle"), mt = $("#metric-toggle");
    ["AMI", "ICSI"].forEach((c, i) => {
      const b = el("button", "tbtn" + (i === 0 ? " active" : ""), c);
      b.onclick = () => { curCorpus = c; [...ct.children].forEach(x => x.classList.remove("active")); b.classList.add("active"); drawAVT(); };
      ct.appendChild(b);
    });
    [["bert", "BERTScore"], ["rouge", "ROUGE-Lsum"]].forEach(([k, label], i) => {
      const b = el("button", "tbtn" + (i === 0 ? " active" : ""), label);
      b.onclick = () => { curMetric = k; [...mt.children].forEach(x => x.classList.remove("active")); b.classList.add("active"); drawAVT(); };
      mt.appendChild(b);
    });
    drawAVT();
  }

  function drawAVT() {
    const d = DATA.audioVsText;
    const labels = d.sections;
    const md = d[curCorpus][curMetric];
    $("#avt-note").textContent = NOTES[curCorpus + "-" + curMetric];

    // BERTScore values cluster near 0.85; give it a tight axis. ROUGE is spread 0.19–0.31.
    const isBert = curMetric === "bert";
    const cfg = {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Audio", data: md.audio, backgroundColor: SIGNAL, borderRadius: 5, barPercentage: 0.7, categoryPercentage: 0.72 },
          { label: "Text", data: md.text, backgroundColor: AMBER, borderRadius: 5, barPercentage: 0.7, categoryPercentage: 0.72 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0b1120", titleColor: INK, bodyColor: INK, borderColor: LINE, borderWidth: 1, padding: 10,
            callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y.toFixed(3)}` }
          }
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,.04)" }, ticks: { color: INKSOFT, font: { family: "'JetBrains Mono', monospace", size: 11 } } },
          y: {
            beginAtZero: !isBert,
            min: isBert ? 0.83 : 0.15,
            max: isBert ? 0.90 : 0.35,
            grid: { color: "rgba(255,255,255,.06)" },
            ticks: { color: INKSOFT, font: { family: "'JetBrains Mono', monospace" } },
            title: { display: true, text: isBert ? "BERTScore F1" : "ROUGE-Lsum", color: INKSOFT, font: { size: 11 } }
          }
        }
      }
    };
    if (chart) chart.destroy();
    chart = new Chart($("#avtChart"), cfg);
  }

  /* ---------- reveal ---------- */
  function setupReveal() {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(n => io.observe(n));
  }
})();
