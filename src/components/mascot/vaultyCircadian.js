/**
 * vaultyCircadian.js — Circadian & Time-of-Day Context Engine for Vaulty
 *
 * Implements Section 22.7.1 & Item 3:
 * Adapts Vaulty's idle posture, greetings, eye luminescence, and breathing
 * rhythm to the Philippine local time of day.
 */

export const CIRCADIAN_SLOTS = {
  morning: {
    id: "morning",
    label: "Morning",
    timeRange: "6:00 AM – 11:59 AM",
    greeting: "Magandang umaga, Liam! Balances are intact and ready for today's savings.",
    aura: "idle",
    fps: 4.5,
    sleepyEyes: false,
    eyeGlowAlpha: 0.95,
    antennaGlint: true,
    tag: "Energetic Wakeup",
  },
  afternoon: {
    id: "afternoon",
    label: "Afternoon",
    timeRange: "12:00 PM – 5:59 PM",
    greeting: "Magandang hapon! Keeping a watchful eye on lunch and mid-day expenses.",
    aura: "idle",
    fps: 4.0,
    sleepyEyes: false,
    eyeGlowAlpha: 0.88,
    antennaGlint: false,
    tag: "Mid-day Tracking",
  },
  evening: {
    id: "evening",
    label: "Evening",
    timeRange: "6:00 PM – 9:59 PM",
    greeting: "Magandang gabi, Liam! Reviewing today's ledgers and daily budget totals.",
    aura: "thinking",
    fps: 3.5,
    sleepyEyes: false,
    eyeGlowAlpha: 0.8,
    antennaGlint: false,
    tag: "Evening Ledger",
  },
  night: {
    id: "night",
    label: "Late Night",
    timeRange: "10:00 PM – 5:59 AM",
    greeting: "Late-night budgeting? Don't strain your eyes, Liam! Rest well soon.",
    aura: "thinking",
    fps: 2.8,
    sleepyEyes: true,
    eyeGlowAlpha: 0.45,
    antennaGlint: false,
    tag: "Night Rest Mode",
  },
}

/**
 * Calculates current circadian time slot based on given Date or current local time
 * @param {Date} [date=new Date()]
 * @returns {"morning" | "afternoon" | "evening" | "night"}
 */
export function getCircadianSlot(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 18) return "afternoon"
  if (hour >= 18 && hour < 22) return "evening"
  return "night"
}

/**
 * Returns full profile object for given slot
 * @param {string} slotKey
 */
export function getCircadianProfile(slotKey) {
  return CIRCADIAN_SLOTS[slotKey] || CIRCADIAN_SLOTS.afternoon
}
