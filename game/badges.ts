import type { StringKey } from "../data/i18n";
import { world } from "../world/layout";

export type BadgeId = "eibermon" | "experience" | "completionist";

/** Orden fijo: si se ganan varias a la vez, se muestran (y se encolan) en este orden. */
export const BADGE_IDS: BadgeId[] = ["eibermon", "experience", "completionist"];

export const BADGE_ICON: Record<BadgeId, string> = {
  eibermon: "⚡",
  experience: "🏢",
  completionist: "🏆",
};

export const BADGE_LABEL_KEY: Record<BadgeId, StringKey> = {
  eibermon: "badgeEibermon",
  experience: "badgeExperience",
  completionist: "badgeCompletionist",
};

export const BADGE_DESC_KEY: Record<BadgeId, StringKey> = {
  eibermon: "badgeEibermonDesc",
  experience: "badgeExperienceDesc",
  completionist: "badgeCompletionistDesc",
};

const SKILL_IDS = world.skills.map((s) => s.interactId);
const EXPERIENCE_IDS = [...world.jobs.map((j) => j.interactId), world.archive.interactId, world.contact.interactId];
const TOTAL = world.interactables.length;

const REQUIREMENTS: Record<BadgeId, (discovered: string[]) => boolean> = {
  eibermon: (discovered) => SKILL_IDS.every((id) => discovered.includes(id)),
  experience: (discovered) => EXPERIENCE_IDS.every((id) => discovered.includes(id)),
  completionist: (discovered) => discovered.length >= TOTAL,
};

export function isBadgeEarned(id: BadgeId, discovered: string[]): boolean {
  return REQUIREMENTS[id](discovered);
}

/** Medallas que ya se cumplen en `discovered` pero todavía no estaban en `seenBadges`. */
export function newlyEarnedBadges(discovered: string[], seenBadges: BadgeId[]): BadgeId[] {
  return BADGE_IDS.filter((id) => !seenBadges.includes(id) && isBadgeEarned(id, discovered));
}
