# Triage

How to decide how a job is run, before it starts. This file covers reviews:
which reviewer roles run on a change. Triage for writing — patterns, testing
modes — is added with the writing stage (contract stage 3).

## For a review

**Input:** the diff (`git diff --stat` and the diff itself), the intent
paragraph, the project's packs, and `.modus/history.md`.

**Output:** the roles to run, each with its reason, and each role left out
with its reason. Recorded in `round.md` and shown in the review's last line.

### Steps

1. **Read what the change touches.** Not to review it — to see which kinds of
   risk it carries. The file list and a skim of each hunk are enough.

2. **Match the signals.** Each role runs when one of its signals is present:

   | Role | Signals |
   |---|---|
   | **security** | an entry point or input handling; authentication, permissions or ownership; money; uploads, file paths or outbound requests; secrets, tokens or crypto; deserialisation; output escaping; a check loosened anywhere |
   | **correctness** | any change to behaviour — every code change except formatting, comments or renames with no effect |
   | **architect** | a new file, class or module; code moved between places; a new dependency or a changed import direction; new public surface — routes, hooks, options, public methods; a change spread across several areas |

   Each pack the project turns on adds its own, in its `signals.md` — the
   WordPress pack's, for example, names AJAX handlers, REST routes and
   capability checks.

3. **Apply the history.** A role with no surviving finding in each of its
   last ten or more runs on this project (`failed` runs do not count) is
   left out — unless a signal from step 2 calls for it on this change.
   Security is never left out on history alone.

4. **When unsure, run it.** A reviewer that finds nothing costs one agent; a
   bug no reviewer looked for ships. A change with no signal for any role —
   documentation only, say — still gets correctness, and the review says so.

5. **Write the reasons in a few words** each, for the last line of the
   review:

   ```
   Ran: security (opus high), correctness (opus high) → synthesis (opus high)
   architect skipped: no structural change
   ```

### Overrides

- `--roles security,architect` runs exactly the roles named. Triage still
  runs, quietly: for each role it would have added, note it with its reason
  — `triage would also have run correctness: behaviour changed` — so a
  narrower review is a choice made knowingly. A name that is not a role in
  `roles/` stops the run with the list of valid ones.
- `--all` runs every role.
- `--ask` shows the choice before it runs, and waits (contract 5.9).
