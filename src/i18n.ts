import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  pt: {
    translation: {
      app: {
        name: 'RPG Turbo',
      },
      nav: {
        home: 'Inicio',
        about: 'Projeto',
      },
      lang: {
        pt: 'PT',
        en: 'EN',
      },
      home: {
        kicker: 'Base inicial',
        title: 'Frontend pronto para escalar com Firebase',
        description:
          'Projeto iniciado com Vite, React, TypeScript, Tailwind e i18n para acelerar o desenvolvimento do RPG Turbo.',
        cardAuthTitle: 'Autenticacao',
        cardAuthBody: 'Estrutura preparada para login por email/senha e Google.',
        cardDbTitle: 'Realtime Database',
        cardDbBody: 'Arquitetura pronta para sincronizar estado de personagens e salas.',
        cardStorageTitle: 'Storage',
        cardStorageBody: 'Upload de avatares e assets de campanha com tipagem forte.',
      },
      about: {
        title: 'Arquitetura de partida',
        description:
          'Este bootstrap usa hash router, i18n e tema Tailwind para evoluir features sem retrabalho estrutural.',
      },
    },
  },
  en: {
    translation: {
      app: {
        name: 'RPG Turbo',
      },
      nav: {
        home: 'Home',
        about: 'Project',
      },
      lang: {
        pt: 'PT',
        en: 'EN',
      },
      home: {
        kicker: 'Kickstart',
        title: 'Frontend ready to scale with Firebase',
        description:
          'This project starts with Vite, React, TypeScript, Tailwind, and i18n to speed up RPG Turbo development.',
        cardAuthTitle: 'Authentication',
        cardAuthBody: 'Foundation ready for email/password and Google sign-in.',
        cardDbTitle: 'Realtime Database',
        cardDbBody: 'Architecture prepared to sync character and room state in real time.',
        cardStorageTitle: 'Storage',
        cardStorageBody: 'Avatar and campaign asset uploads with strong typing.',
      },
      about: {
        title: 'Starting architecture',
        description:
          'This bootstrap uses hash routing, i18n, and a Tailwind theme to evolve features without structural rework.',
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
