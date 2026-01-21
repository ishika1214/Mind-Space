import { ThemeColors } from '../contexts/ThemeContext'

const PRIMARY_CLASSES: Record<string, {
  text: string
  bg: string
  bgHover: string
  bgLight: string
  bgLightHover: string
  border: string
  ring: string
  focus: string
}> = {
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    bgLight: 'bg-indigo-50',
    bgLightHover: 'hover:bg-indigo-100',
    border: 'border-indigo-200',
    ring: 'ring-indigo-500',
    focus: 'focus:ring-indigo-500',
  },
  slate: {
    text: 'text-slate-600',
    bg: 'bg-slate-600',
    bgHover: 'hover:bg-slate-700',
    bgLight: 'bg-slate-50',
    bgLightHover: 'hover:bg-slate-100',
    border: 'border-slate-200',
    ring: 'ring-slate-500',
    focus: 'focus:ring-slate-500',
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    bgLight: 'bg-purple-50',
    bgLightHover: 'hover:bg-purple-100',
    border: 'border-purple-200',
    ring: 'ring-purple-500',
    focus: 'focus:ring-purple-500',
  },
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgLight: 'bg-blue-50',
    bgLightHover: 'hover:bg-blue-100',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
    focus: 'focus:ring-blue-500',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgLight: 'bg-emerald-50',
    bgLightHover: 'hover:bg-emerald-100',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    focus: 'focus:ring-emerald-500',
  },
  orange: {
    text: 'text-orange-600',
    bg: 'bg-orange-600',
    bgHover: 'hover:bg-orange-700',
    bgLight: 'bg-orange-50',
    bgLightHover: 'hover:bg-orange-100',
    border: 'border-orange-200',
    ring: 'ring-orange-500',
    focus: 'focus:ring-orange-500',
  },
  cyan: {
    text: 'text-cyan-600',
    bg: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    bgLight: 'bg-cyan-50',
    bgLightHover: 'hover:bg-cyan-100',
    border: 'border-cyan-200',
    ring: 'ring-cyan-500',
    focus: 'focus:ring-cyan-500',
  },
}

export function getThemeClasses(colors: ThemeColors) {
  const primaryClasses = PRIMARY_CLASSES[colors.primary] || PRIMARY_CLASSES.indigo

  return {
    primary: primaryClasses.text,
    primaryBg: primaryClasses.bg,
    primaryBgHover: primaryClasses.bgHover,
    primaryBgLight: primaryClasses.bgLight,
    primaryBgLightHover: primaryClasses.bgLightHover,
    primaryBorder: primaryClasses.border,
    primaryRing: primaryClasses.ring,
    primaryFocus: primaryClasses.focus,
    card: colors.card,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
    background: colors.backgroundGradient,
  }
}
