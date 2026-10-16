/* Thư viện kỹ năng: THƯỞNG CHỈ SỐ theo bậc (dùng chung Skeleton Codex và Vạn Kiếp).
 * skillRewards[id] = { "<bậc 2–5>": { "<chỉ số>": cộng thêm } }, cộng dồn qua các bậc; bậc 5 luôn có thưởng
 * (luật platform/docs/06 mục 1). Chỉ số: STR, DEX, VIT, INT, WIL, AGI.
 * Tách từ platform/skill-system.js ngày 16/10/2026 (vankiep/docs/08 mục 10). Kỹ năng không có ở đây thì mỗi game tự suy
 * (Skeleton Codex: defaultReward theo độ hiếm; Vạn Kiếp: +1 chỉ số theo mastery của kỹ năng).
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.skillRewards = {
  "bone_dash":{"5":{"AGI":1}},"bone_leap":{"5":{"AGI":1}},"loose_bone":{"5":{"DEX":1}},
  "brace":{"5":{"VIT":1}},"quick_recover":{"5":{"AGI":1}},"balanced_frame":{"5":{"VIT":1}},
  "scavenger_eye":{"5":{"DEX":1}},"light_bones":{"5":{"AGI":1}},
  "cracked_slash":{"5":{"STR":1}},"rising_chip":{"5":{"STR":1,"DEX":1}},
  "stone_throw":{"5":{"DEX":1}},"aimed_stone":{"3":{"DEX":1},"5":{"DEX":1}},
  "needle_stab":{"5":{"DEX":1}},"cracked_axe":{"5":{"STR":1,"VIT":1}},
  "spear_jab":{"5":{"DEX":1}},"shield_nudge":{"5":{"VIT":1}},"focus_pulse":{"5":{"INT":1}},
  "junk_snare":{"5":{"INT":1}},"bone_dive":{"5":{"AGI":1}},"quiet_tread":{"5":{"AGI":1}},
  "ragged_persistence":{"5":{"VIT":1}},"wanderer_improvise":{"5":{"STR":1}},
  "first_footfall":{"5":{"AGI":1}},"frost_fleck":{"3":{"INT":1},"5":{"INT":1}},
  "static_snap":{"5":{"INT":1}},"wind_puff":{"5":{"AGI":1}},"pebble_knock":{"5":{"INT":1}},
  "pale_glimmer":{"5":{"WIL":1}},"shade_mote":{"5":{"WIL":1}},"sprout_grasp":{"5":{"WIL":1}},
  "water_veil":{"5":{"WIL":1}},"field_mend":{"5":{"VIT":1}},
  "flicker_ember":{"5":{"INT":1}},"water_drop":{"5":{"INT":1}},
  "aimed_shot":{"5":{"DEX":1}},"split_arrow":{"5":{"DEX":1}},"volley":{"5":{"DEX":1,"STR":1}},"hunter_mark":{"5":{"DEX":1}},
  "ghostline_shot":{"3":{"DEX":1},"5":{"DEX":1,"WIL":1}},"eternal_mark":{"3":{"DEX":1},"4":{"WIL":1},"5":{"DEX":2}},
  "knife_feint":{"5":{"DEX":1}},"shadow_slip":{"5":{"AGI":1}},"leaping_strike":{"5":{"STR":1,"AGI":1}},
  "death_whisper":{"3":{"AGI":1},"4":{"DEX":1},"5":{"DEX":1,"AGI":1}},"shade_echo":{"5":{"DEX":1}},"battle_instinct":{"5":{"DEX":1,"AGI":1}},
  "grave_chant":{"5":{"WIL":1}},"soul_spark":{"5":{"INT":1}},"soul_bind":{"5":{"WIL":1}},"soul_vessel":{"5":{"WIL":1}},
  "soulburst":{"5":{"INT":1,"WIL":1}},"soul_lattice":{"5":{"WIL":2}},"legion_call":{"5":{"INT":1,"WIL":1}},
  "grave_dominion":{"3":{"INT":1},"4":{"WIL":1},"5":{"INT":1,"WIL":1}},"death_symphony":{"3":{"INT":1},"4":{"WIL":1},"5":{"INT":1,"WIL":1}},
  "endless_will":{"5":{"WIL":1}},"sovereign_step":{"5":{"AGI":1}},"abyss_judgment":{"3":{"WIL":1},"4":{"STR":1},"5":{"STR":2}},
  "snare_arrow":{"5":{"DEX":1}},"cutpurse_toss":{"5":{"AGI":1}},"spirit_ward":{"5":{"WIL":1}},"axe_hook":{"5":{"STR":1}},
  "steady_draw":{"5":{"DEX":1}},"corpse_lantern":{"5":{"WIL":1}},"soul_thread":{"5":{"WIL":1}},"soul_tithe":{"5":{"DEX":1,"WIL":1}},"veil_sense":{"5":{"DEX":1}},
  "phalanx_thrust":{"5":{"STR":1,"VIT":1}},"iron_charge":{"5":{"STR":1,"VIT":1}},"piercing_bolt":{"5":{"DEX":1,"STR":1}},"hunters_net":{"5":{"DEX":1,"WIL":1}},
  "soul_rend":{"5":{"DEX":1,"WIL":1}},"smoke_veil":{"5":{"AGI":1,"DEX":1}},"bone_spike_field":{"5":{"INT":2}},"soul_siphon":{"5":{"WIL":2}},
  "arc_welder":{"5":{"INT":1,"DEX":1}},"fortify_module":{"5":{"VIT":1,"INT":1}},"marksman_breath":{"5":{"DEX":1,"AGI":1}},"grave_attunement":{"5":{"WIL":2}},
  "warlord_stride":{"3":{"STR":1},"5":{"STR":1,"VIT":1}},"skyfall_arrow":{"3":{"DEX":1},"5":{"DEX":1,"WIL":1}},"shadow_execution":{"3":{"DEX":1},"5":{"DEX":1,"AGI":1}},
  "necrotic_wave":{"3":{"INT":1},"5":{"INT":1,"WIL":1}},"siege_turret":{"3":{"INT":1},"5":{"INT":1,"DEX":1}},"unyielding_bones":{"5":{"VIT":2}},"arcane_reservoir":{"5":{"WIL":2}},
  "raise_skeleton":{"5":{"INT":1}},"bone_archer":{"5":{"INT":1}},"bone_knight":{"5":{"INT":1,"VIT":1}},"soul_wraith":{"3":{"WIL":1},"5":{"INT":1}},
  "heavy_bolt":{"5":{"DEX":1}},"blast_charge":{"5":{"DEX":1}},"breach_cannon":{"5":{"DEX":1,"STR":1}},"shadow_climb":{"5":{"AGI":1}},
  "long_draw":{"5":{"DEX":1}},"tomb_pilfer":{"5":{"AGI":1}},"shield_wall":{"5":{"VIT":2}},"hunt_call":{"5":{"DEX":1,"WIL":1}},"harvest_step":{"5":{"AGI":1,"WIL":1}},"overclock":{"5":{"INT":2}},
  "bone_tempest":{"3":{"STR":1},"5":{"STR":1,"VIT":1}},"hundred_barbs":{"3":{"DEX":1},"5":{"DEX":1,"STR":1}},"veil_massacre":{"3":{"AGI":1},"5":{"DEX":1,"AGI":1}},
  "sovereign_bulwark":{"3":{"VIT":1},"5":{"VIT":1,"WIL":1}},"oblivion_pulse":{"3":{"INT":1},"5":{"INT":1,"WIL":1}}
};
