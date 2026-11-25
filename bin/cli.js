#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

const {
  parseRepository,
  catalogBaseUrl,
  catalogSnippet,
} = require('../lib/catalog.js')
const {
  parseSkill,
  validateSkill,
  validateCatalog,
} = require('../lib/frontmatter.js')
const { renderScorecard } = require('../lib/scorecard.js')
const { planInstall } = require('../lib/install.js')

const ROOT = path.resolve(__dirname, '..')
const SKILLS_DIR = path.join(ROOT, 'skills')
const CATALOG_PATH = path.join(SKILLS_DIR, 'index.json')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

function parseArgs(argv) {
  const flags = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      flags._.push(arg)
      continue
    }
    const key = arg.slice(2)
    if (key === 'local' || key === 'help' || key === 'force') {
      flags[key] = true
    } else {
      flags[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
    }
  }
  return flags
}

function packageWithRepo(flags) {
  const repo = flags.repo || process.env.OPENCODE_SKILLS_REPO
  return repo ? { ...pkg, repository: repo } : pkg
}

function readCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
}

function skillDirectories() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')))
}

function skillContents() {
  const contents = {}
  for (const name of skillDirectories()) {
    contents[name] = fs.readFileSync(
      path.join(SKILLS_DIR, name, 'SKILL.md'),
      'utf8'
    )
  }
  return contents
}

function fail(message) {
  console.error(`error: ${message}`)
  process.exitCode = 1
}

function printHelp() {
  console.log(`opencode-skills — agent skills built for OpenCode

Usage:
  npx opencode-skills install [--repo owner/repo]   Show the opencode.json snippet
  npx opencode-skills install --local               Copy skills into ~/.config/opencode/skills
  npx opencode-skills install --local --force       Overwrite locally modified skills
  npx opencode-skills list                          List available skills
  npx opencode-skills validate                      Validate the catalog and all skills
  npx opencode-skills scorecard [--out file.svg]    Generate a shareable badge

Options:
  --repo owner/repo   Override the GitHub repository used for the catalog URL
  --branch name       Catalog branch (default: main)
  --help              Show this message
`)
}

function commandInstall(flags) {
  const targetPkg = packageWithRepo(flags)

  if (flags.local) {
    const destination = path.join(os.homedir(), '.config', 'opencode', 'skills')
    fs.mkdirSync(destination, { recursive: true })
    const plan = planInstall(SKILLS_DIR, destination)

    if (plan.conflicts.length && !flags.force) {
      fail(
        `refusing to overwrite modified skills: ${plan.conflicts.join(', ')}. ` +
          'Re-run with --force to replace them.'
      )
      return
    }

    const names = flags.force
      ? [...new Set([...plan.toCopy, ...plan.conflicts])]
      : plan.toCopy

    for (const name of names) {
      fs.cpSync(path.join(SKILLS_DIR, name), path.join(destination, name), {
        recursive: true,
      })
    }
    console.log(`Installed ${names.length} skills to ${destination}`)
    console.log('Restart OpenCode, then load a skill with @skill-id.')
    return
  }

  const repo = parseRepository(targetPkg.repository)
  console.log('Add this to your opencode.json:')
  console.log()
  console.log(catalogSnippet(targetPkg, flags.branch || 'main'))
  console.log()
  console.log('Catalog base URL:', catalogBaseUrl(targetPkg, flags.branch || 'main'))
  console.log(`Repository: ${repo}`)
  console.log('Restart OpenCode. Skills auto-update when the catalog version changes.')
}

function commandList() {
  const catalog = readCatalog()
  console.log(`opencode-skills — ${catalog.skills.length} skills\n`)
  for (const entry of catalog.skills) {
    const text = fs.readFileSync(
      path.join(SKILLS_DIR, entry.name, 'SKILL.md'),
      'utf8'
    )
    const skill = parseSkill(text)
    console.log(`  @${entry.name}`)
    console.log(`    ${skill.description || '(no description)'}`)
  }
  console.log('\nInstall: npx opencode-skills install')
}

function commandValidate() {
  const contents = skillContents()
  const errors = []

  for (const [name, text] of Object.entries(contents)) {
    errors.push(...validateSkill(text, name).map((e) => `${name}: ${e}`))
  }

  errors.push(...validateCatalog(readCatalog(), contents))

  for (const entry of readCatalog().skills) {
    for (const file of entry.files || []) {
      const filePath = path.join(SKILLS_DIR, entry.name, file)
      if (!fs.existsSync(filePath)) {
        errors.push(`${entry.name}: missing file ${file}`)
      }
    }
  }

  if (errors.length) {
    for (const error of errors) fail(error)
    process.exitCode = 1
    return
  }

  console.log(`Valid: ${Object.keys(contents).length} skills, catalog OK`)
}

function commandScorecard(flags) {
  const targetPkg = packageWithRepo(flags)
  const repo = parseRepository(targetPkg.repository)
  const count = readCatalog().skills.length
  const svg = renderScorecard({ count, repo })

  if (typeof flags.out === 'string') {
    fs.writeFileSync(path.resolve(flags.out), svg, 'utf8')
    console.log(`Wrote ${path.resolve(flags.out)}`)
    return
  }
  console.log(svg)
}

function main() {
  const flags = parseArgs(process.argv.slice(2))
  const command = flags._[0] || 'help'

  if (flags.help || command === 'help') {
    printHelp()
    return
  }

  switch (command) {
    case 'install':
      commandInstall(flags)
      break
    case 'list':
      commandList()
      break
    case 'validate':
      commandValidate()
      break
    case 'scorecard':
      commandScorecard(flags)
      break
    default:
      fail(`unknown command "${command}". Run --help for usage.`)
  }
}

main()
