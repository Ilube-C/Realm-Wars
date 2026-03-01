# REALM WARS — Player Guide

## What is Realm Wars?

Realm Wars is a turn-based 4v4 team combat game. You command a team of 4 characters against an opposing team. Each character has unique abilities, stats, and stances that define how they fight. The last team standing wins.

---

## The Basics

### Stats

Every character has 6 stats, randomly generated each game based on their class:

| Stat | What it does |
|------|-------------|
| **ATK** | Scales physical damage dealt. Also determines crit chance. |
| **DEF** | Reduces physical damage taken. |
| **INT** | Scales magical damage dealt. Reduces magical damage taken. |
| **CON** | Determines max HP. HP = 20 + (CON × 4). |
| **CHA** | Increases chance of applying status effects (blind, freeze, stun, poison, etc). |
| **SPD** | Determines who acts first each turn (initiative = 2d8 + SPD). |

### Damage Types

There are 3 damage types. No weaknesses or resistances — damage type matters for which stat scales it:

- **Physical** — Scaled by ATK vs DEF
- **Magical** — Scaled by INT vs INT
- **Soul** — Flat damage, ignores stats entirely

### Damage Formula

```
(Fixed Base + Dice Roll) × (0.5 + 0.5 × (2d6 + Attacker Stat) / (2d6 + Defender Stat))
```

Every attack has a fixed base (consistent) plus dice (variance). The tooltip shows the standard deviation (σ) so you know how swingy a move is.

### Crits

```
d100 + ATK > 100 → 1.5× damage
```

A character with 15 ATK has a 15% crit chance. Crits apply to ALL damage types — even magical and soul. This gives ATK value to every character. You'll see a red screen flash and "CRIT!" when one lands.

---

## Stances

When a character enters battle (or switches in), you pick one of two stances. This choice is **locked** until they switch out. Each stance gives:

1. **Stat boosts** (e.g. ATK+3, DEF+2)
2. **A passive ability** (e.g. stun on hit, regen per turn, lifesteal)

Choosing the right stance for the matchup is one of the most important decisions in the game.

---

## Status Effects vs Buffs

**Status effects PERSIST through switches:**
- ❄️ **Frozen** — 60% SPD reduction, 66% chance to skip your turn. Thaws when you take damage. 20% damage reduction while frozen.
- 💫 **Stun** — Halves SPD, ATK, INT, and CHA for 1 turn. You still act, just weaker.
- 🔥 **Burn** — Takes 4% max HP per stack per turn. 50% chance to lose a stack each tick.
- 🧪 **Poison** — Takes 2 HP per stack per turn. Stacks never fall off naturally — only removed by abilities.
- 👁️ **Blind** — Each stack = 15% miss chance. Consumed on miss.
- 🩸 **Wound** — Each stack adds +2 damage to all attacks against you.
- 🌀 **Curse** — 35% chance per stack per turn to transform into any random status (frozen, stun, blind+1, burn+1, poison+1, wound+1).

**Buffs/Effects CLEAR on switch-out:**
- Death Lust (+4 soul damage)
- Whittle (stacking ATK boost)
- Swerve (dodge active)
- Duelist (ATK on hit)
- Switch Lock (Subdue pin)

---

## Switching

You can switch your active character by clicking a teammate in the roster. But there's a cost: **the opponent gets a free attack** on your incoming character.

If both sides switch on the same turn, neither gets a free attack — it's a fair trade.

**Switch-in effects** (Flashy Arrival blind, Guerilla entry Battlerang, Overgrowth vines) trigger when you switch in — unless the opponent has the **Overwhelming** stance, which suppresses them.

---

## The Characters

### 🛡️ Sir Shining — Paladin
**Identity:** Tanky anchor with self-healing and blind pressure.

| Ability | Type | Description |
|---------|------|-------------|
| Radial Strike | Physical | Reliable damage + 40% blind chance |
| Heavenly Blow | Hybrid | Physical + Magical split damage |
| Healing Prayer | Heal | Heals 25% max HP + cures ALL statuses. Bypasses frozen. |

**Stances:**
- *Battlefield Star* — CHA+2. 25% blind chance on all attacks.
- *Flashy Arrival* — DEF+2. Applies 2 blind stacks on switch-in.

---

### 💀 Pit Dweller — Berserker
**Identity:** Aggressive brawler with stun pressure and self-buffing.

| Ability | Type | Description |
|---------|------|-------------|
| Tump Up | Physical | Double hit (2nd hit 1.5×, 30% miss chance) |
| Counter Throw | Physical | Halved initiative, +75% bonus if damaged this turn |
| Subdue | Physical | Pins opponent — prevents switching next turn |
| Death Lust | Buff | +4 soul damage on all attacks for 2 turns |

**Stances:**
- *Dirty Boxing* — CON+2. 30% stun chance on all attacks.
- *Pit Veteran* — DEF+2. Regenerates 5% max HP per turn.

---

### ❄️ Lich King — Mage
**Identity:** Freeze-and-burst mage with lifesteal sustain.

| Ability | Type | Description |
|---------|------|-------------|
| Lich Blast | Magical | Solid damage + 20% freeze chance |
| Glaciate | Magical | Lower damage but 60% freeze chance |
| Life Drain | Magical | Heals 40% of damage dealt |
| Shatter | Soul | 18 + 2d6 soul damage. ONLY works on frozen targets. Removes freeze. |

