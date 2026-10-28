# Correctness

Knowledge, not instructions. True whether you are writing this code or
reading it.

## The question underneath all of it

**What does this code assume, and what happens when the assumption is
false?** Most bugs are a correct line of code meeting an input or a state its
author did not picture.

## A fix covers a class, not an input

A fix for the reported input that leaves the same bug in its siblings — the
other caller, the other branch, the bulk path, the API that does the same
thing as the form, the test-mode path beside the real one — is half a fix, and
the other half ships.

## Root cause or symptom

A guard, retry, cast, clamp or swallowed error at the place a bug surfaced
often hides a state that should never exist. Ask whether that state is
legitimate. If it is, handling it there is the fix. If it is not, the check
hides the bug, and the fault is wherever the state was produced.

## Edges

Empty, one, many, the maximum. Zero and negative. Missing, null and empty
string are three different things. First run, and upgrade from an old version.
The input the author tested is almost never one of these.

## New values reach old code

A new status, enum value, type or newly accepted input — a wider validator, a
new file type — reaches every place that switches on it, filters by it or
displays it. Those places are usually outside the diff, and the one that falls
through to a wrong default is the bug.

When several kinds share one code path, a test of one kind makes all of them
look covered. A destructive path taken by a kind that was never meant to take
it passes every test.

## The failure path

An error swallowed is a wrong result reported as success. A fallback that
hides a failure — an empty list on error, a default value, a log line and
nothing else — moves the bug downstream, where it is harder to find. A log
line that claims an action happened when a branch skipped it misleads whoever
reads it. A write that fails halfway leaves state half-done unless something
rolls it back. A retry repeats every side effect before the failure point —
the email, the charge — unless the operation is idempotent. A side effect done
on one branch is often forgotten on the other.

## Time and order

Two requests at once: check-then-act is a race unless something locks or the
write is conditional. Timezones and daylight saving move "today". Code that
reads the clock makes tests pass or fail by the hour. Events, hooks and
migrations run in an order someone else can change.

## State that outlives the code

Data written by the previous version, cache entries and queued jobs holding
the old shape, a migration that runs twice or stops halfway. During a deploy,
old code runs against the new schema, and new code against old data. A NOT
NULL constraint on a column that already holds nulls fails on the first real
database. A migration with no way back turns a bad deploy into lost data.

## Contracts

A changed return type, a new exception, a null where there was none before, a
renamed field in a response or a webhook payload: every caller is affected,
including the ones outside the diff, and including clients that cannot update
when you do.

A new parameter type narrows what a function accepts. A value that used to
pass through quietly now fails with a type error. That is a change in
behaviour, even in a refactor that promises none, so every caller has to be
checked, including the framework and the hooks that call it.

## Weakened checks

Code written to pass checks, rather than to be right, weakens the checks. The
shapes: a test removed, skipped or narrowed; a threshold, timeout or retry
count relaxed; a snapshot regenerated while its test did not change; a lint
or type suppression; a CI step bypassed or allowed to fail; product code that
behaves differently under test; a placeholder left in while the work is
reported done; acceptance criteria rewritten to match what was built.

Each one is a question, not yet a bug: **does this silence the failure it was
added for, or is it justified by something visible in the change?** A reason
in a commit message is a claim, not evidence.

## Tests that cannot fail

Judge a test by two imagined edits. Break the behaviour — return a wrong
value, skip an effect, do it twice — and the test must fail; if it still
passes, it proves nothing. Change only the internals, keeping every result the
same, and the test must still pass; if it fails, it is pinned to the
implementation and catches no bug. The usual causes of the first: an
assertion looser than the contract, an expected value computed by the code
under test, a mock of the very thing being tested.
