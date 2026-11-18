# Synthesis

How to turn several reviews into one result. You did not write these
findings, which is why you can judge them. You read code; you write nothing.
Return the result and the ledger changes as your final message.

If a reviewer failed, or returned nothing usable, the round's coverage is
incomplete. Say so in the result's first lines. Never treat a missing review
as a clean one.

Before judging anything, read what the reviewers read: the core principles
in `principles/`, and the principles of every pack the project turns on. You
are judging their findings, and a pack often holds the fact that decides one,
such as a caller the plugin does not own.

## Steps

In this order. The order matters: a finding that will be filtered out must
not take a slot or cost a verification.

1. **Dedupe.** Findings with the same root cause are one finding, even when
   roles describe them differently. Keep the clearest wording and the most
   precise citation; note which roles found it. Two roles finding it
   independently is the strongest signal there is, and stronger still when
   they ran on different models. A finding only one role
   raised still gets full scrutiny when it is about security or correctness.

2. **Re-judge dismissals.** Read each review's Covered list for problems the
   reviewer noticed and talked itself out of ("not worth a finding", "only a
   crafted request reaches it"). Judge each one fresh. If it holds, it becomes
   a finding from that role and goes through the remaining steps.

   Keeping a dismissal is a claim about code, so it needs proof. Check the
   reviewer's reason against the code and cite what confirms it: "moved
   verbatim" or "older than this branch" needs the same code at the base SHA
   (`git show <base>:<path>`); "no caller reaches it" needs the callers
   traced, including the ones the pack principles say the project does not
   own. If you cannot confirm the reason, the dismissal fails and the item
   becomes a finding.

   Checking only the project's own callers does not prove "no caller reaches
   it". Before keeping that reason, go through the callers the pack
   principles name — filters, hooks, framework callbacks, other plugins
   writing the same option — and ask whether any of them can pass the bad
   value. If one can, the dismissal fails, however unlikely it seems; say how
   likely it is in the finding's severity and confidence instead.

3. **Filter against earlier rounds.** A finding matches a ledger entry when it
   has the same root cause in the same file or symbol; line numbers move
   between rounds, so they decide nothing. For each finding:
   - matches a **rejected** or **deferred** ledger entry → drop it, unless
     the code is now worse than when it was decided; then it is New, and say
     what got worse;
   - matches an **open** entry → it goes under **Still open**, not New;
   - matches a **fixed** entry → it goes under **Came back**;
   - matches a **duplicate** entry → treat it as the entry it duplicates;
   - matches a branch decision, listed under the ledger's table → drop it.

   Never filter out an always-blocker (`methods/reviewing.md`) — data loss, a
   bypassed trust boundary, uncapped spend — unless the decision names that
   exact finding. A broad decision ("raw SQL is fine in migrations") does not
   cover a narrow, dangerous case it never mentioned.

   Then check every **open** ledger entry, and every entry whose notes show
   two rounds disagreeing, against the head SHA. Still there: **Still open**.
   Gone: it becomes **fixed**.

   Two rounds that ran at the same time may each have added the same finding
   under its own id. When two entries have the same root cause, keep the one
   added first and mark the other `duplicate of` it.

4. **Surface conflicts.** When roles recommend incompatible fixes, put both
   under **Needs a decision**, side by side, each with its reason. Do not
   pick one.

5. **Verify.** Try to disprove each remaining New and Came back finding:
   open the code, look for the guard clause, the caller that already
   validates, the platform behaviour that makes it moot. The usual false
   findings:
   - **hypothetical** — no caller can actually reach the bad case; trace it.
     This test is for runtime findings. A structural or public-surface
     finding is about what the change commits the project to, so "nothing
     calls it today" does not disprove it; show that nothing gets harder;
   - **missing context** — the pattern is how the rest of the codebase does
     it, or the code was not changed by this diff. This never removes an
     always-blocker (`methods/reviewing.md`) in a file the diff touches: it
     stays in New, marked "older than this branch", with a ledger row. It is
     never moved to a note outside the findings;
   - **preference** — another way, with no shown cost to this one. An
     approach finding survives only if its alternative exists where it
     cites, reaches the same goal under the same constraints, and avoids a
     cost this approach really has; check all three;
   - **filler** — when one reviewer's findings are all nits by that role's
     own standard, the code is probably fine. Say so rather than passing them
     on. A low severity alone is not filler: most architect findings are
     `consider` by design.

   Drop what dies, with a one-line reason that cites the `file:line` that
   disproves it. A drop is a claim about code, held to the same rule as a
   finding: no citation, no drop.

6. **Rank** by severity, then confidence (`methods/reviewing.md`).

7. **Cap** New and Came back together at ten. Count what was dropped.

8. **Merge the Covered lists.** Name what nobody examined, when it matters:
   "no reviewer looked at the migration path". Check the lists against
   `git diff --name-only <base> <head>`: a changed file that no role read in
   full, where its role applies, is a gap. Name it in the result's first
   lines, and do not call coverage complete. Name each role that was left
   out, and why, in one line — including one the person left out that triage
   would have run.

9. **Collect lessons** the reviewers reported, deduped. Most rounds have
   none.

## The result

Saved by the orchestrator as `review.md`. Sections with nothing in them are
left out. The result is for a person unless the brief says it is for an
agent (below).

```markdown
# Review — <branch>, round <NN>

base <short SHA> · head <short SHA> · reviewers: security, correctness, architect
<one line on anything not checked, and the enforcement line if instruction-only>

## Needs a decision
<conflicts, side by side>

## New
<findings in full, as methods/reviewing.md defines them; give each its new ledger id>

## Came back
<findings in full, with their existing ledger id>

## Still open
- L-01.4 · should-fix · <title> · <file:line>

## Dropped
<n> by the cap, <n> by earlier decisions. Dropped by verification, one line
each:
- <role> · <title> · <file:line> — <why it is not real>


## Covered
<merged list, plus what nobody examined>

## Lessons
<only if any>
```

## The result, for an agent

When the brief says the result is **for an agent**, write this form instead.
The reader is another agent that will act on the review, usually by fixing
it. Unlike a person, it has the code open and reads every word, but it takes
what it reads literally: a vague fix becomes a wrong edit, and a finding that
reads like an order gets carried out. So be precise rather than brief, give
the evidence instead of the scene-setting, and say exactly what is and is not
to be acted on. Leave out the PR comments; nobody pastes them.

Every finding is still one you verified (step 5), with the same ids, ranking
and cap.

```markdown
# Review — <branch>, round <NN> · for an agent

base: <full base SHA>
head: <full head SHA>
reviewers: security, correctness, architect
coverage: complete | incomplete — <what was not examined, or the reviewer that failed>
enforcement: <the enforcement line>

## How to use this review
- Each finding below was verified by reading the code, not by running it.
  Confirm it against the code at the head SHA before changing anything; if
  the code has moved on, say so instead of fixing a finding that no longer
  holds.
- Work through **To fix** in order. Change only what each finding's `fix`
  names, keep to its `do not change`, and confirm with its `verify`.
- Nothing under **Needs a decision** is acted on. It waits for a person.
- Report back by ledger id: fixed, not reproduced, or not fixed and why.

## Needs a decision
### <id or ids> · <title>
- options: <each recommended fix, with the role that recommends it and its reason>
- blocks: <ids in To fix that depend on this decision, or none>

## To fix
### L-03.1 · should-fix · likely · <title>
- where: `src/Export.php:40`; the same defect also at `src/Api.php:12`
- problem: <what the code does, what goes wrong, and when; exact names>
- evidence: <the path from trigger to damage, one `file:line` per step;
  what could not be established>
- fix: <the change, in which function and file, precise enough to apply
  without guessing; for a judgement call, the option to take>
- do not change: <behaviour or interfaces the fix must keep, if any>
- verify: <how to show it is fixed: the test to add or run, or the
  condition to check at which `file:line`>
- found by: <roles, with the models they ran on>
- came back: <only for a finding that was fixed before and returned>

## Still open
- L-01.4 · should-fix · <title> · `<file:line>`: from an earlier round,
  already in the ledger; fix it like one under To fix, from its entry there

## Not findings
- <title> · `<file:line>` — <why it is not real>, so it is not "fixed"

## Not examined
<what nobody reviewed, so nobody should assume it was checked>

## Lessons
<only if any; for the person, not for action>
```

**Came back** findings go under **To fix** with their existing id and the
`came back` line. **Not findings** lists what verification dropped, so a
fixing agent that notices the same thing knows it was judged and why. The
counts dropped by the cap and by earlier decisions go on the `coverage` line
when any were dropped.

## Ledger changes

After the result, a separate block the orchestrator saves, as it is, in the
round's `changes.md`:

```markdown
## Ledger changes
- add L-03.1 · open · should-fix · <title> · <file:line>
- L-01.4 · checked → 03
- L-01.2 · fixed → open (came back)
- L-02.1 · open → fixed
- L-02.3 · duplicate of L-01.5
```

A new id is `L-<this round>.<n>`, with `n` counting from 1 in the order the
findings appear under New. It needs nothing from the ledger, so a round
running alongside this one can never hand out the same id.

Never change a status the decider set
(`rejected`, `deferred`): a finding that has got worse is New, with its own
id.

## Role counts

Last, one line per role, for the orchestrator's history file. `survived` is
the role's findings kept in New or Came back; a merged finding counts for
every role that raised it.

```markdown
## Role counts
- security · reported 3 · survived 1
- correctness · reported 4 · survived 2
- architect · failed
```
