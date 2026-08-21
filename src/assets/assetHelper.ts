import { ASSETS } from './mockupAssets';

const PUBLIC_ASSETS: Record<string, string> = {
  item_combo_starter: '/assets/icons_rpg/sword_01a.png',
  item_combo_finisher: '/assets/icons_rpg/sword_03d.png',
  item_multi_hit_charm: '/assets/icons_rpg/ring_01c.png',
  item_split_blade: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/weapon_duel_sword.png',
  item_echo_trigger: '/assets/icons_rpg/ring_03e.png',
  item_ember_edge: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/weapon_red_gem_sword.png',
  item_ash_powder: '/assets/icons_rpg/potion_03c.png',
  item_furnace_heart: '/assets/icons_rpg/gem_01f.png',
  item_wildfire_contract: '/assets/icons_rpg/scroll_01e.png',
  item_guard_core: '/assets/icons_rpg/shield_01a.png',
  item_mirror_buckler: '/assets/icons_rpg/shield_02d.png',
  item_stone_aegis: '/assets/icons_rpg/shield_03c.png',
  item_fortress_oath: '/assets/icons_rpg/armor_01e.png',
  item_cursed_lens: '/assets/icons_rpg/gem_01j.png',
  item_blood_price: '/assets/icons_rpg/skull_01b.png',
  item_hex_battery: '/assets/icons_rpg/staff_02c.png',
  item_jackpot_debt: '/assets/icons_rpg/coin_05e.png',
  item_red_coin: '/assets/icons_rpg/coin_01e.png',
  item_blue_vial: '/assets/icons_rpg/potion_01c.png',
  item_green_vial: '/assets/icons_rpg/potion_02d.png',
  item_lucky_receipt: '/assets/icons_rpg/scroll_01a.png',
  item_crit_die: '/assets/icons_rpg/gem_01h.png',
  item_limit_core: '/assets/icons_rpg/gem_01j.png',
  item_limit_breaker: '/assets/icons_rpg/gem_01i.png',
  item_glass_cannon: '/assets/icons_rpg/sword_02e.png',
  item_royal_joker: '/assets/icons_rpg/gem_01i.png',
  item_safe_cracker: '/assets/icons_rpg/key_02d.png',
  item_thorn_shell: '/assets/icons_rpg/shield_03e.png',
  item_black_candle: '/assets/icons_rpg/candle_01b.png',
  item_panic_button: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/button_red_up.png',
  item_house_mark: '/assets/icons_rpg/spellbook_03e.png',
  rest_heal: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/flask_big_red.png',
  rest_purify: '/assets/icons_rpg/spellbook_02c.png',
  rest_campfire: '/assets/icons_rpg/candle_01a.png',
  rest_shrine: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/flask_big_yellow.png',
  rest_shelter: '/assets/icons_rpg/book_06g.png',
  enemy_skelet: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/skelet_idle_anim_f0.png',
  enemy_goblin: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/goblin_idle_anim_f0.png',
  enemy_necromancer: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/necromancer_anim_f0.png',
  enemy_ogre: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/ogre_idle_anim_f0.png',
  enemy_knight: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/knight_m_idle_anim_f0.png',
  enemy_golem: '/assets/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7/frames/big_demon_idle_anim_f0.png',
  boss_common: '/boss/boss_common.gif',
  boss_appeared: '/boss/boss.gif',
  boss_act: '/boss/boss_act.gif',
  fx_attack_slash: '/assets/Free Pixel Effects Pack/10_weaponhit_spritesheet.png',
  fx_attack_fire: '/assets/Free Pixel Effects Pack/11_fire_spritesheet.png',
  fx_attack_bomb: '/assets/Free Pixel Effects Pack/13_vortex_spritesheet.png',
  fx_defense: '/assets/Free Pixel Effects Pack/8_protectioncircle_spritesheet.png',
  fx_heal: '/assets/Free Pixel Effects Pack/20_magicbubbles_spritesheet.png',
  fx_rest_smoke: '/assets/Free Pixel Effects Pack/14_phantom_spritesheet.png',
};

export function getAsset(key: string): string {
  if (PUBLIC_ASSETS[key]) {
    return PUBLIC_ASSETS[key];
  }

  if (ASSETS[key]) {
    return ASSETS[key];
  }
  // Fallback to public assets directory
  return `/assets/${key}`;
}
