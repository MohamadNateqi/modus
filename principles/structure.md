# Structure

Knowledge, not instructions. True whether you are placing new code or judging
where someone else put it.

## The question underneath all of it

**Would the next person look for this code here, and does it make the next
change easier or harder?** Structure is judged by the changes it makes cheap,
not by how it looks.

## Placement

Code belongs next to what changes with it, for the same reason. Logic about
an object's data, written into one caller instead of onto the object, gets
written again by the next caller, and the copies drift.

## The codebase's way first

A second way to do something the codebase already does — another HTTP client,
another error style, another way to read settings — doubles what everyone has
to know, and the two drift apart. Whichever way the next agent finds first is
the one it copies, so every way keeps gaining callers. Follow the existing way
unless it is the problem, and then change it on purpose: move the callers and
delete the old way in the same change, unless outside users still depend on
it. A new path kept "for now" beside the old one becomes permanent.

## Built in, not bolted on

If the requirement had been known from the start, would the code look like
this? A feature added as a special-case `if` in an unrelated flow, or a second
flag that must stay in sync with the first, is bolted on. Each one makes the
next change harder to place.

## One owner per piece of state

When two modules write the same state, or each keep their own copy, whoever
edits one writer cannot see the other, and their rules drift. Give each piece
of state one owner; everything else reads it or asks the owner to change it.

The same goes for lists: two places that list the same items, kept in step by
hand, will disagree. Keep one and derive the rest, or make the build fail when
they differ.

## Abstraction earns its place

An interface with one implementation, a base class with one child, an option
nobody sets: indirection paid for now, for a benefit that may never come.
Repetition is cheaper than the wrong abstraction. The second or third real
occurrence is usually when an abstraction starts paying.

A layer earns its place by hiding a decision. A method that forwards the same
arguments to another of the same shape, or an interface so wide that callers
must learn the implementation anyway, adds reading and hides nothing.

An internal detail — a storage format, a wire type, a framework object — that
shows up in several modules means changing it takes coordinated edits across
all of them. Keep it behind the one module that owns it.

## Dependencies point one way

A lower layer that reaches into a higher one, or two modules that depend on
each other, means a change on either side breaks the other. The direction is
usually visible in the imports.

## Public surface is a promise

Every public method, route, hook, event, option or config key is something
someone may come to depend on. Adding one is easy; removing it later is a
breaking change.

## One job per unit

A function or file doing several jobs is where unrelated changes collide, and
where a fix to one job breaks another.
