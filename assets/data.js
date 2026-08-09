// MeetProsody — data extracted from the camera-ready paper
// Sood, Gardiner & Condell, "How Far Does Audio Help Meeting Summarisation?
// The Limited Role of Prosody in Speech LLMs" (UKCI 2026)
// All numbers transcribed directly from the paper's Tables 1–3 and text.

const DATA = {
  // ---- Three research questions ----
  rqs: [
    { n: 1, q: "Does direct audio input improve meeting summarisation over a duration-matched transcript — and if so, where?",
      a: "Real but narrow.",
      detail: "Audio gives a semantic edge on AMI's commitment-bearing sections, but that shrinks to parity on ICSI and text wins on lexical overlap. The advantage is corpus- and section-specific, not a general property of the audio channel." },
    { n: 2, q: "Where across the speech-to-language interface is prosodic information retained or lost?",
      a: "Lost at the adapter.",
      detail: "Linear probing shows energy is recoverable before the multimodal adapter but collapses after it; pause partially survives; pitch is never linearly recoverable. The 4:1 adapter compression is the bottleneck." },
    { n: 3, q: "Are these prosodic cues necessary for the summary — do they explain any audio advantage?",
      a: "No — a clean null.",
      detail: "Flattening pitch, energy, or pause leaves summary quality unchanged, verified with equivalence testing and a positive control. The surviving prosody is redundant with the words once a strong 24B decoder is in place." }
  ],

  // ---- The controlled setup ----
  setup: {
    model: "Voxtral-Small-24B-2507",
    hardware: "single NVIDIA A100 80GB, bfloat16, greedy decoding",
    cap: "40-minute duration-matched cap",
    corpora: [
      { name: "AMI", meetings: 20, avgLen: "35.31 min", type: "Scenario meetings", truncated: "6 of 20 meetings" },
      { name: "ICSI", meetings: 6, avgLen: "57.62 min", type: "Naturalistic research meetings", truncated: "all 6 meetings" }
    ],
    sections: ["Abstract", "Decisions", "Actions / Progress", "Problems"],
    note: "Both conditions carry identical lexical content over the same span, so any difference is attributable to the channel rather than coverage. The text condition uses the manual reference transcript — an error-free upper bound, not an ASR cascade."
  },

  // ---- Screening experiment (why Voxtral-Small-24B) ----
  screening: [
    { model: "Voxtral-Mini-3B", family: "Mistral", result: "At parity — no audio advantage", chosen: false },
    { model: "Phi-4-multimodal", family: "Microsoft", result: "Favoured text on lexical overlap (−0.042)", chosen: false },
    { model: "Voxtral-Small-24B", family: "Mistral", result: "Only model with a positive audio edge on both metrics (+0.008 ROUGE-Lsum, +0.009 BERTScore; +0.020 / +0.012 on commitment sections)", chosen: true }
  ],

  // ---- Table 1: Audio vs Text, per section, per corpus ----
  // metric mean values; audio vs text; bold = better condition (from the paper)
  audioVsText: {
    sections: ["Abstract", "Decisions", "Act./Prog.", "Problems"],
    AMI: {
      rouge:  { audio: [0.214, 0.294, 0.312, 0.229], text: [0.239, 0.312, 0.269, 0.194] },
      bert:   { audio: [0.856, 0.870, 0.885, 0.873], text: [0.856, 0.862, 0.873, 0.858] }
    },
    ICSI: {
      rouge:  { audio: [0.260, 0.227, 0.219, 0.220], text: [0.242, 0.276, 0.267, 0.264] },
      bert:   { audio: [0.856, 0.856, 0.852, 0.852], text: [0.855, 0.850, 0.847, 0.854] }
    }
  },

  // ---- Paired audio−text differences with 95% CIs (BERTScore, AMI) ----
  pairedDiffs: [
    { section: "Abstract",   diff: "+.001", ci: "[−.002, +.004]", verdict: "parity" },
    { section: "Decisions",  diff: "+.008", ci: "[+.004, +.013]", verdict: "audio" },
    { section: "Actions",    diff: "+.013", ci: "[+.003, +.021]", verdict: "audio" },
    { section: "Problems",   diff: "+.015", ci: "[+.011, +.019]", verdict: "audio" }
  ],

  // ---- Probing results (Table text, Section 4.2) ----
  probing: {
    rankDrop: { before: 327, after: 82 },
    features: [
      { name: "Energy (RMS)", ami_pre: "0.71", ami_post: "collapses", icsi_pre: "0.39", icsi_post: "collapses", metric: "R²", verdict: "Lost at adapter" },
      { name: "Pause / timing", ami_pre: "0.96", ami_post: "0.89", icsi_pre: "0.92", icsi_post: "0.82", metric: "AUROC", verdict: "Partially survives" },
      { name: "Pitch (F0)", ami_pre: "≤ 0", ami_post: "≤ 0", icsi_pre: "≤ 0", icsi_post: "≤ 0", metric: "R²", verdict: "Never recoverable" }
    ],
    note: "The 4:1 adapter compression collapses the representation's effective rank from 327 to 82 — an information bottleneck that preserves linguistic content while attenuating fine acoustic detail. Every PRE→POST drop is significant in both corpora."
  },

  // ---- LLM judge results (Table 2 summary) ----
  judges: {
    j1: "Claude Opus 4.8",
    j2: "GPT-5.5",
    agreement: "κ = 0.64",
    agreementNote: "Quadratic-weighted agreement between the two judges — substantial. Both were kept blind to modality.",
    tradeoff: [
      { dim: "Coverage", winner: "Text", note: "Text scores above audio in every section on both corpora — partly because text summaries are longer and cover more reference content." },
      { dim: "Factuality", winner: "Audio (AMI only)", note: "Both judges place audio above text on AMI decisions (4.35 / 4.10 vs 3.95 / 4.00). Does not generalise to ICSI." },
      { dim: "Relevance", winner: "Close", note: "Near-tied throughout both corpora." },
      { dim: "Groundedness", winner: "Close", note: "Near-tied, with text perfectly grounded on ICSI." }
    ]
  },

  // ---- Ablation (Table 3) — the null result ----
  ablation: {
    headline: "Removing pitch, energy, or pause leaves quality unchanged.",
    checks: [
      { title: "Equivalence testing", body: "On AMI, BERTScore manipulations are statistically equivalent to no effect within a 0.01 margin (TOST, p<0.05, all sections)." },
      { title: "Manipulation strength", body: "Each ablation was verified strong before any null was trusted — e.g. F0 spread collapsed from ≈21 Hz to ≈2.4 Hz. Pitch also passed through WORLD resynthesis, making the test conservative." },
      { title: "Positive control", body: "The manipulations altered the generated text in 79 of 80 AMI meeting-sections without changing quality — the model responds to the perturbation but doesn't use prosody to improve correctness." }
    ],
    conclusion: "Audio primarily affects how information is expressed, not what information is captured."
  },

  // ---- Key takeaways ----
  takeaways: [
    { short: "A bounded advantage", text: "Audio's benefit over text is real but narrow — a semantic edge on AMI that doesn't generalise to ICSI." },
    { short: "A coverage–fidelity trade-off", text: "Text covers more content; audio is marginally more faithful per asserted decision. Neither dominates." },
    { short: "Prosody isn't the reason", text: "Pitch, energy, and pause are attenuated at the adapter and redundant with the words — they don't explain the AMI edge." },
    { short: "Look elsewhere in the signal", text: "The residual advantage likely lives in speaker identity, overlap, and turn-taking — richer interactional cues, untested here." }
  ],

  // ---- Limitations ----
  limitations: [
    "Mechanistic findings rest on a single architecture (Voxtral-Small-24B); the bottleneck is a property of this adapter design and may not generalise. No adapter-free speech LLM exists at this scale.",
    "The 40-minute cap leaves longer meetings unexamined — all six ICSI meetings were truncated, possibly understating any audio advantage.",
    "Both corpora are English; prosody carries language-dependent functions in tonal and pitch-accent languages, so the redundancy finding may not hold cross-linguistically.",
    "Probes are linear and ablations test necessity, not sufficiency — nonlinear structure may exist that this approach can't detect."
  ],

  // ---- Future work ----
  futureWork: [
    "Identify which non-prosodic acoustic cues direct speech processing preserves — speaker identity, overlap, turn-taking, voice quality.",
    "Test whether adapters that retain more acoustic detail widen the narrow advantage observed here.",
    "Move beyond traditional prosodic cues toward richer interactional and discourse-level information from the speech signal."
  ]
};
