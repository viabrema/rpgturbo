# Tecnologias

- Vite
- React + TypeScript
- Tailwind 4.2+
- i18n (i18next)
- Firebase Authentication (email/senha + Google)
- Firebase Realtime Database
- Firebase Hosting
- Firebase Storage
- Vitest
- Testing Library
- ESLint
- Zustand

# Regras de codigo

- Manter limite de 300 linhas por arquivo via lint.
- Barrar strings hardcoded e usar i18n para textos exibidos na UI.
- Ao final de cada bloco de desenvolvimento, rodar `npm run check` (typecheck + lint + test:coverage).
- Manter cobertura de testes em 100%.
- Os testes devem sempre ficar na pasta __tests__ dentro do mesmo diretório dos arquivos testados.
- Usar Tailwind com tema e evitar cores hardcoded fora de contexto arquitetural aprovado.

Exemplo:

```css
@import "tailwindcss";

@theme {
  --color-default: oklch(0.72 0.11 178);
}
```

# Comportamento

- Sempre responder em portugues.

# Arquitetura Atual (resumo)

- separação por domínio
- Navegação por hash router react router
- Componentes de UI genéricos em src/ui
- Componentes específicos de domínio em src/features
- Deve ser mantida uma camada de serviço para comunicação com o Firebase, isolando a lógica de acesso aos dados do restante da aplicação.
- Deve ser usado o Zustand para gerenciamento de estado global, evitando o uso de contextos do React para esse fim.


# Sobre o projeto