# Codex adapter

## Install

```
node <modus>/adapters/install.js --tool codex
```

This puts the `modus-review` skill in `~/.agents/skills/` and the two agents
in `~/.codex/agents/` (or the same folders inside a project with
`--project`). See [../README.md](../README.md) for the options and for
`.modus/config.yml`.

## Run

```
$modus-review                      # against origin/main, else main
$modus-review against develop      # against another base
$modus-review for an agent         # result written for an agent to act on
$modus-review for issue 123        # judge it against issue 123, not the branch's own
```

To find the branch's PR and issues, a review needs the GitHub CLI, `gh`,
installed and signed in, and network access from Codex's sandbox. Without
them, it uses the commit messages, then the diff, and says so.

## What is enforced

| Contract rule | How |
|---|---|
| 4 — reviewers do not edit | **Instruction-only.** Codex agents inherit the parent's sandbox, and a custom agent file cannot set its own. Reviewers are told not to write; nothing stops them. Every round records this in `round.md` and the report says so. |
| 5 — measures run automatically | Not yet: measures come in stage 2. |

To make rule 4 hold for a whole run, start Codex with a read-only sandbox —
but then the orchestrator cannot save the round's files either, so the review
appears only in the conversation.
