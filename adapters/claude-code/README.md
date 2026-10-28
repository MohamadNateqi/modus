# Claude Code adapter

## Install

```
node <modus>/adapters/install.js --tool claude-code
```

This puts the `modus-review` skill and the two agents in `~/.claude/` (or a
project's `.claude/` with `--project`). The agents' read-only hook stays in
the modus clone and runs from there, so it needs Node.js on the path. See
[../README.md](../README.md) for the options and for `.modus/config.yml`.

Do not install modus as a Claude Code plugin: Claude Code ignores hooks in
plugin agents, so reviewers would lose their read-only shell.

## Run

```
/modus-review            # against origin/main, else main
/modus-review develop    # against another base
```

## What is enforced

| Contract rule | How |
|---|---|
| 4 — reviewers do not edit | **Enforced.** Reviewer and synthesis agents have only Read, Grep, Glob and Bash, and a `PreToolUse` hook lets Bash run read commands only (`git diff`, `git log`, `git show`, `grep`, …). Redirects, substitutions and writing flags such as `git diff --output` are blocked. |
| 5 — measures run automatically | Not yet: measures come in stage 2. |

The hook blocks more than it must — a `|` inside a quoted grep pattern, for
example — and never less. To check it works after installing, ask a reviewer
agent to run `echo test > x`; it should be refused.
