import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { execFileSync, spawnSync } from 'node:child_process'
import { build } from 'esbuild'

function readArguments(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) throw new Error('arguments must be --key value pairs')
    values.set(key.slice(2), value)
  }
  const seed = values.get('seed')
  const commandPath = values.get('commands')
  if (!seed) throw new Error('--seed is required')
  if (!commandPath) throw new Error('--commands is required')
  return { seed, commandPath }
}

async function loadCommands({ commandPath }) {
  const source = await readFile(commandPath, 'utf8')
  const commands = JSON.parse(source)
  if (!Array.isArray(commands)) throw new Error('commands must be a JSON array')
  return commands
}

async function loadEngine() {
  const result = await build({
    entryPoints: ['src/game/engine/GameEngine.ts'],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  })
  const encoded = Buffer.from(result.outputFiles[0].text).toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

function execute(GameEngine, seed, commands) {
  const engine = new GameEngine(seed)
  return commands.map((command, index) => ({
    index,
    command,
    events: engine.dispatch(command),
    state: engine.getState(),
  }))
}

function currentCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

function assertCleanSource() {
  const sourcePaths = [
    'src',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
  ]
  const unstaged = spawnSync('git', ['diff', '--quiet', '--', ...sourcePaths])
  const staged = spawnSync('git', ['diff', '--cached', '--quiet', '--', ...sourcePaths])
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '--', ...sourcePaths],
    { encoding: 'utf8' },
  ).trim()
  if (unstaged.status !== 0 || staged.status !== 0 || untracked) {
    throw new Error('engine source differs from HEAD; record traces from a clean fixed commit')
  }
}

const options = readArguments(process.argv.slice(2))
assertCleanSource()
const commands = await loadCommands(options)
const recorderSource = await readFile(new URL(import.meta.url))
const { GameEngine } = await loadEngine()
const first = execute(GameEngine, options.seed, commands)
const second = execute(GameEngine, options.seed, commands)
const normalized = JSON.stringify(first)
const deterministic = normalized === JSON.stringify(second)
const output = {
  schemaVersion: 1,
  commit: currentCommit(),
  sourceClean: true,
  recorderDigest: createHash('sha256').update(recorderSource).digest('hex'),
  seed: options.seed,
  commands,
  steps: first,
  finalDigest: createHash('sha256').update(normalized).digest('hex'),
  deterministic,
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
if (!deterministic) process.exitCode = 2
