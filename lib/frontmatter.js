'use strict'

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function scalar(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  return trimmed
}

/**
 * Minimal frontmatter reader for the fields OpenCode actually uses.
 * No YAML dependency: frontmatter here is flat plus one `metadata:` block.
 */
function parseFrontmatter(raw) {
  const result = { metadata: {} }
  let section = null

  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    const indented = /^\s+/.test(line)
    const separator = line.indexOf(':')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = scalar(line.slice(separator + 1))

    if (!indented && key === 'metadata') {
      section = 'metadata'
    } else if (section === 'metadata' && indented) {
      result.metadata[key] = value
    } else if (!indented) {
      section = null
      result[key] = value
    }
  }

  return result
}

function parseSkill(text) {
  const normalized = text.replace(/\r\n/g, '\n')
  let frontmatter = {}
  let body = normalized.trim()

  if (normalized.startsWith('---')) {
    const end = normalized.indexOf('\n---', 3)
    if (end !== -1) {
      frontmatter = parseFrontmatter(normalized.slice(3, end))
      body = normalized.slice(end + 4).trim()
    }
  }

  return {
    name: frontmatter.name || undefined,
    description: frontmatter.description || undefined,
    metadata: frontmatter.metadata || {},
    body,
  }
}

/** Validate the conventions OpenCode recommends for portable skill IDs. */
function validateSkill(text, id) {
  const errors = []
  const skill = parseSkill(text)

  if (!ID_PATTERN.test(id)) {
    errors.push(`skill id "${id}" must be lowercase kebab-case`)
  }
  if (!skill.description || typeof skill.description !== 'string') {
    errors.push(`skill "${id}" is missing a description`)
  }
  if (!skill.body) {
    errors.push(`skill "${id}" has an empty body`)
  }

  return errors
}

/** Validate the index.json catalog consumed by OpenCode. */
function validateCatalog(catalog, skills) {
  const errors = []

  if (!catalog || !Array.isArray(catalog.skills)) {
    return ['catalog must contain a "skills" array']
  }

  for (const entry of catalog.skills) {
    const name = entry && entry.name

    if (!name || !ID_PATTERN.test(name)) {
      errors.push(`catalog entry "${name}" must be lowercase kebab-case`)
    }
    if (typeof entry.version !== 'string') {
      errors.push(`catalog entry "${name}" version must be a string`)
    }
    if (!Array.isArray(entry.files) || !entry.files.includes('SKILL.md')) {
      errors.push(`catalog entry "${name}" must list SKILL.md in files`)
    }
    if (skills && skills[name] === undefined) {
      errors.push(`catalog entry "${name}" has no matching skill directory`)
    }
  }

  return errors
}

module.exports = { parseSkill, validateSkill, validateCatalog, ID_PATTERN }
