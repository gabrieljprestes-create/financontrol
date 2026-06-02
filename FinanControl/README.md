# FinanControl

Sistema de controle financeiro pessoal desenvolvido como projeto acadêmico.

## Tecnologias

- React 19
- TypeScript
- TanStack Start / TanStack Router
- Tailwind CSS v4
- Vite 7
- shadcn/ui (Radix UI)

## Como executar

Pré-requisitos: [Bun](https://bun.sh) ou Node.js 20+.

```bash
# Instalar dependências
bun install

# Rodar em modo desenvolvimento
bun run dev

# Build de produção
bun run build
```

O servidor de desenvolvimento sobe em `http://localhost:5173`.

## Estrutura

```
src/
├── routes/          # Rotas (file-based routing do TanStack Router)
├── components/      # Componentes reutilizáveis
│   └── ui/          # Componentes de interface (shadcn/ui)
├── hooks/           # React hooks customizados
├── lib/             # Utilitários e funções de servidor
└── styles.css       # Estilos globais (Tailwind)
```

## Licença

Projeto acadêmico - uso educacional.
