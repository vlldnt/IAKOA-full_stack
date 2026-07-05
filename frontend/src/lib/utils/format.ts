// Formats d'affichage partagés (dates, prix)

// "25 déc. 2024"
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Prix en centimes → "12,50 €" ou "Gratuit"
export function formatPrice(pricing: number): string {
  if (pricing === 0) return 'Gratuit';
  const euros = pricing / 100;
  const n = euros % 1 === 0 ? euros.toFixed(0) : euros.toFixed(2).replace('.', ',');
  return `${n} €`;
}
