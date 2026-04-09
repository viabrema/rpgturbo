import { useTranslation } from 'react-i18next'
import { useAppStore, type AppLocale } from '../store/appStore.ts'

const languageOptions: { locale: AppLocale; key: 'lang.pt' | 'lang.en' }[] = [
  { locale: 'pt', key: 'lang.pt' },
  { locale: 'en', key: 'lang.en' },
]

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const locale = useAppStore((state) => state.locale)
  const setLocale = useAppStore((state) => state.setLocale)

  const handleLanguageChange = (nextLocale: AppLocale): void => {
    setLocale(nextLocale)
    void i18n.changeLanguage(nextLocale)
  }

  return (
    <div className='inline-flex rounded-full bg-surface/80 p-1'>
      {languageOptions.map((option) => (
        <button
          key={option.locale}
          type='button'
          onClick={() => handleLanguageChange(option.locale)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            locale === option.locale ? 'bg-brand text-surface' : 'text-ink'
          }`}
        >
          {t(option.key)}
        </button>
      ))}
    </div>
  )
}
