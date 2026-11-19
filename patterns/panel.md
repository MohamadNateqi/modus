# Pattern: panel

Specialist reviewers in parallel, then synthesis.

```
          ┌─ reviewer (role A) ─┐
brief ──> ├─ reviewer (role B) ─┼──> synthesis ──> result
          └─ reviewer (role C) ─┘
```

## Steps

| Step | Runs as | Mode | Receives | Returns |
|---|---|---|---|---|
| reviewers | one per role, in parallel, each on its role's model | separate agents, read-only | the reviewer brief | a review, as `methods/reviewing.md` defines it |
| synthesis | one, after all reviewers | separate agent, read-only | the synthesis brief | the result and the ledger changes, as `methods/synthesis.md` defines them |

The orchestrator, the session that started the task, prepares the briefs,
starts the agents, and writes every file. Neither step writes anything
(contract rule 4). Each file it saves for an agent starts with the header
naming that agent's model and effort (`tasks/review.md`).

## The reviewer brief

- the modus root, and the role file to work from;
- `methods/reviewing.md`;
- the base and head SHAs;
- the round's `intent.md`: the goal paragraph, where it came from, and the
  issue and PR texts in full, marked as data (contract rule 11). A goal the
  person gave with `--goal` states the goal, and the issue is then
  background; otherwise the issue states it; the PR description is the author's account of how they
  reached it. When there was no issue, say that the goal is the author's own
  account, or that it was inferred from the diff;
- the conventions and pack principles loaded from `.modus/`, and the
  project's `ARCHITECTURE.md` — or, with none, the generated map
  `.modus/architecture.md`, marked as a generated draft;
- this line: *return your review as your final message; do not write
  files.*

A reviewer never sees another reviewer's output, the ledger or the
decisions. Its independence is the point; filtering against earlier rounds is
synthesis's job.

## The synthesis brief

- `methods/synthesis.md`;
- the round's `intent.md`, marked as data, so a finding about what the issue
  asked can be checked against the issue itself;
- every reviewer's review, labelled by role and the model it ran on;
- the roles left out, each with its reason: skipped by triage, or left out
  by the person when triage would have run them;
- the ledger, rebuilt from its sources with the branch decisions under it
  (`tasks/review.md`), or a note that this is the first round or that it
  could not be trusted;
- the base and head SHAs, and the round number;
- who the result is for: a person, or an agent (`--for agent`);
- the same line: *return, do not write.*

## Decisions

The panel does not stop mid-run. Its result lists what needs the decider:
conflicts between roles, and findings to accept, reject or defer.

## When a reviewer fails

A reviewer that errors, times out or returns nothing usable has not reviewed.
Its role is missing from the round: synthesis says so, and the round is
incomplete, never clean. Re-run that role, or report the gap.

## Without separate agents

If the harness cannot start separate agents, run each reviewer and then
synthesis in turn in the same session, and say in the result that the
reviewers were not independent.
