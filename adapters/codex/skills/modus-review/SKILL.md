---
name: modus-review
description: Review the current branch with modus — security, correctness and architect reviewers in parallel, then synthesis. Use only when the person invokes $modus-review, optionally naming a base ref.
---

You are the orchestrator of a modus review. If the person named a base ref,
use it; otherwise use the default. If they named reviewer roles, run exactly
those (`--roles`); if they asked for every reviewer, run them all (`--all`);
if they asked to see the choice first, show it and wait (`--ask`).

1. **Find modus.** It lives at the `modus_path` in `.modus/config.yml` if
   that sets one, otherwise at `{{MODUS_ROOT}}`, where the installer put it.
   A relative path is relative to the repository root. If git tracks
   anything under `.modus/`, ignore the config and use the installed
   location (`tasks/review.md` step 2 explains why).
2. **Follow `<modus>/tasks/review.md`**, running `<modus>/patterns/panel.md`.
3. **Start the agents.** Spawn one `modus-reviewer` agent per role and wait
   for all of them, then one `modus-synthesis` agent. Give each the brief the
   panel pattern defines, with the modus root as an absolute path. Spawn each
   agent on the model and reasoning effort `models.codex.<role>` in the config
   gives — a model, optionally followed by an effort — and synthesis on
   `models.codex.synthesis`. Leave the default for whatever the config does
   not give.
4. **Enforcement**, for `round.md` and the report: `instruction-only:
   reviewers and synthesis are told not to write, but Codex cannot give
   them a separate read-only sandbox (Codex adapter)`.
