const { test } = require('node:test')
const assert = require('node:assert/strict')

const { renderScorecard } = require('../lib/scorecard.js')

test('renderScorecard is an svg with the skill count', () => {
  const svg = renderScorecard({ count: 3, repo: 'acme/opencode-skills' })

  assert.match(svg, /^<svg/)
  assert.match(svg, /<\/svg>$/)
  assert.match(svg, /3/)
  assert.match(svg, /opencode-skills/)
})

test('renderScorecard escapes XML-special characters', () => {
  const svg = renderScorecard({
    count: 1,
    repo: 'a&b/opencode-skills',
  })

  assert.match(svg, /a&amp;b/)
  assert.doesNotMatch(svg, /a&b/)
})

test('renderScorecard uses singular wording for one skill', () => {
  const svg = renderScorecard({ count: 1, repo: 'acme/opencode-skills' })
  assert.match(svg, /1 skill/)
})

test('renderScorecard uses plural wording for zero or many skills', () => {
  assert.match(
    renderScorecard({ count: 0, repo: 'acme/opencode-skills' }),
    /0 skills/
  )
  assert.match(
    renderScorecard({ count: 2, repo: 'acme/opencode-skills' }),
    /2 skills/
  )
})
