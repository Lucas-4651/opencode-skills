const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  parseRepository,
  catalogBaseUrl,
  catalogSnippet,
} = require('../lib/catalog.js')

test('parseRepository handles object form from package.json', () => {
  assert.equal(
    parseRepository({ url: 'git+https://github.com/acme/opencode-skills.git' }),
    'acme/opencode-skills'
  )
})

test('parseRepository handles short string form', () => {
  assert.equal(parseRepository('acme/opencode-skills'), 'acme/opencode-skills')
})

test('parseRepository handles https url form', () => {
  assert.equal(
    parseRepository('https://github.com/acme/opencode-skills'),
    'acme/opencode-skills'
  )
})

test('parseRepository rejects a placeholder owner', () => {
  assert.throws(
    () => parseRepository('YOUR_USERNAME/opencode-skills'),
    /placeholder/i
  )
})

test('parseRepository rejects a malformed repository', () => {
  assert.throws(() => parseRepository('not-a-repo'), /repository/i)
})

test('catalogBaseUrl points at the skills directory', () => {
  assert.equal(
    catalogBaseUrl({ repository: 'acme/opencode-skills' }),
    'https://raw.githubusercontent.com/acme/opencode-skills/main/skills/'
  )
})

test('catalogSnippet emits a valid opencode.json config', () => {
  const snippet = catalogSnippet({ repository: 'acme/opencode-skills' })
  const parsed = JSON.parse(snippet)

  assert.deepEqual(parsed, {
    skills: [
      'https://raw.githubusercontent.com/acme/opencode-skills/main/skills/',
    ],
  })
})
