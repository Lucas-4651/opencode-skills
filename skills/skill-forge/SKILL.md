---
name: Skill Forge
description: Turn a repository, CLI, API, or repeated workflow into an OpenCode skill with a machine-readable contract, references, and a validation script. Use when the user wants to package expertise into a reusable skill.
metadata:
  opencode/autoinvoke: true
---

## Goal

Create a directory-based skill that OpenCode can discover and load by ID: `<skill-id>/SKILL.md` plus only the supporting files the skill actually needs.

## Workflow

1. **Extract the expertise.** Ask what task the agent should perform, which inputs it receives, and what a correct result looks like. If a source repo or CLI exists, read it before writing a single instruction.
2. **Pick the ID.** Lowercase kebab-case, 1-64 chars, unique, matching the directory name. The ID comes from the path; frontmatter `name` is only a display label.
3. **Write the contract.** The `description` is the only thing advertised to the model, so make it specific: what it does and when to use it. Add `metadata.opencode/autoinvoke: false` only if the skill must be loaded explicitly by `@skill-id`.
4. **Write the body as a procedure.** Numbered steps, explicit stop conditions, and a defined output shape. Prefer "read file X, then run Y" over vague advice.
5. **Add supporting files only when needed.** `references/` for long policy docs, `scripts/` for deterministic checks, `templates/` for output skeletons. Paths inside a skill are relative to its own directory.
6. **Validate.** Run `npx opencode-skills validate` before declaring the skill done. Confirm every catalog entry lists `SKILL.md` and has a string version.
7. **Prove discovery.** Confirm the skill is advertised: open a fresh session, check it appears in the model's skill list, then load it with `@<skill-id>`.

## Rules

- One skill = one job. Split instead of adding a second workflow to the same file.
- Keep `SKILL.md` under ~200 lines. Move detail into `references/`.
- Never put secrets or machine-specific absolute paths in a skill.
- Do not create flat `*.md` skills when the skill needs supporting files; use the directory form.
- Bump the catalog `version` whenever a published skill file changes, or clients will serve a cached copy.

## Deliverable

```
skills/<skill-id>/
├── SKILL.md
├── references/     # optional
├── scripts/        # optional
└── templates/      # optional
```
