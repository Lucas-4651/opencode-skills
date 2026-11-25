---
name: Repo Onboard
description: Analyze an unfamiliar repository and generate an AGENTS.md / CLAUDE.md onboarding guide with an architecture map, entry points, conventions, and verification commands. Use when joining a project or setting up agent instructions for a new codebase.
metadata:
  opencode/autoinvoke: true
---

## Goal

Produce a verified onboarding document, not a guessed one. Every claim must come from a file that was actually read.

## Workflow

1. **Inventory.** Read manifest files (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, build files), the top-level tree, and existing instruction files. Identify language, package manager, test runner, and build commands from evidence.
2. **Map entry points.** Find the main binaries, HTTP handlers, CLI entry, and job/worker entry. Trace one real request or command end to end.
3. **Extract conventions.** Look for naming patterns, directory layout, error-handling style, and how tests are organized. Prefer what the codebase does over what is generally recommended.
4. **Detect conflicts.** If two conventions coexist, record both and ask the user which one is canonical instead of picking silently.
5. **Write the guide.** Sections: purpose, stack, layout, entry points, conventions, how to run, how to test, how to verify, and what not to change without asking.
6. **Verify commands.** Run the test and build commands you documented. If they fail, fix the document, not the repo.
7. **Check for drift.** Compare with existing instruction files. Append or correct rather than creating a competing root file.

## Rules

- Cite files with paths for every architectural claim.
- Never invent a command. If a command is not runnable here, label it as "not verified in this environment".
- Keep the guide under 250 lines. Link to deeper docs instead of copying them.
- Do not include secrets, internal hostnames, or personal paths.

## Output shape

```
# <repo> onboarding

## Stack (evidence)
- <claim> — `path/to/file`

## Layout
...

## Run / Test / Verify
- <command> — verified: PASS|FAIL|NOT RUN

## Conventions
...

## Ask before changing
...
```
