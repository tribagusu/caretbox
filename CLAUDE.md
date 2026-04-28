# Conot

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`
- **Test**: `npm run test` (vitest, server actions & utilities only)
- **Test watch**: `npm run test:watch`

## Neon Database

When using the Neon MCP tools, **always** use these values:

- **Project ID**: `nameless-river-47510753`
- **Branch ID**: `br-rapid-field-a1mfpfmi` (development)
- **Database**: `neondb`

**NEVER** use the production branch (`br-shy-field-a1oqehef`). All queries, migrations, and operations must target the development branch only.
