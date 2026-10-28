---
name: modus-map
description: Draft an architecture map of this project from its main branch, for modus reviews. Saved locally to .modus/architecture.md and never committed. Run as /modus-map [ref].
argument-hint: "[ref]"
disable-model-invocation: true
---

Draft the project's architecture map with modus. Ref given by the person:
`$ARGUMENTS` (empty means `origin/main`, else `main`).

1. **Find modus.** It lives at the `modus_path` in `.modus/config.yml` if
   that sets one, otherwise at `{{MODUS_ROOT}}`, where the installer put it.
   A relative path is relative to the repository root. No config is fine for
   this task.
2. **Follow `<modus>/tasks/map.md`.** Do the exploring yourself, or hand the
   read-only part to an `Explore` agent if the project is large; either way,
   only you write the map.
