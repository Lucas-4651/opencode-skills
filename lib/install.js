'use strict'

const fs = require('node:fs')
const path = require('node:path')

/**
 * Decide what a local install would do without touching either directory.
 * A same-ID skill with different content is a conflict: silently replacing
 * user edits is worse than asking for --force.
 */
function planInstall(sourceDir, destDir) {
  const toCopy = []
  const conflicts = []

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const sourceFile = path.join(sourceDir, entry.name, 'SKILL.md')
    if (!fs.existsSync(sourceFile)) continue

    const content = fs.readFileSync(sourceFile, 'utf8')
    const destFile = path.join(destDir, entry.name, 'SKILL.md')

    if (fs.existsSync(destFile)) {
      const existing = fs.readFileSync(destFile, 'utf8')
      if (existing !== content) {
        conflicts.push(entry.name)
        continue
      }
    }
    toCopy.push(entry.name)
  }

  return { toCopy, conflicts }
}

module.exports = { planInstall }
