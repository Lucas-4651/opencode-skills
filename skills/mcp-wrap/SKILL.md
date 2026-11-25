---
name: MCP Wrap
description: Wrap an existing API, CLI, or OpenAPI spec into a minimal MCP server that an OpenCode agent can call. Use when the user wants to give an agent access to a tool through MCP.
metadata:
  opencode/autoinvoke: true
---

## Goal

Produce the smallest working MCP server that exposes a bounded, useful set of operations, plus the OpenCode config needed to register it.

## Workflow

1. **Bound the surface.** Pick 3-8 read-first operations. Prefer a small set the agent can reason about over a full API mirror. State explicitly what is intentionally excluded.
2. **Define the contract.** For each tool: name, one-line description, typed input schema, typed output shape, and error shape. Descriptions are what the model reads to choose a tool, so write them as usage hints, not labels.
3. **Implement with validation.** Validate every input with a schema at the server boundary. Never pass raw user input into a shell command, SQL string, or URL path without encoding.
4. **Fail safely.** Return structured errors, never stack traces. Redact tokens and credentials from all responses and logs.
5. **Register in OpenCode.** Add the server to `opencode.json` under `mcp`, using an environment variable for any secret. Do not hardcode keys.
6. **Smoke test.** Start the server, list tools, call one read tool with a valid input and one with an invalid input. Record both outputs.

## Rules

- Read-only by default. Any write operation must be clearly named (`create_`, `delete_`) and require explicit confirmation from the caller.
- Use pinned package versions in the server manifest. Mutable tags make agent behavior change without a code change.
- Keep the server local unless the user explicitly asks to deploy it.
- Do not invent API endpoints. If the spec is incomplete, say what is missing and stop.

## Output shape

```
## MCP wrap: <name>

Tools:
- <tool_name>(<inputs>) -> <output>  # <when to use>

Excluded: <list>

opencode.json:
<snippet>

Smoke test:
- list tools: PASS (N tools)
- valid call: PASS
- invalid call: PASS (structured error, no stack trace)
```
