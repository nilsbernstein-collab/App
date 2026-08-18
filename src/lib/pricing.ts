export const PRICING = {
  monthly: { amountCents: 900, label: '9 € / Monat' },
  yearly: { amountCents: 7900, label: '79 € / Jahr', equivalentMonthly: '6,58 € / Monat', discountLabel: '2 Monate gratis' },
} as const

export interface FeatureComparisonRow {
  label: string
  free: string | boolean
  pro: string | boolean
}

export const FEATURE_COMPARISON: FeatureComparisonRow[] = [
  { label: 'Transaktionen erfassen', free: true, pro: true },
  { label: 'Einkommensquellen', free: '1', pro: 'Unbegrenzt + Vergleich' },
  { label: 'Standard-Kategorien', free: true, pro: true },
  { label: 'Automatische Kategorisierung', free: false, pro: true },
  { label: 'Steuerrücklagen-Rechner', free: false, pro: true },
  { label: 'Umsatzprognosen', free: false, pro: true },
  { label: 'Export (PDF, CSV, JSON)', free: false, pro: true },
  { label: 'API-Zugang (Bank/Shopify-Anbindung)', free: false, pro: true },
]

export const UPGRADE_COPY: Record<string, { title: string; description: string }> = {
  second_income_source: {
    title: 'Mehrere Einkommensquellen mit Pro',
    description: 'Im Free-Tier ist eine Einkommensquelle enthalten. Mit Pro verwaltest du beliebig viele parallel und vergleichst sie direkt.',
  },
  export: {
    title: 'Exportiere deine Daten mit Pro',
    description: 'PDF-Reports, CSV- und JSON-Exports sind Teil von NicheTrack Pro.',
  },
  auto_categorization: {
    title: 'Automatische Kategorisierung mit Pro',
    description: 'Lass wiederkehrende Transaktionen anhand von Regeln automatisch kategorisieren.',
  },
  tax_reserve: {
    title: 'Steuerrücklagen-Rechner mit Pro',
    description: 'Erhalte eine automatische Empfehlung, wie viel du für Steuern zurücklegen solltest.',
  },
  forecast: {
    title: 'Umsatzprognosen mit Pro',
    description: 'Sieh eine Trendlinie deiner Einnahmen basierend auf deinen historischen Daten.',
  },
  api_access: {
    title: 'API-Zugang mit Pro',
    description: 'Bereite die Anbindung an Bank- oder Shopify-Daten mit dem Pro-API-Zugang vor.',
  },
  generic: {
    title: 'Hol dir NicheTrack Pro',
    description: 'Schalte alle Pro-Funktionen frei und behalte deine Finanzen vollständig im Griff.',
  },
}
