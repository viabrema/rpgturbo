import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  pt: {
    translation: {
      app: {
        name: 'RPG Turbo',
        loading: 'Carregando sessao...',
      },
      lang: {
        pt: 'PT',
        en: 'EN',
      },
      auth: {
        title: 'Entrar na sua mesa',
        subtitle: 'Use email e senha ou continue com Google.',
        emailLabel: 'Email',
        emailPlaceholder: 'voce@exemplo.com',
        passwordLabel: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        signInWithEmail: 'Entrar com email',
        signInWithGoogle: 'Entrar com Google',
        signOut: 'Sair',
        invalidCredentials: 'Nao foi possivel entrar com email e senha.',
        googleSignInError: 'Nao foi possivel entrar com Google.',
      },
      campaigns: {
        title: 'Minhas campanhas',
      },
    },
  },
  en: {
    translation: {
      app: {
        name: 'RPG Turbo',
        loading: 'Loading session...',
      },
      lang: {
        pt: 'PT',
        en: 'EN',
      },
      auth: {
        title: 'Sign in to your table',
        subtitle: 'Use email and password or continue with Google.',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        signInWithEmail: 'Sign in with email',
        signInWithGoogle: 'Sign in with Google',
        signOut: 'Sign out',
        invalidCredentials: 'Could not sign in with email and password.',
        googleSignInError: 'Could not sign in with Google.',
      },
      campaigns: {
        title: 'My campaigns',
      },
    },
  },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
