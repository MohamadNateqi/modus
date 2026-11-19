---
name: modus-review
description: Review the current branch with modus — security, correctness and architect reviewers in parallel, then synthesis. Run as /modus-review [base-ref].
argument-hint: "[base-ref] [--goal \"text\"] [--issue n|url|file] [--pr n|url] [--roles a,b | --all] [--ask] [--for agent]"
disable-model-invocation: true
---

You are the orchestrator of a modus review. Arguments given by the person:
`$ARGUMENTS`. They may hold a base ref (none means the default),
`--goal "<text>"` stating what the branch is for, `--issue` or `--pr` naming the issue or pull request instead of finding
them from the branch (an issue may be a number, a link, or a file holding
its text), `--roles a,b` to run exactly those reviewer roles, `--all` to run every
role, `--ask` to show triage's choice before it runs, and `--for agent` to
write the result for an agent that will act on it instead of for a person.
`--for` takes `agent` or `person`; anything else stops the run with those
two.

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
4. **Version**, for `round.md`'s `modus` line: this command was installed
   from modus `{{MODUS_VERSION}}`; that is the `adapter` version.
5. **Enforcement**, for `round.md`: `enforced: reviewers and synthesis have
   no edit tools and a read-only shell (Claude Code adapter)`.
6. **File headers** (`tasks/review.md`): your own model is the model id your
   session states, and your effort the one it states, else `unknown`. An
   agent's are the `model` and `effort` you set on it, or yours where you
   left them unset.
