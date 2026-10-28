#!/usr/bin/env node
// Installs the modus adapters for Claude Code and Codex.
//
//   node adapters/install.js                      both tools, for your user
//   node adapters/install.js --tool claude-code   one tool
//   node adapters/install.js --project ../shop    into one project instead
//   node adapters/install.js --dry-run            show what would change
//   node adapters/install.js --uninstall          remove what it installed
//   node adapters/install.js --force              overwrite files it did not install
//
// Installed files point back at this checkout, so `git pull` here updates the
// core files every project uses. Re-run the installer after a pull that
// changes anything under adapters/.

const fs = require('fs');
const os = require('os');
const path = require('path');

// Written into every installed file. It is how the installer tells its own
// files from a person's file that happens to share the name, so it never
// overwrites or deletes one of those without --force.
const MARK = 'modus-installed';

const ADAPTERS = path.resolve(__dirname);
const MODUS_ROOT = path.resolve(ADAPTERS, '..');

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
  const args = { tools: Object.keys(FILES), project: null, dryRun: false, uninstall: false, force: false };
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
    .replaceAll('{{HOOK_PATH}}', where.hook);
  const note = `${MARK} from ${posix(MODUS_ROOT)}. Re-run adapters/install.js to update; edits here are overwritten.`;
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectDir = args.project ? path.resolve(args.project) : null;
  if (projectDir && !fs.existsSync(path.join(projectDir, '.git'))) {
    fail(`${projectDir} is not the root of a git repository`);
  }
  const base = projectDir ?? os.homedir();
  const where = locations(projectDir);
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
