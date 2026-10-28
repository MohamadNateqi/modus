# Comments

How we comment. Applies when writing code and when judging someone else's.

Docblock *presence* is enforced by the linter. Nothing here repeats that — this
is only what a tool cannot judge.

Most of the code here is written and read by agents, with occasional human
review. A new session may lack the context behind an earlier decision.
Comments preserve local reasoning that the code and tests do not make clear —
so they have to be true, current, and about the code.

## Default to no comment

Add a comment only when leaving it out would hide information needed to
understand, use, or safely change the code. First try clearer names, types, or
simpler structure. If those make the meaning clear, leave the comment out.

Required docblocks still apply, but keep them concise and useful.

## A comment explains what the code cannot

Prefer clear names, types, and simple code over explanations of mechanics.
A comment earns its place by adding something the code does not make clear:

- why this approach and not the obvious one
- what breaks if the line is changed or removed
- the failure that motivated the code existing at all
- the constraint from outside the file — an API's behaviour, a platform quirk,
  a decision made elsewhere
- a contract such as units, valid ranges, side effects, or required ordering
- an overview that helps the reader follow a complex algorithm

Keep it as short as the explanation allows. Do not narrate each step.

```php
// phpcs falls back to the PEAR standard when it finds no config, and says
// nothing about having done so. Refusing to run is the only safe answer: a
// check that silently measures the wrong thing is worse than one that does
// not run.
```

That comment is worth more than the function it sits on, because the next
reader's instinct — an agent's especially — will be to make it fail soft.

## Only a reason you can stand behind

A plausible reason is easy to write and hard to spot as false. The next agent
reads it as fact: it keeps code that should go, or refuses a fix because of a
constraint that never existed. A wrong reason is worse than none.

Write a reason only if it came from somewhere checkable — the code, the docs, a
failing test, the person who asked for the change. For a surprising constraint,
include a useful reference such as a test name, documentation link, or issue
number. Keep the essential explanation in the comment; the reference supports
it rather than replacing it.

Verify an assumption before relying on it. If it cannot be verified, label it
and say what needs checking:

```php
// Unverified: this limiter assumes quotas are per API key. Confirm the
// provider's quota scope before sharing it across keys.
```

An unverified comment is not evidence that the assumption is true.

## A comment that restates the code is noise

```php
// Loop through the orders.
foreach ( $orders as $order ) {
```

Delete it. It costs a line, and it drifts: the code changes, the comment does
not, and the next reader believes the comment.

## Describe the code, not the edit

```php
// Updated to use the new query builder.
// Fixed the bug where totals were wrong.
```

These describe a diff the reader cannot see. Once merged they say nothing about
the code in front of them. History belongs in git; the comment says what is
true now, and why.

## A change includes its comments

When code changes, the comments around it are part of the change. Update or
remove any that no longer apply, including docblocks and examples. A comment
left describing the old behaviour is a wrong comment, and it is read literally.

## Name the consequence, not the category

"Important: do not change this" tells the reader nothing they can act on.
Say what happens: *"Use ID as a tie-breaker when ordering by date; equal dates
otherwise allow rows to move between pages."*

## Comments explain; tests enforce

When a comment describes behaviour that must remain true, encode it in a test,
type, or assertion, unless the behaviour genuinely cannot be tested. Keep the
comment for the reason the requirement exists. A comment alone does not verify
the behaviour; the next change breaks it and nothing fails.

## Where the reason lives

Keep local reasoning next to the code it explains, not in a commit message or a
ticket. Commits get squashed, tickets get archived, and an agent rarely reads
either — the file is what it sees.

For a decision that spans files, keep the full explanation in shared project
documentation and reference it where needed. Avoid copying the same explanation
into several comments that can drift apart.

Notes for a reviewer ("check this part carefully") belong in the PR
description. They are about this change, not about the code.

## Commented-out code

Delete it. Tracked history belongs in git. A block of dead code with no
explanation is a question nobody can answer, and an agent may read it as a hint
and bring it back.

## TODOs

A future agent may act on a TODO, so the condition has to be one it can check.
Say what would have to be true to do it and what action follows:

```php
// TODO: drop the legacy branch once composer.json requires PHP 8.1+.
```

A TODO records deferred work; it does not by itself authorize unrelated changes.
