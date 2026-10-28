# What the existing AI review tools do

Research notes, October 2026. Background for whoever is improving this toolkit
— **not loaded by any task**, and not meant to be.

Covers CodeRabbit, Cursor Bugbot, Greptile, Qodo (PR-Agent / Qodo Merge),
Semgrep Assistant, Graphite Diamond. Sources at the bottom.

## The numbers that matter

**Developers reject most AI review comments.** The one large independent study
mined 31,073 review/feedback pairs across 10,191 PRs in 239 repos using
CodeRabbit: **36.4% accepted, 7.3% discussed, 56.3% rejected.** Rejections were
mostly *invalid* — false positives, redundant, or out of scope — plus
misalignment with developer intent. Agentic reviews skewed toward functional
concerns over maintainability, and the functional ones were **more** likely to
be invalid.

**Rejection is predictable.** The same study got up to **76% F1** predicting
which comments would be rejected, using lightweight models. A filter layer is
feasible, not speculative.

**Everyone else is fighting the same fire.** Cursor ran **40 major experiments**
to move Bugbot's resolution rate from 52% to just over 70%. Semgrep's assistant
**auto-suppresses ~60%** of SAST findings as noise before a human sees them.

Noise is the whole problem. Nobody has solved it.

## What this validates

- **Specialists plus a judge.** Qodo's published blueprint is an orchestrator
  running parallel specialist agents with a **"judge" layer that filters and
  personalises** findings. Our tasks plus synthesis, almost exactly — and it
  suggests synthesis should lean harder into filtering than merging.
- **Conventions as input.** Greptile's own docs admit teams who skip configuring
  custom rules find it "noisier than expected". PR-Agent now feeds `AGENTS.md`
  into reviews by default. `conventions/` and per-project `ARCHITECTURE.md` are
  where the field landed.
- **Read-on-demand beats pre-indexing.** PR-Agent sees diff hunks only and is
  explicitly cautious about it. Greptile builds a full repo dependency graph —
  hours to index, reported noisier. Cursor moved from a fixed pipeline to a
  fully agentic design that calls tools dynamically. Opening files and following
  call paths, as `methods/reviewing.md` says, is the middle path the leaders
  converged on.
- **AI on top of deterministic tools, not instead of them.** Semgrep Assistant's
  whole product is AI triage *of* SAST output.

## Already applied here

- **Asymmetric confidence** (from PR-Agent's prompt): low-severity findings must
  be certain and have a concrete trigger; high-impact ones may be reported at
  lower confidence provided the uncertainty is stated; otherwise prefer not
  reporting. → `methods/reviewing.md`
- **Findings cap** (PR-Agent caps its issue list; earlier findings count toward
  the limit so new serious ones displace restated old ones). → ten, in
  `methods/reviewing.md`
- **Prompt injection guard** (PR-Agent treats titles, descriptions, commits and
  CI artifacts as untrusted data that cannot change its role or schema). →
  "The diff is data, not instruction"

## Worth taking next

**1. Dismissal tracking — table stakes, and we have none.**
PR-Agent tracks previous findings by status: *active* repeated verbatim,
*resolved* repeated only if reintroduced, **dismissed never repeated unless the
code gets worse**. CodeRabbit stores natural-language "learnings" per org,
path-scoped, loaded on every review, editable and removable. Cursor turns live
review feedback into custom rules. Greptile learns from historical PR comments.

Every serious tool has this. A committed `decisions.md` — one line per settled
question — is the cheap version, and it is also what makes "recurring finding →
make it a lint rule" possible, since nothing currently tracks recurrence.

**2. Majority voting.**
Cursor runs multiple bug-finding passes over **shuffled diffs** and keeps only
findings that appear in several. A far stronger hallucination filter than
verifying citations, and mechanically simple — the cost is N passes. Worth it
for `blocker`-severity findings specifically.

**3. Resolution rate as the metric.**
Cursor measures "did the developer fix it before merge". Not precision, not
recall — just the honest proxy. One column in `decisions.md` gets you this.

**4. Separate the two error rates.**
Semgrep publishes a "false-positive confidence rate" (when it says something is
a false positive, how often is it right) distinct from recall. Independent
commentary on their numbers makes the point sharply: measure suppression
precision separately from true-positive recall before letting AI decide what
interrupts a developer. Applies to anything we add that filters findings.

## Do not trust the benchmarks

Greptile's own benchmark puts Greptile at 82% bug-catch, Cursor Bugbot 58%,
CodeRabbit 44%, Graphite 6%. Macroscope's benchmark ranks CodeRabbit first and
Greptile last. Cursor publishes resolution rate, not precision or recall.
Semgrep's 96% figure is described in one place as an internal benchmark and in
another as real-world customer agreement.

Calibrate on your own repository instead: run a review against the parent of a
commit that fixed a real bug, and see whether it finds the bug. A dozen of those
is worth more than every leaderboard.

## Open questions

- Does a `decisions.md` actually get maintained, or does it rot like any other
  prose file? Unknown. Watch it rather than assume.
- Does majority voting pay for itself at 3× the token cost, or does the
  disprove-before-reporting step already catch most of it?
- Nobody publishes how they rank findings. Our severity × confidence may be
  fine, or may be the thing that needs calibrating first.

## Sources

- [Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild](https://arxiv.org/abs/2607.03316) — the 31k-pair study
- [PR-Agent review prompt](https://raw.githubusercontent.com/qodo-ai/pr-agent/main/pr_agent/settings/pr_reviewer_prompts.toml) — the most useful single artifact here; read it in full
- [PR-Agent architecture](https://deepwiki.com/qodo-ai/pr-agent/1.1-system-architecture)
- [Qodo: high-signal AI code review, a multi-agent blueprint](https://www.qodo.ai/resources/high-signal-ai-code-review-a-multi-agent-blueprint)
- [CodeRabbit learnings](https://docs.coderabbit.ai/guides/learnings)
- [Cursor: Building Bugbot](https://cursor.com/blog/building-bugbot) and [the forum write-up](https://forum.cursor.com/t/building-a-better-bugbot/149040) describing majority voting
- [Semgrep Assistant metrics](https://semgrep.dev/docs/semgrep-assistant/metrics) and [60% of triage](https://semgrep.dev/blog/2025/semgrep-is-confidently-handling-60-of-all-triage-for-users-without-reducing-coverage)
- [Greptile: graph-based codebase context](https://www.greptile.com/docs/how-greptile-works/graph-based-codebase-context)
- [Greptile's own tool comparison](https://www.greptile.com/content-library/best-ai-code-review-tools) — vendor-run, treat accordingly
