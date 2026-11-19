#!/usr/bin/env node
// Installs the modus adapters for Claude Code and Codex.
//
//   node adapters/install.js                      both tools, for your user
//   node adapters/install.js --tool claude-code   one tool
//   node adapters/install.js --project ../shop    into one project instead
//   node adapters/install.js --dry-run            show what would change
//   node adapters/install.js --uninstall          remove what it installed
//   node adapters/install.js --force              overwrite files it did not install
//   node adapters/install.js --check              show the installed version, change nothing
//
// Installed files point back at this checkout, so `git pull` here updates the
// core files every project uses. Re-run the installer after a pull that
// changes anything under adapters/.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Written into every installed file. It is how the installer tells its own
// files from a person's file that happens to share the name, so it never
// overwrites or deletes one of those without --force.
const MARK = 'modus-installed';

const ADAPTERS = path.resolve(__dirname);
const MODUS_ROOT = path.resolve(ADAPTERS, '..');

// Written into the installed skills, so a review can tell when the command
// it runs is older than the core files it reads, and say to re-install.
function modusVersion() {
  try {
    return fs.readFileSync(path.join(MODUS_ROOT, 'VERSION'), 'utf8').trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

const FILES = {
  'claude-code': [
    { src: 'claude-code/skills/modus-review/SKILL.md', dest: ['.claude', 'skills/modus-review/SKILL.md'] },
    { src: 'claude-code/skills/modus-map/SKILL.md', dest: ['.claude', 'skills/modus-map/SKILL.md'] },
    { src: 'claude-code/agents/modus-reviewer.md', dest: ['.claude', 'agents/modus-reviewer.md'] },
    { src: 'claude-code/agents/modus-synthesis.md', dest: ['.claude', 'agents/modus-synthesis.md'] },
  ],
  codex: [
    { src: 'codex/skills/modus-review/SKILL.md', dest: ['.agents', 'skills/modus-review/SKILL.md'] },
    { src: 'codex/skills/modus-map/SKILL.md', dest: ['.agents', 'skills/modus-map/SKILL.md'] },
    { src: 'codex/agents/modus-reviewer.toml', dest: ['.codex', 'agents/modus-reviewer.toml'] },
    { src: 'codex/agents/modus-synthesis.toml', dest: ['.codex', 'agents/modus-synthesis.toml'] },
  ],
};

function parseArgs(argv) {
  const args = { tools: Object.keys(FILES), project: null, dryRun: false, uninstall: false, force: false, check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--tool') {
      const tool = argv[++i];
      if (!FILES[tool]) fail(`unknown tool "${tool}": use ${Object.keys(FILES).join(' or ')}`);
      args.tools = [tool];
    } else if (a === '--project') {
      args.project = argv[++i];
      if (!args.project) fail('--project needs a path');
    } else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--uninstall') args.uninstall = true;
    else if (a === '--force') args.force = true;
    else if (a === '--check') args.check = true;
    else if (a === '--help' || a === '-h') { usage(); process.exit(0); }
    else fail(`unknown option "${a}"`);
  }
  return args;
}

function usage() {
  const lines = fs.readFileSync(__filename, 'utf8').split('\n').slice(1);
  const header = lines.slice(0, lines.findIndex((l) => !l.startsWith('//')));
  console.log(header.map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
}

function fail(message) {
  console.error(`modus install: ${message}`);
  process.exit(1);
}

const posix = (p) => p.split(path.sep).join('/');

// Where modus is, as the installed files should name it. Installing into a
// project that contains this checkout (a submodule) uses paths relative to
// the project, so the installed files work on every machine that clones it.
// Anything else uses this checkout's absolute path.
function locations(projectDir) {
  const rel = projectDir ? path.relative(projectDir, MODUS_ROOT) : null;
  const inside = rel !== null && rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
  const hook = 'adapters/claude-code/hooks/modus-readonly-bash.js';
  if (inside) {
    return { root: posix(rel), hook: `$CLAUDE_PROJECT_DIR/${posix(rel)}/${hook}` };
  }
  return { root: posix(MODUS_ROOT), hook: `${posix(MODUS_ROOT)}/${hook}` };
}

function render(src, where) {
  let text = fs.readFileSync(path.join(ADAPTERS, src), 'utf8')
    .replaceAll('{{MODUS_ROOT}}', where.root)
    .replaceAll('{{HOOK_PATH}}', where.hook)
    .replaceAll('{{MODUS_VERSION}}', modusVersion());
  const note = `${MARK} ${modusVersion()} from ${posix(MODUS_ROOT)}. Re-run adapters/install.js to update; edits here are overwritten.`;
  if (src.endsWith('.toml')) return `# ${note}\n${text}`;
  // Frontmatter must stay on the first line, so the note goes after it.
  const end = text.indexOf('\n---', 3);
  if (text.startsWith('---') && end !== -1) {
    const cut = end + '\n---'.length;
    return `${text.slice(0, cut)}\n\n<!-- ${note} -->${text.slice(cut)}`;
  }
  return `<!-- ${note} -->\n${text}`;
}

function ours(file) {
  return fs.readFileSync(file, 'utf8').includes(MARK);
}

// The version an installed file was stamped with, or null for a file
// installed before the stamp carried one.
function installedVersion(text) {
  const match = text.match(new RegExp(`${MARK} (\\S+) from `));
  return match ? match[1] : null;
}

function git(...argv) {
  try {
    return execFileSync('git', ['-C', MODUS_ROOT, ...argv], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

// Compares what is installed with what this checkout would install now. A
// file counts as current only if it is identical, so an adapter change made
// without a version bump still shows as out of date.
function check(args, base, where) {
  const commit = git('rev-parse', '--short', 'HEAD');
  const modified = commit !== null && git('status', '--porcelain', '--untracked-files=no') !== '';
  console.log(`modus here: ${modusVersion()} · ${commit ?? 'commit unknown'}${modified ? ' · modified' : ''}`);

  let stale = false;
  let installedAny = false;
  for (const tool of args.tools) {
    const label = `${tool}, ${args.project ? 'project' : 'user'} (${posix(base)})`;
    const versions = new Set();
    let present = 0;
    let differ = 0;
    let foreign = 0;
    for (const { src, dest } of FILES[tool]) {
      const target = path.join(base, dest[0], dest[1]);
      if (!fs.existsSync(target)) continue;
      const text = fs.readFileSync(target, 'utf8');
      if (!text.includes(MARK)) { foreign += 1; continue; }
      present += 1;
      versions.add(installedVersion(text) ?? 'before versioning');
      if (text !== render(src, where)) differ += 1;
    }
    const total = FILES[tool].length;
    if (present === 0) {
      console.log(`${label}: not installed${foreign ? `; ${foreign} file(s) of the same name were not installed by modus` : ''}`);
      continue;
    }
    installedAny = true;
    const version = [...versions].join(', ');
    if (differ === 0 && present === total) {
      console.log(`${label}: ${version}, up to date`);
    } else {
      stale = true;
      const missing = total - present;
      const parts = [differ && `${differ} of ${total} files differ`, missing && `${missing} missing`].filter(Boolean);
      console.log(`${label}: ${version}, out of date (${parts.join(', ')})`);
    }
  }

  const rerun = `node ${posix(__filename)}${args.project ? ` --project ${posix(base)}` : ''}`;
  if (stale) console.log(`Run: ${rerun}`);
  else if (!installedAny) console.log(`Nothing installed here. Run: ${rerun}`);
  process.exitCode = stale || !installedAny ? 1 : 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectDir = args.project ? path.resolve(args.project) : null;
  if (projectDir && !fs.existsSync(path.join(projectDir, '.git'))) {
    fail(`${projectDir} is not the root of a git repository`);
  }
  const base = projectDir ?? os.homedir();
  const where = locations(projectDir);
  if (args.check) {
    if (args.uninstall || args.dryRun || args.force) fail('--check changes nothing; use it alone, with --tool or --project');
    check(args, base, where);
    return;
  }
  const prefix = args.dryRun ? '(dry run) ' : '';
  let skipped = 0;

  console.log(`${prefix}modus at ${where.root}, ${args.uninstall ? 'removing from' : 'installing into'} ${posix(base)}`);

  for (const tool of args.tools) {
    for (const { src, dest } of FILES[tool]) {
      const target = path.join(base, dest[0], dest[1]);
      const shown = posix(path.relative(base, target));
      const exists = fs.existsSync(target);

      if (exists && !ours(target) && !args.force) {
        const verb = args.uninstall ? 'remove' : 'replace';
        console.log(`  skip    ${shown}: not installed by modus (use --force to ${verb} it)`);
        skipped += 1;
        continue;
      }

      if (args.uninstall) {
        if (!exists) continue;
        if (!args.dryRun) {
          fs.rmSync(target);
          const dir = path.dirname(target);
          if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
        }
        console.log(`  removed ${shown}`);
        continue;
      }

      const content = render(src, where);
      const unchanged = exists && fs.readFileSync(target, 'utf8') === content;
      if (!args.dryRun && !unchanged) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
      }
      console.log(`  ${unchanged ? 'same   ' : exists ? 'updated' : 'added  '} ${shown}`);
    }
  }

  if (!args.uninstall && args.tools.includes('claude-code')) {
    console.log('Claude Code: start a new session to load /modus-review and /modus-map. The read-only hook needs Node.js on the path.');
  }
  if (!args.uninstall && args.tools.includes('codex')) {
    console.log('Codex: start a new session; run them with $modus-review and $modus-map.');
  }
  if (skipped) process.exitCode = 2;
}

main();
