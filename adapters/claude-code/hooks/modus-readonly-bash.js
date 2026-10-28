#!/usr/bin/env node
// PreToolUse hook for modus reviewer and synthesis agents. Allows a Bash
// command only if every part of it is a known read command; anything else is
// blocked with exit code 2, and the reason goes back to the agent.
//
// Removing Write and Edit from an agent is not enough on its own: a shell can
// still write (`sed -i`, `>`, `git diff --output`). This is what makes a
// reviewer read-only in fact, not just by instruction (contract rule 4).
//
// It fails closed: input it cannot parse is blocked, not waved through.

const READ_PROGRAMS = new Set([
  'git', 'ls', 'cat', 'head', 'tail', 'wc', 'grep', 'rg', 'sort', 'cut',
  'pwd', 'echo', 'printf',
]);

const GIT_READ_SUBCOMMANDS = new Set([
  'diff', 'log', 'show', 'status', 'rev-parse', 'rev-list', 'merge-base',
  'ls-files', 'ls-tree', 'blame', 'cat-file', 'grep', 'describe', 'shortlog',
]);

// Flags that turn an otherwise read-only program into one that writes files
// or runs other programs.
const WRITING_FLAGS = {
  git: [/^--output/, /^-O/, /^--open-files-in-pager/, /^--ext-diff$/],
  rg: [/^--pre/],
  sort: [/^-o/, /^--output/],
};

function block(reason) {
  process.stderr.write(`modus: blocked, reviewers run read commands only. ${reason}\n`);
  process.exit(2);
}

function checkGit(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) {
    if (args[i] === '--no-pager') { i += 1; continue; }
    if (args[i] === '-C') { i += 2; continue; }
    // `-c` can set a pager or an alias, which runs arbitrary commands.
    block(`git option ${args[i]} is not allowed.`);
  }
  const sub = args[i];
  if (!GIT_READ_SUBCOMMANDS.has(sub)) {
    block(`git ${sub ?? ''} is not a read command.`);
  }
}

function checkSegment(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return;
  const [program, ...args] = tokens;
  if (!READ_PROGRAMS.has(program)) {
    block(`${program} is not on the read-only list.`);
  }
  for (const pattern of WRITING_FLAGS[program] ?? []) {
    const bad = args.find((a) => pattern.test(a));
    if (bad) block(`${program} ${bad} can write or run programs.`);
  }
  if (program === 'git') checkGit(args);
}

function check(command) {
  // Harmless stderr redirections agents add by habit; anything else with a
  // redirect, substitution or background job is refused outright.
  const cleaned = command.replace(/\s2>&1/g, '').replace(/\s2>\s*\/dev\/null/g, '');
  if (/[>`]|\$\(|<\(|(^|[^&])&($|[^&])/.test(cleaned)) {
    block('redirects, substitutions and background jobs are not allowed.');
  }
  for (const segment of cleaned.split(/&&|\|\||[;|\n]/)) {
    checkSegment(segment);
  }
}

let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    block('could not read the hook input.');
  }
  if (input.tool_name !== 'Bash') process.exit(0);
  const command = input.tool_input?.command;
  if (typeof command !== 'string') block('no command found.');
  check(command);
  process.exit(0);
});
