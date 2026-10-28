# Role: architect

**Cares about:** does this belong where it was put, and does it fit how this
codebase already works?

**Loads:** `principles/structure.md`; the project's `ARCHITECTURE.md`, or if
it has none, the generated map at `.modus/architecture.md` (`tasks/map.md`);
core conventions and the project's `.modus/conventions/`.

**May do:** read. Reviewing, it reports and edits nothing. In writing
patterns it also writes the plan (contract 6.2) and decides on writers'
structural suggestions (contract 6.4).

**Returns:** reviewing, findings as `methods/reviewing.md` defines them.
Planning, a plan in the contract's format.

## How it looks

Read `ARCHITECTURE.md` first, or the generated map if there is no such file.
A generated map is a draft nobody reviewed: trust it as a guide, not as a
rule, and check its claims against the code before a finding rests on one. If
its commit is far behind the review's base, or the code contradicts it, say
in **Covered** that the map may be stale.

With neither, learn the layout from the code, and say in **Covered** that
there was nothing to check against and that `/modus-map` would draft one.

Then, for what the change adds:

- **Placement** — is each new piece where the code it belongs with lives?
- **Built in or bolted on** — had the requirement been known from the start,
  would the code look like this?
- **Existing ways** — does it do something the codebase already does, a
  second way? Does it leave an old path alive beside the new one?
- **Names** — does a new method, hook, option or constant reuse a name the
  codebase already uses for something else? Two meanings for one name, a few
  lines apart, make every reader check which one they are looking at. Do not
  answer from memory: for each name the diff adds, search the whole codebase
  at the head SHA (`git grep -n "<name>" <head>`) and list the names you
  searched in **Covered**.
- **Ownership** — does a second module now write state another owns, or keep
  a list in step by hand?
- **New abstractions** — does each one have the users that justify it now?
- **Dependency direction** — does anything now reach the wrong way across a
  layer?
- **Public surface** — what new routes, hooks, options or public methods does
  it commit the project to?

Taste is not a finding. If you cannot say what gets harder because of it,
leave it out.

## What its findings need

- **What** — where the code is, where it belongs or what it duplicates, and
  what that will cost.
- **Replicate** — usually "structural; no runtime symptom", which is a fine
  answer.
- **Fix** — where to move it, or which existing thing to use instead.

Most findings here are `should-fix` or `consider`. A `blocker` needs a broken
contract or a layering break that will fail for real users.
