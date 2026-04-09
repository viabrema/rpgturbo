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
        tabSignIn: 'Entrar',
        tabSignUp: 'Cadastrar',
        nicknameLabel: 'Nickname',
        nicknamePlaceholder: 'Escolha um nickname unico',
        emailLabel: 'Email',
        emailPlaceholder: 'voce@exemplo.com',
        passwordLabel: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        signInWithEmail: 'Entrar com email',
        signInWithGoogle: 'Entrar com Google',
        signUpWithEmail: 'Cadastrar com email',
        signUpWithGoogle: 'Cadastrar com Google',
        signOut: 'Sair',
        invalidCredentials: 'Nao foi possivel entrar com email e senha.',
        googleSignInError: 'Nao foi possivel entrar com Google.',
        signUpError: 'Nao foi possivel cadastrar. Verifique email, senha e nickname unico.',
        signUpGoogleError: 'Nao foi possivel cadastrar com Google. Verifique nickname unico.',
      },
      campaigns: {
        title: 'Minhas campanhas',
        notifications: 'Notificacoes',
        noNotifications: 'Voce nao tem convites pendentes.',
        inviteMessage: 'Convite para a campanha {{campaignName}}',
        acceptInvite: 'Aceitar',
        declineInvite: 'Recusar',
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
        tabSignIn: 'Sign in',
        tabSignUp: 'Sign up',
        nicknameLabel: 'Nickname',
        nicknamePlaceholder: 'Choose a unique nickname',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        signInWithEmail: 'Sign in with email',
        signInWithGoogle: 'Sign in with Google',
        signUpWithEmail: 'Sign up with email',
        signUpWithGoogle: 'Sign up with Google',
        signOut: 'Sign out',
        invalidCredentials: 'Could not sign in with email and password.',
        googleSignInError: 'Could not sign in with Google.',
        signUpError: 'Could not sign up. Check email, password, and unique nickname.',
        signUpGoogleError: 'Could not sign up with Google. Check unique nickname.',
      },
      campaigns: {
        title: 'My campaigns',
        notifications: 'Notifications',
        noNotifications: 'You have no pending invites.',
        inviteMessage: 'Invite to campaign {{campaignName}}',
        acceptInvite: 'Accept',
        declineInvite: 'Decline',
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
