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
- Nunca importar icones diretamente nos componentes. Todo uso de icones deve ser abstraido por meio de src/ui/icons.ts.

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

RPG Turbo é uma aplicação web para gerenciamento de campanhas de RPG. A aplicação permite que mestres e jogadores criem e gerenciem suas campanhas, personagens, itens, magias e outros recursos relacionados ao jogo. O objetivo do projeto é fornecer uma ferramenta fácil de usar e acessível para ajudar os jogadores a organizar suas aventuras e se divertir mais durante as sessões de jogo.

Principais funcionalidades:
- Criação e gerenciamento de campanhas
- Criação e gerenciamento de personagens por fichas
- Visão dos jogadores e do mestre
- Sistema de autenticação e autorização
- Rolagem de dados
- chat real time entre jogadores e mestre
- Armazenamento de recursos como imagens, mapas e outros arquivos relacionados à campanha
- música ambiente e efeitos sonoros controlados pelo mestre
- template de fichas personalizáveis por json
- área de jogo com recursos visuais e interativos compartilhados realtime com ferramentas de desenho e manipulação de tokens
- criação e listagem de campanhas
- criação e listagem de personagens dos jogadores e npcs do mestre