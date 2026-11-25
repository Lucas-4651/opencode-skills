# opencode-skills

> Production-ready agent skills for **OpenCode**. One line to install, auto-updating catalog, tested on OpenCode — not ported from Claude Code.

[![stars](https://img.shields.io/github/stars/Lucas-4651/opencode-skills?style=flat)](https://github.com/Lucas-4651/opencode-skills/stargazers)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![OpenCode](https://img.shields.io/badge/works%20with-OpenCode-7c3aed)](https://opencode.ai)

Most skill packs list Claude Code, Cursor and Codex first — OpenCode is an afterthought. This one is built the other way around: OpenCode-native discovery, path-derived IDs, `opencode.json` catalogs, and skill permissions. It still works everywhere that reads `SKILL.md`.

## Install

Add one line to `opencode.json`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "https://raw.githubusercontent.com/Lucas-4651/opencode-skills/main/skills/"
  ]
}
```

Restart OpenCode. That's it — no files copied, and skills update automatically when the catalog version changes.

Not sure of the URL? Let the CLI print it for you:

```bash
npx --yes github:Lucas-4651/opencode-skills install
```

The CLI runs straight from GitHub — there is no npm package to install and no publish step. The catalog install itself needs no CLI at all.

Prefer local files (offline, or you want to edit them)?

```bash
npx --yes github:Lucas-4651/opencode-skills install --local
```

Local install refuses to overwrite a skill you have edited. Add `--force` only if you are sure you want to replace those files.

## Skills

| Skill | What it does |
|-------|--------------|
| `@opencode-doctor` | Audits `opencode.json`, agents, skills, plugins, permissions and MCP servers; reports prioritized fixes without touching config |
| `@skill-forge` | Turns a repo, CLI or repeated workflow into a valid directory-based skill with a machine-readable contract |
| `@mcp-wrap` | Wraps an API or OpenAPI spec into a small read-first MCP server plus its OpenCode registration |
| `@repo-onboard` | Generates a verified `AGENTS.md` / `CLAUDE.md` from an unfamiliar codebase |

Load any skill explicitly with `@skill-id`, or let OpenCode select it by description.

## Why a catalog?

OpenCode can load skills from an HTTP catalog. The repo publishes `skills/index.json`; OpenCode fetches each skill and caches it by `version`. Bumping the version is the entire release process.

```
skills/
├── index.json          # catalog: name + version + files
├── opencode-doctor/
│   └── SKILL.md
├── skill-forge/
│   └── SKILL.md
├── mcp-wrap/
│   └── SKILL.md
└── repo-onboard/
    └── SKILL.md
```

## Share the badge

Each install can display how many skills are active, linked back to this repo:

```bash
npx --yes github:Lucas-4651/opencode-skills scorecard --out scorecard.svg
```

Wrap it in a link so the badge is a real backlink — an SVG loaded through a Markdown `![]()` embed is not clickable on GitHub:

```html
<a href="https://github.com/Lucas-4651/opencode-skills">
  <img src="./scorecard.svg" alt="opencode-skills" />
</a>
```

Every badge is a backlink. That's the whole growth loop.

## CLI

```bash
npx --yes github:Lucas-4651/opencode-skills install        # print the opencode.json snippet
npx --yes github:Lucas-4651/opencode-skills install --local # copy skills into ~/.config/opencode/skills
npx --yes github:Lucas-4651/opencode-skills list           # list skills and descriptions
npx --yes github:Lucas-4651/opencode-skills validate       # validate catalog + all SKILL.md files
npx --yes github:Lucas-4651/opencode-skills scorecard      # generate a shareable SVG badge
```

## Contributing a skill

1. Create `skills/<kebab-case-id>/SKILL.md` with `name`, `description`, and a numbered workflow.
2. Keep `SKILL.md` under ~200 lines; move detail into `references/`.
3. Add an entry to `skills/index.json` with a string `version`.
4. Bump the version when you change a published skill — otherwise clients keep the cached copy.
5. Run `npm test && npm run validate`.

See `@skill-forge` for the full contract.

## Overriding the catalog URL

The CLI derives the catalog URL from `package.json` → `repository`. Forked the repo? Override per run:

```bash
npx --yes github:Lucas-4651/opencode-skills install --repo your-user/your-fork
OPENCODE_SKILLS_REPO=your-user/your-fork npx --yes github:Lucas-4651/opencode-skills install
```

## License

MIT
