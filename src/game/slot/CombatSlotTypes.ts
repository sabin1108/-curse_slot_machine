export type CombatActionSymbol = 'bullet' | 'shield' | 'heart'

export type CombatTargetSymbol = 'enemy' | 'self' | 'all'

export type CombatModifierSymbol = 'x1' | 'x2' | 'x3'

export type CombatSlotResult = {
  action: CombatActionSymbol
  target: CombatTargetSymbol
  modifier: CombatModifierSymbol
}

export type CombatSlotLocks = {
  action?: boolean
  target?: boolean
  modifier?: boolean
}
