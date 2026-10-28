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
```

## What is enforced

| Contract rule | How |
|---|---|
| 4 — reviewers do not edit | **Instruction-only.** Codex agents inherit the parent's sandbox, and a custom agent file cannot set its own. Reviewers are told not to write; nothing stops them. Every round records this in `round.md` and the report says so. |
| 5 — measures run automatically | Not yet: measures come in stage 2. |

To make rule 4 hold for a whole run, start Codex with a read-only sandbox —
but then the orchestrator cannot save the round's files either, so the review
appears only in the conversation.
