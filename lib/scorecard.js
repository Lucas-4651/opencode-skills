'use strict'

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Shareable badge users paste in their README. The link back to the repo is
 * the growth loop: every install becomes a backlink.
 */
function renderScorecard({ count, repo }) {
  const label = `${count} skill${count === 1 ? '' : 's'}`
  const target = `https://github.com/${repo}`
  const safeLabel = escapeXml(label)
  const safeRepo = escapeXml(repo)
  const safeTarget = escapeXml(target)
  const width = 120 + label.length * 7

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${safeLabel} powered by OpenCode skills">`,
    `<a href="${safeTarget}" target="_blank" rel="noopener">`,
    `<rect width="70" height="20" rx="4" fill="#0f172a"/>`,
    `<rect x="70" width="${width - 70}" height="20" rx="4" fill="#2563eb"/>`,
    `<rect x="66" width="8" height="20" fill="#2563eb"/>`,
    `<text x="35" y="14" fill="#f8fafc" font-family="ui-monospace,monospace" font-size="11" text-anchor="middle">skills</text>`,
    `<text x="${70 + (width - 70) / 2}" y="14" fill="#ffffff" font-family="ui-monospace,monospace" font-size="11" text-anchor="middle">${safeLabel}</text>`,
    `<title>${safeRepo} — ${safeLabel} installed via opencode-skills</title>`,
    `</a>`,
    `</svg>`,
  ].join('')
}

module.exports = { renderScorecard, escapeXml }
