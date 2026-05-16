import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Plant care data ──────────────────────────────────────────────────────────
// All schedules are tuned for:
//   • Melbourne apartment, NW-facing window (bright indirect, no harsh direct sun)
//   • Approaching winter (May–Aug): reduced light, cooler temps, slower drying
//   • Southern Hemisphere seasons

export type Season = 'summer' | 'autumn' | 'winter' | 'spring';

export function getSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'autumn';
  if (month >= 6 && month <= 8) return 'winter';
  if (month >= 9 && month <= 11) return 'spring';
  return 'summer';
}

export interface CareTask {
  type: 'water' | 'repot' | 'fertilise' | 'mist' | 'wipe_leaves' | 'check';
  label: string;
  intervalDays: number; // how often in current season
  notes: string;
}

export interface PlantTemplate {
  id: string;
  name: string;
  emoji: string;
  lightNeeds: string;
  nwWindowSuitability: 'ideal' | 'good' | 'tolerable' | 'needs-supplement';
  toxicToPets: boolean;
  winterCare: string;
  tasks: {
    summer: CareTask[];
    autumn: CareTask[];
    winter: CareTask[];
    spring: CareTask[];
  };
}

export const PLANT_LIBRARY: PlantTemplate[] = [
  {
    id: 'peace-lily',
    name: 'Sensation Peace Lily',
    emoji: '🌸',
    lightNeeds: 'Low to bright indirect',
    nwWindowSuitability: 'ideal',
    toxicToPets: true,
    winterCare: 'Reduce watering significantly. Will droop dramatically when thirsty — this is fine, water only then. No fertiliser. Keep away from cold drafts near the sliding door.',
    tasks: {
      summer: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Water when top inch of soil is dry. Will droop when thirsty.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Half-strength liquid fertiliser.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 3,  notes: 'Loves humidity — mist leaves or set on a pebble tray.' },
      ],
      autumn: [
        { type: 'water',     label: 'Water',      intervalDays: 10, notes: 'Soil dries slower as temps drop. Wait until slightly wilted.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 56, notes: 'Taper off fertilising for winter.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 4,  notes: 'Keep humidity up as heating dries indoor air.' },
      ],
      winter: [
        { type: 'water',     label: 'Water',      intervalDays: 14, notes: 'Only water when leaves droop slightly. Overwatering in winter = root rot.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 5,  notes: 'Mist occasionally — apartment heating dries the air.' },
        { type: 'check',     label: 'Health check', intervalDays: 14, notes: 'Check for brown tips (low humidity or fluoride in tap water). Check for cold drafts from balcony door.' },
      ],
      spring: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Resume regular watering as growth picks up.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Resume half-strength fertiliser.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 3,  notes: 'Increase misting frequency.' },
        { type: 'repot',     label: 'Repot check', intervalDays: 365, notes: 'Repot every 1–2 years in spring when rootbound. Go up one pot size only.' },
      ],
    },
  },
  {
    id: 'rubber-plant',
    name: 'Burgundy Rubber Plant',
    emoji: '🍂',
    lightNeeds: 'Medium to bright indirect',
    nwWindowSuitability: 'good',
    toxicToPets: true,
    winterCare: 'Let soil dry out almost completely before watering. Do not fertilise. Do not repot until spring. Wipe dusty leaves to help it photosynthesise in lower light. Keep away from cold drafts — sudden cold can cause leaf drop.',
    tasks: {
      summer: [
        { type: 'water',      label: 'Water',       intervalDays: 7,  notes: 'Water when top 50–75% of soil is dry. Ensure it drains fully.' },
        { type: 'fertilise',  label: 'Fertilise',   intervalDays: 28, notes: 'Balanced liquid feed monthly during growing season.' },
        { type: 'wipe_leaves', label: 'Wipe leaves', intervalDays: 30, notes: 'Wipe glossy leaves with damp cloth to remove dust.' },
      ],
      autumn: [
        { type: 'water',      label: 'Water',       intervalDays: 14, notes: 'Reduce frequency as growth slows.' },
        { type: 'wipe_leaves', label: 'Wipe leaves', intervalDays: 30, notes: 'Clean leaves help maximise limited winter light.' },
      ],
      winter: [
        { type: 'water',      label: 'Water',       intervalDays: 18, notes: 'Let soil dry almost completely — stick finger 5cm in, must be dry. Every 2–3 weeks typically.' },
        { type: 'wipe_leaves', label: 'Wipe leaves', intervalDays: 21, notes: 'Critical in winter: dusty leaves can\'t absorb the limited light available.' },
        { type: 'check',      label: 'Health check', intervalDays: 14, notes: 'Watch for yellowing/dropping leaves = overwatering or cold drafts.' },
      ],
      spring: [
        { type: 'water',      label: 'Water',       intervalDays: 7,  notes: 'Resume regular watering as new leaves appear.' },
        { type: 'fertilise',  label: 'Fertilise',   intervalDays: 28, notes: 'Resume feeding when new growth emerges.' },
        { type: 'repot',      label: 'Repot check', intervalDays: 365, notes: 'Repot in spring when root-bound (roots from drainage holes). Go 2" larger.' },
        { type: 'wipe_leaves', label: 'Wipe leaves', intervalDays: 30, notes: 'Keep leaves clean as growth surges.' },
      ],
    },
  },
  {
    id: 'dieffenbachia',
    name: 'Dieffenbachia',
    emoji: '🌿',
    lightNeeds: 'Bright to medium indirect',
    nwWindowSuitability: 'good',
    toxicToPets: true,
    winterCare: 'Water only when top inch is dry — more slowly in winter. No fertiliser. Appreciates some humidity. Toxic sap — always wash hands after handling.',
    tasks: {
      summer: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Water when top inch of soil is dry. Chunky, well-draining soil is ideal.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Balanced liquid fertiliser every 4–6 weeks.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 4,  notes: 'Loves humidity. Mist regularly or use pebble tray.' },
      ],
      autumn: [
        { type: 'water',     label: 'Water',      intervalDays: 10, notes: 'Reduce frequency gradually.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 5,  notes: 'Keep humidity up as indoor air dries.' },
      ],
      winter: [
        { type: 'water',     label: 'Water',      intervalDays: 14, notes: 'Water less — top inch must be dry. Avoid cold water.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 5,  notes: 'Mist to maintain humidity, but don\'t let water sit in leaf axils.' },
        { type: 'check',     label: 'Health check', intervalDays: 14, notes: 'Normal to drop lower leaves as it matures. Watch for yellowing = overwatering.' },
      ],
      spring: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Resume regular schedule.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Resume feeding.' },
        { type: 'repot',     label: 'Repot check', intervalDays: 365, notes: 'Repot every 1–2 years in spring. Fast grower — check annually.' },
      ],
    },
  },
  {
    id: 'rattlesnake-plant',
    name: 'Rattlesnake Plant',
    emoji: '🐍',
    lightNeeds: 'Low to medium indirect — never direct sun',
    nwWindowSuitability: 'ideal',
    toxicToPets: false,
    winterCare: 'Keep evenly moist but reduce frequency slightly. Very sensitive to cold — never below 15°C. Keep away from the balcony door draft. Use distilled or filtered water if possible; sensitive to fluoride and salts in Melbourne tap water.',
    tasks: {
      summer: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Keep evenly moist. Sensitive to fluoride — use filtered or rainwater if possible.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 30, notes: 'Monthly during growing season.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 3,  notes: 'Loves high humidity. Mist or use pebble tray.' },
      ],
      autumn: [
        { type: 'water',     label: 'Water',      intervalDays: 10, notes: 'Reduce slightly but keep moist — don\'t let it dry out fully.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 4,  notes: 'Maintain humidity.' },
      ],
      winter: [
        { type: 'water',     label: 'Water',      intervalDays: 12, notes: 'Still needs consistent moisture — unlike most plants, don\'t let it fully dry. Check every 10–12 days.' },
        { type: 'mist',      label: 'Mist',       intervalDays: 5,  notes: 'Mist gently. Avoid wetting leaves excessively in cold months.' },
        { type: 'check',     label: 'Health check', intervalDays: 14, notes: 'Watch for crispy leaf edges (low humidity, fluoride) or yellowing (overwater, cold). Temp must stay above 15°C.' },
      ],
      spring: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Back to regular schedule.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 30, notes: 'Resume monthly feeding.' },
        { type: 'repot',     label: 'Repot check', intervalDays: 365, notes: 'Repot in early spring only if root-bound. Dislikes root disturbance — only repot when necessary.' },
      ],
    },
  },
  {
    id: 'peperomia',
    name: 'Red-edge Peperomia',
    emoji: '🔴',
    lightNeeds: 'Medium to bright indirect',
    nwWindowSuitability: 'good',
    toxicToPets: false,
    winterCare: 'Water every 14 days — let it dry deep between waterings. Very prone to root rot if overwatered in winter. Do not fertilise. Compact root system means it rarely needs repotting.',
    tasks: {
      summer: [
        { type: 'water',     label: 'Water',      intervalDays: 9,  notes: 'Let soil dry 5cm deep between waterings. Thick leaves store water.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Monthly during growing season with balanced fertiliser.' },
      ],
      autumn: [
        { type: 'water',     label: 'Water',      intervalDays: 12, notes: 'Reduce frequency as days shorten.' },
      ],
      winter: [
        { type: 'water',     label: 'Water',      intervalDays: 14, notes: 'Every 14 days max — let soil dry well beyond the top layer. Less is more.' },
        { type: 'check',     label: 'Health check', intervalDays: 21, notes: 'Wilting despite moist soil = root rot (too wet). Move to brighter spot if growth gets leggy.' },
      ],
      spring: [
        { type: 'water',     label: 'Water',      intervalDays: 9,  notes: 'Resume normal schedule.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Resume monthly feed.' },
        { type: 'repot',     label: 'Repot check', intervalDays: 548, notes: 'Only needs repotting every 4–6 years. Prefers being slightly pot-bound. Only repot if roots circle or escape drainage holes.' },
      ],
    },
  },
  {
    id: 'orchid',
    name: 'Orchid (Phalaenopsis)',
    emoji: '🌺',
    lightNeeds: 'Bright indirect — east or NW window ideal',
    nwWindowSuitability: 'ideal',
    toxicToPets: false,
    winterCare: 'Water every 10–14 days — only when roots turn silvery-white (visible through clear pot). Morning watering only. Do not fertilise. A slight cool drop at night (NW window) will actually help trigger the next bloom spike — use this to your advantage!',
    tasks: {
      summer: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Water when roots turn silvery-white. Soak-and-drain method: place in sink, water thoroughly, let drain fully before returning.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 14, notes: 'Orchid-specific fertiliser at quarter strength every other watering during growing/blooming period.' },
      ],
      autumn: [
        { type: 'water',     label: 'Water',      intervalDays: 10, notes: 'Watch roots — water when silvery. Reduce frequency.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 28, notes: 'Taper off fertilising.' },
        { type: 'check',     label: 'Bloom check', intervalDays: 14, notes: 'Night temperature drop in autumn triggers bloom spike. Leave near the NW window — the cool nights will help.' },
      ],
      winter: [
        { type: 'water',     label: 'Water',      intervalDays: 12, notes: 'Every 10–14 days. Root colour is your guide: green = moist, silver = water now. Always water in the morning.' },
        { type: 'check',     label: 'Health check', intervalDays: 14, notes: 'Look for a new bloom spike emerging from leaf axils — this is a good sign. Don\'t move the plant once a spike appears.' },
      ],
      spring: [
        { type: 'water',     label: 'Water',      intervalDays: 7,  notes: 'Resume regular watering as blooms fade and growth resumes.' },
        { type: 'fertilise', label: 'Fertilise',  intervalDays: 14, notes: 'Resume quarter-strength orchid fertiliser.' },
        { type: 'repot',     label: 'Repot',      intervalDays: 730, notes: 'Repot every 1–2 years AFTER blooms fade. Use fresh orchid bark mix. Never repot while in bloom.' },
      ],
    },
  },
];

export function getTasksForSeason(plant: PlantTemplate, season: Season): CareTask[] {
  return plant.tasks[season];
}

export function getDaysUntilDue(lastDone: string | null, intervalDays: number): number {
  if (!lastDone) return 0; // overdue — never done
  const last = new Date(lastDone);
  const next = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((next.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export function getStatusColor(daysUntil: number): 'overdue' | 'due-soon' | 'ok' {
  if (daysUntil <= 0) return 'overdue';
  if (daysUntil <= 2) return 'due-soon';
  return 'ok';
}
