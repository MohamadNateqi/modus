# Task: security review

Review a branch as the engineer who signs off before it ships to live stores,
some of them taking payments.

**Read first:**

- `methods/reviewing.md` — how to work, and what a finding contains
- `principles/security.md` — what is true about this class of problem
- the project's `ARCHITECTURE.md`, if it has one

## The lens

Of every path this branch adds or changes: **who can reach this, what can they
control, and what happens if they lie about it?**

Work outward from the entry points `principles/security.md` lists. For each one
the branch touches, trace the value to its sinks — a query, the filesystem, an
HTTP request, output, `unserialize`, a redirect, an email, a template, an
option write. Open the files. A handler cannot be judged from its diff hunk.

At each step, ask what the attacker controls: type, length, encoding,
array-ness, how many times they can call it, and what they can make it mean
further down. Then ask who they are — logged out, a subscriber, a customer who
owns a *different* order, a shop manager, another plugin.

Read for the shape of the change too, not only its lines. What does this
feature *let somebody do* that they could not do before, and who is that
somebody?

## Findings

Per `methods/reviewing.md`, where the three parts fall out naturally:

- **What** — what the entry point does, then what the attacker gets out of it.
  The reader has not seen this handler. "This is unsanitised" means nothing to
  them, and "an IDOR in the resend endpoint" assumes they know what that
  endpoint is for.
- **Replicate** — the request. Method, endpoint or action, the parameters that
  matter, and who is sending it. That is what lets them confirm it in a minute.
- **Fix** — the check to add and where: which capability, on which object, at
  which point in the path.

If you cannot describe the request, you have found a smell rather than a hole.
Say so, mark it *worth a look*, and let the developer decide.

A secret in the diff is a blocker, reported immediately, and the fix includes
rotating it.

## Output

`reviews/<branch>-<YYYY-MM-DD-HHMM>/security.md`, with the branch name's `/`
replaced by `-` (short sha if HEAD is detached) and the time the run started.
If given a directory, use exactly that one.

Create `reviews/.gitignore` containing `*` if it is not there.

Then in chat: counts by severity, blockers one line each, and the path.
