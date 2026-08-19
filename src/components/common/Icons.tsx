import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export const HomeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
)

export const ListIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

export const ChartIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
  </svg>
)

export const SettingsIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const SunIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const MoonIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
)

export const SparkleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1" />
  </svg>
)

export const DownloadIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

export const MenuIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const TrendingUpIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </svg>
)

export const CameraIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)

export const LoaderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const AlertTriangleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M10.3 3.9 1.8 18a1 1 0 0 0 .9 1.5h18.6a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.7 0Z" />
    <path d="M12 9v4M12 16.5h.01" />
  </svg>
)

export const UploadIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
)

export const CalendarIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
)

export const ReceiptIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V4a1 1 0 0 1 1-1Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
)

export const PiggyBankIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 9V6a1 1 0 0 0-1-1h-2.5A5.5 5.5 0 0 0 5 8.5c0 1-.4 1.5-1 2s-1 1.2-1 2v1a2 2 0 0 0 2 2h1v3h3v-2h4v2h3v-3.2c1.2-.6 2-1.9 2-3.3V11" />
    <circle cx="16" cy="9" r=".5" fill="currentColor" />
  </svg>
)
