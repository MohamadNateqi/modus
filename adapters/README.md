# Adapters

An adapter connects modus to one AI tool: the command that starts a task, the
agent definitions, and whatever the tool can enforce. It holds pointers and
wiring, never knowledge — that stays in the core files.

| Adapter | Reviewers read-only |
|---|---|
| [claude-code](claude-code/) | **enforced** — no edit tools, read-only shell |
| [codex](codex/) | **instruction-only** — Codex cannot give agents their own read-only sandbox |

## Install

Clone modus once, then run the installer from the clone. It needs Node.js.

```
git clone <your modus repo> ~/modus
node ~/modus/adapters/install.js
```

That installs both adapters for your user, so every project gets them. The
installed files point back at the clone: `git pull` there updates the core
files for every project. Re-run the installer after a pull that changes
anything under `adapters/`.

| | |
|---|---|
| `--tool claude-code` or `--tool codex` | one tool only |
| `--project <path>` | into one project instead of your user |
| `--dry-run` | show what would change |
| `--uninstall` | remove what the installer put there |

The installer never overwrites or removes a file it did not install, unless
you add `--force`.

**For a team**, add modus to the project as a git submodule and install into
the project: `node modus/adapters/install.js --project .`. The installed
files then use paths relative to the project, so they work for everyone who
clones it, and the project pins the modus version it uses.

## Setting up a project

A project can use modus with no setup at all. To turn on packs or choose
models, add a `.modus/config.yml`. Nothing under `.modus/` is ever committed:
modus creates `.modus/.gitignore` containing `*`, so the folder stays out of
git without touching the project's own `.gitignore`.

```yaml
# Optional: where modus is, if not where the installer put it. Absolute, or
# relative to the repository root.
# modus_path: ../modus

# Packs to turn on, from modus's packs/.
packs:
  - wordpress

# Optional: a model, and optionally an effort, per role and per adapter.
# Different models catch different bugs. Write `opus` for the model alone,
# or `opus high` for model and effort. A role left out runs on the session's
# model and effort. `synthesis` is the step that verifies and merges findings.
models:
  claude-code:
    security: opus high
    correctness: opus high
    architect: sonnet
    synthesis: opus high
  codex:
    security: <a Codex model name> high
```

Also optional:

- `.modus/conventions/` — your own conventions for this project;
- an architecture map. If the project already has an `ARCHITECTURE.md`, the
  architect reviewer reads it. If not, run `/modus-map` to draft one from
  main into `.modus/architecture.md`.

Everything else modus writes — reviews, history, lessons — goes under
`.modus/` too.
