// Raccourcis de plages de dates pour les filtres d'événements

export type DatePreset = 'today' | 'week' | 'weekend';

export interface DateRange {
  from: string;
  to: string;
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getTodayDates(): DateRange {
  const today = new Date();
  return { from: fmtDate(today), to: fmtDate(today) };
}

export function getThisWeekDates(): DateRange {
  const today = new Date();
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (day === 0 ? 0 : 7 - day));
  return { from: fmtDate(today), to: fmtDate(sunday) };
}

export function getWeekendDates(): DateRange {
  const today = new Date();
  const day = today.getDay();
  if (day === 6) {
    const sun = new Date(today);
    sun.setDate(today.getDate() + 1);
    return { from: fmtDate(today), to: fmtDate(sun) };
  }
  if (day === 0) return { from: fmtDate(today), to: fmtDate(today) };
  const sat = new Date(today);
  sat.setDate(today.getDate() + (6 - day));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return { from: fmtDate(sat), to: fmtDate(sun) };
}

export const DATE_PRESETS: Record<DatePreset, { label: string; getRange: () => DateRange }> = {
  today: { label: "Aujourd'hui", getRange: getTodayDates },
  week: { label: 'Cette semaine', getRange: getThisWeekDates },
  weekend: { label: 'Ce week-end', getRange: getWeekendDates },
};
