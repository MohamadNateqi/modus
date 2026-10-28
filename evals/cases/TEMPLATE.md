# Case: <short-id>

```yaml
type: bug            # bug | clean
held_out: no         # yes for about a third of the cases
repository: <path or URL>
base: <SHA>          # parent of head
head: <SHA>          # the commit that introduced the bug, or the clean change
fix: <SHA>           # bug cases only: the commit that fixed it
```

## Answer key

Bug cases only. What the review must find:

- **Where:** `<file>:<line>`
- **Mechanism:** one or two sentences — what goes wrong, and for whom.

## Notes

Anything that helps judge a run: why this is a fair case, what a near miss
looks like.
