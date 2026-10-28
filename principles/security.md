# Security

Knowledge, not instructions. The same things are true whether you are writing
this code or reading someone else's. Stack-specific detail lives in packs.

## The question underneath all of it

For any path that handles input: **who can reach this, what can they control,
and what happens if they lie about it?**

Three separate questions, and the second and third are the ones people skip.
"Is the input sanitised" is a weaker question than "what can the caller make
this value mean further down".

## Entry points

Untrusted input enters at a small, enumerable set of places: HTTP routes and
handlers, form and API endpoints, webhooks and callbacks, CLI arguments, queue
and scheduled jobs acting on stored request data, uploaded files, headers and
cookies. A pack lists them for its stack.

A value from any of them stays untrusted until something checks it. Passing
through two functions does not launder it.

## Authentication is not authorisation

The most common serious bug in applications that hold other people's data, and
it has three shapes:

- Checking that someone is logged in where the question is what they may do.
  Being someone is not being allowed.
- A permission checked to *render* the page, but not to *perform* the action.
  The action is the thing an attacker calls.
- A CSRF token treated as an access check. It proves the request came from
  your form. It says nothing about who sent it or what they may do.

A check that allows by default fails open the day someone adds a case it did
not expect. Deny by default.

## Ownership

An ID in a request is a claim, not a fact. An order, account, document or
customer ID has to be checked against the current user before it is acted on.
This is IDOR, and it is the bug most likely to be sitting in an application
right now, because the code reads perfectly and the test suite passes.

- **Every way to reach the object is its own check.** The list, the detail
  view, the download, the export and the API each usually load it through a
  different path. One guarded path says nothing about the others.
- **Ownership is checked against the current role**, on every read — not
  against a grant recorded when the object was created, which survives the
  user's downgrade.
- **A cache in front of a guarded call** skips the guard on every hit, unless
  the cache key includes who is asking.
- **Error pages leak past a correct guard** when the 403 or 404 page is built
  outside it, with names, counts or links the caller may not see.

## Trust boundaries that look internal

Database rows, settings, cache entries, webhook bodies, and any value a
previous request let a user write — none of these are trusted just because
they came from your own storage. The question is who could have put them
there.

## Escaping is contextual

Escaped for HTML then used in an attribute, a URL, JavaScript, or a SQL `LIKE`
is not escaped. A value sanitised once and mutated afterwards is not
sanitised. The right call depends on where the value *lands*, not where it
came from.

In SQL, parameter binding protects values. It does not protect an
interpolated table or column name, and a placeholder built from user input
protects nothing.

## Files, paths and fetches

A filename or path segment from a request can traverse (`../`). A type check
that trusts the MIME type the client sent checks nothing — the client sets it.
Anything that fetches a URL the user supplies is a potential SSRF, and that
includes webhook or callback URLs stored in settings.

An incoming webhook is untrusted until its signature is verified. Anyone can
send the same request to the same URL.

Deserialising untrusted data (`unserialize`, pickle, YAML that builds objects)
lets the sender choose which objects get built, and object construction can
run code.

## Disclosure

Errors, log lines, API responses and notices leak: keys, tokens, customer
data, full paths. The failure path is where this usually happens, because
nobody looks at it twice.

## Secrets

An API key, token or password in code, a fixture or a comment is an incident,
not a style problem. Rotating it is part of the fix — removing the line is not
enough once it has been committed.

Tokens and secrets are compared in constant time; `==` leaks how much of the
guess was right. Tokens come from a cryptographic random source, never a
general-purpose one, and they expire.

## Changes that reduce a defence

Loosening a permission, widening a query, making a check conditional: worth
stopping over even when no exploit is obvious. A deliberate reduction in
defence should be deliberate, and often it is a side effect nobody intended.

## New capability is new surface

A feature that lets somebody do something they could not do before is new
attack surface even when every line of it is individually correct. Ask what
the feature *allows*, and to whom — not only whether the code is right.
