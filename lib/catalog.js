'use strict'

/**
 * Resolve a GitHub `owner/repo` from the various shapes found in package.json
 * and environment variables.
 */
function parseRepository(repository) {
  if (!repository) {
    throw new Error(
      'repository is not configured: set "repository" in package.json ' +
        '(owner/repo) or the OPENCODE_SKILLS_REPO environment variable'
    )
  }

  let raw
  if (typeof repository === 'string') {
    raw = repository
  } else if (
    typeof repository === 'object' &&
    typeof repository.url === 'string'
  ) {
    raw = repository.url
  } else {
    throw new Error('repository must be a string or an object with a url field')
  }

  raw = raw
    .trim()
    .replace(/^git\+/, '')
    .replace(/^https?:\/\/(?:www\.)?github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')

  const parts = raw.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`repository must be in owner/repo format, got "${repository}"`)
  }

  if (/YOUR_USERNAME|OWNER|<[^>]+>/i.test(raw)) {
    throw new Error(
      'repository still contains a placeholder owner: replace YOUR_USERNAME ' +
        'with your GitHub username before publishing'
    )
  }

  return raw
}

/**
 * OpenCode loads an HTTP catalog from `<base-url>/index.json`.
 * Our catalog lives in the `skills/` directory of the repository.
 */
function catalogBaseUrl(pkg, branch = 'main') {
  const repo = parseRepository(pkg.repository)
  return `https://raw.githubusercontent.com/${repo}/${branch}/skills/`
}

/** The exact snippet a user pastes into opencode.json. */
function catalogSnippet(pkg, branch = 'main') {
  return JSON.stringify({ skills: [catalogBaseUrl(pkg, branch)] }, null, 2)
}

module.exports = { parseRepository, catalogBaseUrl, catalogSnippet }
