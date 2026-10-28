# modus

A toolkit that makes AI write code to your standards and review it the way a
senior engineer on your team would.

The core is plain markdown that any agent can read. Adapters connect it to a
specific AI tool. The design, and the rules every file follows, are in
[CONTRACT.md](CONTRACT.md).

## What this is not

Not a linter, and not a gate. Anything a tool can decide belongs in a tool: a
linter, static analysis, a test suite, CI. modus says which checks to run and
how to read them, and covers the judgement a tool cannot reach.

## How it is organised

```
principles/     what is true — knowledge, usable when writing and reviewing
conventions/    how we do it — defaults a project can override
methods/        how to do an activity — triage, review, synthesis, …
measures/       what a tool checks, and how to read the result
roles/          a lens — what to look at, and which knowledge to load
tasks/          a type of job — what it requires, when it is done
patterns/       the shape of the team — who works, in what order
packs/          knowledge for one stack, turned on per project
adapters/       wiring for one AI tool — commands, agents, hooks
evals/          how modus itself is tested
notes/          background for maintainers; never loaded by a task
```

Knowledge is never written into a role. A principle is written once and loaded
by whoever needs it, so the same file serves the agent writing the code and the
agent reviewing it.

## Where does a new rule go?

1. **Can a tool enforce it?** Then it belongs in that tool, not here.
2. **Can you name what goes wrong if it is ignored?** If not, it is taste.
   Leave it out; every line here is read on every run.
3. **Is it true everywhere, true of one stack, or true of one project?**
   `principles/`, a pack, or the project's own `.modus/`.

## Using it

Clone modus once and install it for your AI tools:

```
node adapters/install.js
```

Every project then has the commands. A project's `.modus/config.yml` is
optional; options, team setup and the config are in [adapters/](adapters/).

## Commands

| Task | Claude Code | Codex |
|---|---|---|
| Review the current branch | `/modus-review [base] [--roles a,b \| --all] [--ask]` | `$modus-review` |
| Draft an architecture map from main | `/modus-map [ref]` | `$modus-map` |

`base` and `ref` default to `origin/main`, then `main`. A review picks its
reviewers from what the change touches; `--roles security,architect` runs
just those, `--all` runs every reviewer, `--ask` shows the choice before it
runs. Reviews use the map when the project has no
`ARCHITECTURE.md`.

Everything modus keeps in a project — its config, reviews (one folder per
branch, a round per run) and the map — lives in `.modus/`, which is never
committed. How a project describes itself lives in that project, not here.
