const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  parseSkill,
  validateSkill,
  validateCatalog,
} = require('../lib/frontmatter.js')

const validSkill = `---
name: OpenCode Doctor
description: Audit an OpenCode configuration and propose fixes
metadata:
  opencode/autoinvoke: true
---

## Workflow

1. Read \`opencode.json\`.
2. Report issues.
`

test('parseSkill extracts frontmatter fields', () => {
  const skill = parseSkill(validSkill)

  assert.equal(skill.name, 'OpenCode Doctor')
  assert.equal(
    skill.description,
    'Audit an OpenCode configuration and propose fixes'
  )
  assert.equal(skill.metadata['opencode/autoinvoke'], true)
  assert.match(skill.body, /## Workflow/)
  assert.doesNotMatch(skill.body, /^---/)
})

test('parseSkill returns empty metadata when absent', () => {
  const skill = parseSkill('---\ndescription: Do a thing\n---\n\nBody')
  assert.deepEqual(skill.metadata, {})
})

test('validateSkill accepts a valid skill', () => {
  assert.deepEqual(validateSkill(validSkill, 'opencode-doctor'), [])
})

test('validateSkill rejects an id that is not kebab-case', () => {
  const errors = validateSkill(validSkill, 'OpenCode_Doctor')
  assert.ok(errors.some((e) => /kebab-case/.test(e)))
})

test('validateSkill rejects a missing description', () => {
  const errors = validateSkill('---\nname: Test\n---\n\nBody', 'test')
  assert.ok(errors.some((e) => /description/.test(e)))
})

test('validateSkill rejects a missing skill body', () => {
  const errors = validateSkill('---\ndescription: Test\n---\n', 'test')
  assert.ok(errors.some((e) => /body/.test(e)))
})

test('validateCatalog accepts a catalog of valid entries', () => {
  const catalog = {
    skills: [
      { name: 'opencode-doctor', version: '1', files: ['SKILL.md'] },
    ],
  }
  assert.deepEqual(validateCatalog(catalog, { 'opencode-doctor': validSkill }), [])
})

test('validateCatalog flags a version that is not a string', () => {
  const catalog = {
    skills: [
      { name: 'opencode-doctor', version: 1, files: ['SKILL.md'] },
    ],
  }
  const errors = validateCatalog(catalog, { 'opencode-doctor': validSkill })
  assert.ok(errors.some((e) => /version/.test(e)))
})

test('validateCatalog flags a missing SKILL.md file', () => {
  const catalog = {
    skills: [
      { name: 'opencode-doctor', version: '1', files: ['references/x.md'] },
    ],
  }
  const errors = validateCatalog(catalog, { 'opencode-doctor': validSkill })
  assert.ok(errors.some((e) => /SKILL\.md/.test(e)))
})
