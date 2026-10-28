---
name: modus-map
description: Draft an architecture map of this project from its main branch, for modus reviews. Saved locally to .modus/architecture.md and never committed. Use only when the person invokes $modus-map, optionally naming a ref.
---

Draft the project's architecture map with modus. If the person named a ref,
use it; otherwise `origin/main`, else `main`.

1. **Find modus.** It lives at the `modus_path` in `.modus/config.yml` if
   that sets one, otherwise at `{{MODUS_ROOT}}`, where the installer put it.
   A relative path is relative to the repository root. No config is fine for
   this task.
2. **Follow `<modus>/tasks/map.md`.** Only you write the map.
