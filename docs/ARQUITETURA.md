# Arquitetura do Mesa (v0.1)

Dono: agente Desenvolvedor. Alinhada à [visão do PO v0.1](../../produto/visao.md) e aos [requisitos v0.2](../../requisitos/requisitos.md).

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| App web | Next.js 16 (App Router) + React 19 + TypeScript estrito | Um só projeto para telas e servidor; web responsivo; deploy por push (RNF-10). |
| Estilo | CSS puro com os tokens do protótipo de UX | Sem dependência extra; temas claro e escuro já vêm do protótipo. |
| Testes | Vitest com cobertura v8, Playwright em 360/768/1440 px | Batem com a estratégia de QA; CI no GitHub Actions. |
| Qualidade | ESLint (config do Next.js) e TypeScript estrito | Lint e typecheck bloqueiam o CI. |
| Banco (próximo passo) | Postgres gerenciado (Neon ou Supabase) + Drizzle ORM | Relacional encaixa no modelo de dados; ORM tipado e migrações versionadas. |
| Autenticação (próximo passo) | Auth.js com e-mail e senha, hash Argon2id | RF-01/02 e RNF-04; cookies HttpOnly, Secure, SameSite=Lax. |
| Validação | Zod nas Server Actions | RNF-04: toda entrada validada no servidor. |
| Hospedagem | Vercel (app) + Postgres gerenciado | Deploy por push, HTTPS, backups do provedor (RNF-11). |

## Camadas

```
src/
  domain/      regras puras, sem React nem I/O (dados, ficha, permissões, modelos de exemplo)
  data/        contrato Repository + implementação atual (localStorage) + histórico de rolagens
  hooks/       useRollHistory, useActor
  components/  telas por área: campaign, template, character, dice, session, notes
  app/         rotas do Next.js; só montam componentes
```

A regra de dependência é `app → components → hooks → data → domain`. O domínio não importa nada de fora.

### Domínio
- `dice.ts`: interpretador `XdY ± Z` com limites de RF-12, vantagem/desvantagem (rola a expressão duas vezes e fica com o maior ou menor total), gerador `crypto.getRandomValues` com amostragem por rejeição, sem viés de módulo (RNF-05). Gerador injetável para testes.
- `sheet.ts`: modelo de ficha como seções de campos tipados (união discriminada), regra de modificador (nenhum, D&D, valor direto), evolução do modelo (campo novo entra vazio, remoção com aviso, versão sobe a cada mudança).
- `permissions.ts`: tabela 2.1 dos requisitos como funções puras. O servidor chama as mesmas funções para autorizar; o cliente só usa para esconder botões.
- `templates.ts`: três modelos de exemplo genéricos (RF-09).
- `avatar.ts`, `portrait.ts`, `portraitArt.js` e `portraitSvg.ts` (E12): o avatar é uma união `camadas | imagem`.
  - **Retrato montado (UX v0.5):** configuração de 30 chaves (gênero, idade, compleição, raça, rosto, cabelo, marcas, maquiagem, acessórios, roupa, item, cenário, aura e moldura) com só ids do catálogo e cores `#rrggbb`. `portraitArt.js` é uma cópia do catálogo e do desenho de `ux/prototipo.html`, mantida em JS de propósito para a próxima versão do UX entrar com uma cópia; `portrait.ts` tipa o catálogo e guarda as regras (sugestão por raça, sorteio, normalização, migração). `portraitSvg.ts` normaliza de novo antes de desenhar, então nenhum texto de dados chega ao SVG, que entra na página como HTML (CT-AVA-11).
  - **Migração:** retratos salvos pelo criador v1 (11 camadas) são convertidos ao abrir (`portraitOf`/`migrateV1Layers`); o estúdio avisa e a conversão é gravada ao salvar. Sem gênero no v1, quem tinha barba vira masculino e o resto andrógino.
  - **Imagem enviada:** recortada no navegador para 512×512 WebP, com miniatura de 96 px para listas (RNF-14), guardada como data URL. Quando houver servidor, vai para armazenamento de objetos e a ficha guarda só a URL.

### Dados
As telas falam só com o tipo `Repository`. Hoje ele é implementado com `localStorage` (um usuário local que é sempre a mestra), o que deixa o app inteiro navegável sem servidor. A troca para Postgres é escrever outra implementação que chama Server Actions; as telas não mudam.

## Como fica com servidor

```
Navegador ──Server Action──▶ valida (Zod) ──▶ carrega Actor da sessão ──▶ domain/permissions ──▶ Drizzle ──▶ Postgres
```

Tabelas: `users`, `campaigns` (com `template` em JSONB e `template_version`), `memberships`, `invites` (token de 128 bits, ativo), `characters` (valores em JSONB), `session_logs`, `notes`. O modelo de ficha fica em JSONB porque é definido pela mestra; os valores da ficha também, indexados pelo id do campo.

## Decisões

1. **Rolagens no cliente no MVP.** Requisitos v0.2 dizem que o histórico é local e não há mesa ao vivo. A rolagem já é um objeto completo (`DiceRoll` com expressão, tentativas, total, rótulo e horário), pronto para virar evento com autor e campanha na v2 (RNF-09). Quando houver rolagem compartilhada, ela passa a ser feita no servidor, para o resultado não poder ser forjado (ponto levantado por UX e QA).
2. **Histórico local:** últimas 50 rolagens por campanha guardadas no aparelho (proposta dos requisitos §5.2).
3. **Atributo vazio:** campo de atributo novo começa vazio, e o modificador aparece como "—" até ser preenchido, para não mostrar −5 numa ficha nova com regra D&D.
4. **Salvamento automático** da ficha 600 ms após a última edição (RF-10 pede até 2 s).
5. **Upload de avatar:** limite de 5 MB da visão do PO v0.2. Os requisitos v0.2.1 ainda dizem 2 MB (RF-10); segui o PO, que é mais recente.
6. **Limites da rolagem (RF-12 v0.2.1):** até 100 dados somando a expressão inteira, cada número inteiro de 0 a 1000, até 10 termos e até 100 caracteres.
7. **Armazenamento local seguro:** dado corrompido vai para uma cópia `mesa:v1:backup:<data>` antes de qualquer escrita, e falha de escrita aparece como aviso na tela (DEF-02 e DEF-04).
8. **Fora do esqueleto, de propósito:** iniciativa e combate (E8, v2) e tempo real (E9, v2).

## Próximos passos

1. Postgres + Drizzle + Auth.js: cadastro, login, recuperação de senha (E1).
2. Participação e convite por link (E2), com as permissões já testadas.
3. Implementação `serverRepository` do contrato `Repository`.
4. Upload de avatar (RF-10), arquivar campanha, edição e exclusão de registros de sessão.
5. Acessibilidade automatizada com axe nos testes E2E.
