const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { planInstall } = require('../lib/install.js')

function makeTree(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-skills-'))
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(dir, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content, 'utf8')
  }
  return dir
}

test('planInstall copies all skills into an empty destination', () => {
  const source = makeTree({
    'alpha/SKILL.md': 'alpha body',
    'beta/SKILL.md': 'beta body',
  })
  const destination = makeTree({})

  const plan = planInstall(source, destination)

  assert.deepEqual(plan.toCopy.sort(), ['alpha', 'beta'])
  assert.deepEqual(plan.conflicts, [])
})

test('planInstall flags a skill that would overwrite different content', () => {
  const source = makeTree({ 'alpha/SKILL.md': 'new body' })
  const destination = makeTree({ 'alpha/SKILL.md': 'user edits' })

  const plan = planInstall(source, destination)

  assert.deepEqual(plan.toCopy, [])
  assert.deepEqual(plan.conflicts, ['alpha'])
})

test('planInstall treats an identical skill as safe to copy', () => {
  const source = makeTree({ 'alpha/SKILL.md': 'same body' })
  const destination = makeTree({ 'alpha/SKILL.md': 'same body' })

  const plan = planInstall(source, destination)

  assert.deepEqual(plan.toCopy, ['alpha'])
  assert.deepEqual(plan.conflicts, [])
})
