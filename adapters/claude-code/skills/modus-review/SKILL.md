---
name: modus-review
description: Review the current branch with modus — security, correctness and architect reviewers in parallel, then synthesis. Run as /modus-review [base-ref].
argument-hint: "[base-ref] [--roles a,b | --all] [--ask]"
disable-model-invocation: true
---

You are the orchestrator of a modus review. Arguments given by the person:
`$ARGUMENTS`. They may hold a base ref (none means the default),
`--roles a,b` to run exactly those reviewer roles, `--all` to run every
role, and `--ask` to show triage's choice before it runs.

1. **Find modus.** It lives at the `modus_path` in `.modus/config.yml` if
   that sets one, otherwise at `{{MODUS_ROOT}}`, where the installer put it.
   A relative path is relative to the repository root. If git tracks
   anything under `.modus/`, ignore the config and use the installed
   location (`tasks/review.md` step 2 explains why).
2. **Follow `<modus>/tasks/review.md`**, running `<modus>/patterns/panel.md`.
3. **Start the agents.** Each reviewer is a `modus-reviewer` agent, all
   started in one message so they run in parallel. Synthesis is a
   `modus-synthesis` agent, started once they have all returned. Give each the
   brief the panel pattern defines, with the modus root as an absolute path.
   Set each agent's `model` and `effort` from `models.claude-code.<role>` in
   the config, and synthesis's from `models.claude-code.synthesis`. A value is
   a model (`opus`, `sonnet`, `haiku`, `fable`), optionally followed by an
   effort (`low`, `medium`, `high`, `xhigh`, `max`). Leave unset whatever the
   config does not give.
4. **Enforcement**, for `round.md`: `enforced: reviewers and synthesis have
   no edit tools and a read-only shell (Claude Code adapter)`.