**Stances:**
- *Arctic Aura* — CON+2, CHA+2. +10% freeze chance on all attacks.
- *Soul Snatcher* — INT+2. Heals 10% of all damage dealt.

---

### 🏹 Rex Rang — Ranger
**Identity:** Skirmisher with boomerang mechanics and two distinct playstyles.

| Ability | Type | Description |
|---------|------|-------------|
| Battlerang | Physical | Hits now + returns next turn for equal damage. 25% flinch. |
| Emberang | Physical | Boomerang + 35% burn chance |
| Whittle | Buff | +4 ATK per use (stacks, lost on switch-out) |
| Swerve | Dodge | 100% dodge first use, 20% consecutive. +50% initiative. |

**Stances:**
- *Patient Killer* — ATK+2. Boomerang returns deal 130% damage.
- *Guerilla Fighter* — SPD+2. Throws 30% Battlerang on switch-in. Swerve-dodge forces switch-out.

---

### 🗡️ Count Coction — Rogue
**Identity:** Poison economy specialist. Stacks poison, then cashes out.

| Ability | Type | Description |
|---------|------|-------------|
| Poison Dart | Physical | Damage + guaranteed 2 poison stacks |
| Goblin Gas | Terrain | Both sides gain 1 poison per turn for 5 turns |
| Remedial Ointment | Heal | Removes all self-poison, heals 9 HP per stack |
| Violent Extraction | Soul | Removes all enemy poison, deals 15 soul damage per stack |

**Stances:**
- *Rapid Transmission* — CHA+2. 30% chance to add +1 poison on any poison application.
- *Night Terrors* — SPD+2. Act faster.

---

### ⚔️ Lexilas — Warrior
**Identity:** Raw physical duelist with the biggest single hit in the game.

| Ability | Type | Description |
|---------|------|-------------|
| Reckless Swing | Physical | 14+2d6 massive damage (10% recoil to self) |
| Eviscerate | Physical | Applies Wounded stacks (+2 dmg taken per stack) |
| Shield Bash | Physical | +4 DEF during attack, 35% stun chance |
| Chivalry | Heal | Goes LAST. Heals 30% max HP if you didn't take damage this turn. |

**Stances:**
- *Overwhelming* — ATK+3. Suppresses enemy stance passive AND switch-in effects.
- *Duelist* — DEF+2. Gain +5 ATK on hit (consumed on next attack).

---

### 🌿 Viny the Younger — Druid
**Identity:** Glass cannon disruptor with delayed damage and status transfer.

| Ability | Type | Description |
|---------|------|-------------|
| Petal Storm | Magical | Damage + 50% blind chance |
| Ancient Power | Magical | 15+2d6 delayed nuke — lands 2 turns later |
| Transference | Soul | Dumps ALL your statuses onto the enemy |
| Battle Boar | Summon | Summons a boar with fixed stats (Druid goes to bench) |

**Stances:**
- *Overgrowth* — INT+2. Sets Vine terrain on switch-in (4 dmg/turn to faster unit, 5 turns).
- *Restoration* — CON+2. Heals 20% max HP when switching out.

---

### ✝️ Jah Apostle — Cleric
**Identity:** Pure support that controls the battlefield through curse and shields.

| Ability | Type | Description |
|---------|------|-------------|
| Moonlight | Heal | Heals self 25% max HP + stores heal for next ally to switch in |
| Read Scripture | Soul | 10+1d8 damage + variable curse (50% 0, 25% 1, 15% 2, 10% 3 stacks) |
| Riot | Soul | 5+1d4 damage + 2 curse stacks + 1 burn stack |
| Look at Me | Utility | If opponent tries to switch this turn, it fails + your team gets shields |

**Stances:**
- *Gekyume's Blessing* — INT+2. Heals and shields boosted by 30%. Shield duration +1 turn. Shield HP 15→20.
- *Forbidden Sermon* — CHA+2. Applies 2 curse stacks to the opponent every turn passively.

---

## Shield Mechanic

Shields are an HP pool that absorbs damage. A 15 HP shield blocks all damage up to 15 — any excess goes through to your real HP. Shields persist through switches and last a set number of turns.

---

## Terrain

Only one terrain can be active at a time. A new terrain cancels the previous one.

- **Goblin Gas** — Both sides gain 1 poison stack per turn (5 turns)
- **Overgrowth Vines** — The faster unit takes 4 fixed damage per turn (5 turns)

---

## Tips

1. **Stances are permanent until switch-out.** Pick based on the matchup, not in a vacuum.
2. **Switching costs a free hit** but resets your buffs and lets you pick a new stance. Sometimes the matchup advantage is worth the damage.
3. **Poison never falls off.** Against Rogue, either kill them fast or bring Healing Prayer / Remedial Ointment.
4. **Frozen thaws on damage.** Don't waste attacks on a frozen target unless you're using Shatter.
5. **Curse is unpredictable but powerful.** Each stack has a 35% chance per turn to become any status. Stack enough curse and the enemy drowns in random debuffs.
6. **Chivalry goes last deliberately.** If you predict the enemy won't attack your Warrior (maybe they switch or use a buff), it's a free 30% heal.
7. **Transference is a hard counter to Forbidden Sermon.** The Cleric curses you? Dump it right back.
8. **Overwhelming suppresses passives AND switch-in effects.** Warrior shuts down stance-dependent characters.

---

*Realm Wars — built by Chris, اَلمهندس & Ian*
