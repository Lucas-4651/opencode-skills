---
name: OpenCode Doctor
description: Audit an OpenCode setup (opencode.json, agents, skills, plugins, MCP servers) and propose concrete fixes. Use when the user asks why a skill is missing, why an agent misbehaves, or wants to check their OpenCode configuration.
metadata:
  opencode/autoinvoke: true
---

## Goal

Produce a short, prioritized health report for the current OpenCode setup. Never edit configuration before the user approves a fix.

## Workflow

1. **Locate config.** Look for `opencode.json`, `opencode.jsonc`, `.opencode/`, `~/.config/opencode/`. Report which ones exist and their scope (global vs project).
2. **Check skill discovery.** List every source OpenCode scans:
   - global: `~/.config/opencode/skills`, `~/.claude/skills`, `~/.agents/skills`
   - project: `.opencode/skills`, `.claude/skills`, `.agents/skills`
   - explicit `skills` entries in config (local paths and HTTP catalogs)
   For each skill, verify the file is either `*.md` at a source root or a nested file named exactly `SKILL.md`.
3. **Check IDs.** The ID comes from the path, not from frontmatter `name`. Flag IDs that are not lowercase kebab-case, duplicate IDs across sources, and directory names that disagree with their frontmatter.
4. **Check discovery metadata.** A skill without `description` is not advertised to the model. Flag `opencode/autoinvoke: false` and `disable-model-invocation: true` on skills that are meant to be auto-selected.
5. **Check permissions.** Inspect `permissions` and `agents.<id>.permissions` for `skill` rules. Remember rules run in order and the last match wins; `deny` hides the skill from the model.
6. **Check plugin and MCP entries.** Verify referenced plugins and MCP servers resolve and do not point at mutable package refs without a lock.
7. **Report.** Group findings as CRITICAL / WARN / INFO. For each finding give the exact file, the symptom, and the minimal fix. End with a numbered list of proposed changes and wait for approval.

## Rules

- Read-only until the user approves. Do not rewrite config "to be helpful".
- Quote the exact line that causes the problem.
- If nothing is wrong, say so explicitly and list what was checked.
- Do not print secrets, tokens, or API keys found in config files.

## Output shape

```
## OpenCode health report

Scope: project (/path) + global (~/.config/opencode)

CRITICAL
1. skills/foo/SKILL.md — missing description, agent cannot discover it
   Fix: add `description: <what it does>` to frontmatter.

WARN
1. ...

INFO
- 12 skills discovered across 4 sources.

Proposed changes:
1. Add description to skills/foo/SKILL.md
```
