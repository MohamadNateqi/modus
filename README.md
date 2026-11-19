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

Every project then has the commands. `node adapters/install.js --check`
shows which version is installed, and whether it needs re-installing. A project's `.modus/config.yml` is
optional; options, team setup and the config are in [adapters/](adapters/).

## Commands

| Task | Claude Code | Codex |
|---|---|---|
| Review the current branch | `/modus-review [base] [--goal "text"] [--issue n\|url\|file] [--pr n\|url] [--roles a,b \| --all] [--ask] [--for agent]` | `$modus-review` |
| Draft an architecture map from main | `/modus-map [ref]` | `$modus-map` |

`base` and `ref` default to `origin/main`, then `main`.

### What a review does

1. **Finds the goal.** It uses the goal you give with `--goal`, if any.
   Otherwise it reads the current branch's PR and the issues it
   names, with the GitHub CLI (`gh`). With no issue it uses the PR
   description or the commit messages, and with none of those, or no `gh`,
   it infers the goal from the diff. The review says which it used.
2. **Chooses reviewers** from what the change touches: **security** for
   input, auth, money and secrets; **correctness** for any change in
   behaviour, checked against the issue; **architect** for new structure,
   bug fixes and workarounds, judging where the code goes and whether a
   better approach exists.
3. **Runs them in parallel**, read-only, each on its own model if the config
   sets one.
4. **Synthesises.** A separate agent merges the findings, drops what earlier
   rounds already decided, tries to disprove the rest, and keeps the top ten.
   If the change leaves part of its problem unsolved, that comes first,
   under **Goal not reached**, and is named in the chat. If the architect
   found a clearly better approach, it comes next, under **Rethink first**, with the findings that would go away if you take it
   marked as such.
5. **Saves the round** in `.modus/reviews/<branch>/<NN>/`: `review.md` is the
   result, `intent.md` the texts it was judged against. The chat gets only
   the path and who ran.

Run it again after new commits and it reports only what is new, what came
back, and a line for each finding still open.

### Options

| | |
|---|---|
| `--for agent` | write the result for an agent that will act on it, such as one fixing the findings |
| `--roles a,b` | run only these reviewers; `--all` runs every one |
| `--ask` | show the reviewers chosen, and wait before running |
| `--goal "text"` | say what the branch is for; it takes priority over the issue, which is read as background |
| `--issue`, `--pr` | name the issue or PR, when the branch does not lead to them |
| `read_pr_and_issues: false` | in `.modus/config.yml`: never read the PR or issues, keeping the AI to the local repository |

Reviews use the map when the project has no `ARCHITECTURE.md`.

Everything modus keeps in a project — its config, reviews (one folder per
branch, a round per run) and the map — lives in `.modus/`, which is never
committed. How a project describes itself lives in that project, not here.
