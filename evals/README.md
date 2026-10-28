# Evaluation

How modus itself is tested (contract section 11). This tests modus's reviews,
not your projects' code.

## The corpus

One file per case in `cases/`, from [cases/TEMPLATE.md](cases/TEMPLATE.md).

- **Bug cases** — a diff that introduced a real bug, with the later fix as
  the answer key. The review should find what the fix fixed.
- **Clean cases** — a diff that turned out fine. Any blocker or should-fix on
  one is a wrong finding.
- **Held-out** — about a third of the cases, marked `held_out: yes`. Never
  look at them while changing modus; use them only to decide whether to keep
  a change.

Stage 1 aims for about ten bug cases and a few clean ones.

## Finding a bug case

1. Find a commit that fixed a real bug: `git log --grep=fix`, closed issues,
   hotfix branches.
2. Find what introduced it: `git blame <fix>^ -- <file>` on the lines the fix
   changed, then read that commit to confirm it really caused the bug.
3. That commit is the case's `head`, its parent is `base`, and the fix is the
   answer key.

Prefer bugs a careful reviewer could have caught from the diff and the code
around it. A bug that needed production data to see tests nothing.

## Running a case

1. Check out the case's `head` on a branch in a separate worktree, both with
   ordinary names: `git worktree add -b feature/order-export ../shop-review
   <head>`.
2. Run the review there against the case's `base`, e.g.
   `/modus-review <base>`.
3. Repeat **three times**. Model output varies, and one run decides nothing.

**The reviewer must not know it is being tested.** A reviewer that sees
`eval`, `test-case`, `bug` or `benchmark` in a path, branch or prompt reviews
differently, and the score stops meaning anything. Keep case ids and answer
keys out of the worktree, the branch name and the review prompt. The case
files stay here, in modus, where the reviewer never looks.

## Scoring

For each run:

- **Caught** — bug cases: a New finding at the answer key's location
  describing the same mechanism.
- **Wrong** — a finding that is not a real problem: any blocker or should-fix
  on a clean case, and on bug cases any finding you judge invalid.

Keep the two numbers apart, and average over the three runs. Record each
evaluation in `results/<date>-<what changed>.md`:

```markdown
| case | type | held out | caught (of 3) | wrong findings (avg) |
|---|---|---|---|---|
```

A change to modus is kept only if it is not clearly worse on the held-out
cases across the repeated runs. A difference within run-to-run noise decides
nothing.

When comparing two versions of modus — or modus against another tool — score
both sets of results together, labelled A and B, without knowing which is
which. Knowing which version you hoped would win changes what you count as a
catch.
