export type RngSeed = number | string

export type RngSnapshot = {
  seed: RngSeed
  state: number
}

export type SeededRng = {
  next(): number
  nextInt(maxExclusive: number): number
  snapshot(): RngSnapshot
}

export function createSeededRng(seed: RngSeed): SeededRng {
  let state = hashSeed(seed)

  return {
    next() {
      state = nextState(state)
      return state / 0x100000000
    },
    nextInt(maxExclusive) {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error('maxExclusive must be a positive integer')
      }

      return Math.floor(this.next() * maxExclusive)
    },
    snapshot() {
      return {
        seed,
        state,
      }
    },
  }
}

export function createSeededRngFromSnapshot(snapshot: RngSnapshot): SeededRng {
  let state = snapshot.state
  const { seed } = snapshot

  return {
    next() {
      state = nextState(state)
      return state / 0x100000000
    },
    nextInt(maxExclusive) {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error('maxExclusive must be a positive integer')
      }

      return Math.floor(this.next() * maxExclusive)
    },
    snapshot() {
      return {
        seed,
        state,
      }
    },
  }
}

function hashSeed(seed: RngSeed): number {
  const text = String(seed)
  let hash = 2166136261

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function nextState(state: number): number {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0
}
