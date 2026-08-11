# MeetProsody

An interactive companion page for the paper *How Far Does Audio Help Meeting Summarisation? The Limited Role of Prosody in Speech LLMs* (Sood, Gardiner & Condell), accepted at **UKCI 2026** (25th UK Workshop on Computational Intelligence).

🌐 **Live site:** https://soodashima91.github.io/MeetProsody/

The page covers:

- **The three research questions** — does audio beat a duration-matched transcript, where is prosody retained or lost across the model, and is it necessary for the summary.
- **The controlled framework** — a duration-matched audio-vs-text comparison plus a two-part prosody mechanism test (represented *and* necessary).
- **An interactive audio-vs-text explorer** — toggle corpus (AMI / ICSI) and metric (BERTScore / ROUGE-Lsum) to see where audio wins and where text does.
- **The probing result** — how energy, pause, and pitch survive (or don't) across the 4:1 multimodal adapter, and the 327 → 82 effective-rank drop.
- **The ablation null** — flattening each prosodic cue leaves quality unchanged, with the three checks that distinguish this from an underpowered null.
- **The LLM-judge trade-off** — coverage versus fidelity, scored by two modality-blind judges.
- **The model screening, limitations, and future work.**

## TL;DR

Speech LLMs can summarise meetings directly from audio, and are often assumed to beat the transcript because audio preserves prosody (pitch, loudness, timing). Using **Voxtral-Small-24B-2507** on **AMI** and **ICSI** under a duration-matched 40-minute cap, we find the audio advantage is **narrow and corpus-specific**: audio matches or exceeds text semantically on AMI's commitment-bearing sections, but the edge narrows to parity on ICSI and text leads on lexical overlap. Two modality-blind LLM judges show a **coverage–fidelity trade-off** — text covers more, audio is marginally more faithful per decision on AMI. Testing pitch, energy, and pause as the mechanism, **linear probing** shows this detail is largely discarded at the multimodal adapter, and **ablation** shows removing any of it leaves quality unchanged. The advantage is thus capped by adapter-level attenuation and lexical redundancy.

## Citation

```bibtex
@inproceedings{sood2026prosody,
  title     = {How Far Does Audio Help Meeting Summarisation? The Limited Role of Prosody in Speech LLMs},
  author    = {Sood, Ashima and Gardiner, Bryan and Condell, Joan},
  booktitle = {Proceedings of the 25th UK Workshop on Computational Intelligence (UKCI)},
  year      = {2026}
}
```
