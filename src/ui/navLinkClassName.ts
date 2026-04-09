export const getNavClassName = ({ isActive }: { isActive: boolean }): string =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand text-surface shadow-[0_8px_20px_-8px_var(--color-brand)]'
      : 'bg-surface/70 text-ink hover:bg-surface'
  }`
