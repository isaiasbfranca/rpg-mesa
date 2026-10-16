# Mesa: caderno de campanha para RPG de mesa

Esqueleto funcional do MVP. Arquitetura e decisões em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm test                # testes unitários (dados, ficha, permissões, armazenamento)
npm run test:coverage   # falha abaixo de 80% em dice, sheet e permissions (RNF-12)
npm run test:e2e        # Playwright em 360, 768 e 1440 px (sobe o app sozinho)
npm run lint
npm run typecheck
npm run build
```

## O que já funciona (dados ficam no navegador)

- Criar campanha escolhendo um de três modelos de ficha de exemplo.
- Editar o modelo de ficha: seções, campos dos seis tipos, obrigatório, regra de modificador, dado do atributo, pré-visualização.
- Criar personagens e NPCs (ocultos por padrão), ficha gerada a partir do modelo, salvamento automático.
- Rolar a partir de um atributo (`1dN + mod`), rolador com notação livre, atalhos d4 a d100, vantagem e desvantagem, destaque de 20 e 1 naturais, histórico local.
- Aparência do personagem (E12): retrato ilustrado do protótipo de UX v0.5, com gênero, idade e compleição, 10 grupos de camadas com miniatura em cada opção, cor própria, sortear tudo ou uma camada, desfazer e refazer; galeria com 16 arquétipos; ou envio de imagem com recorte circular ou quadrado e zoom. O avatar aparece na ficha, na lista e no histórico de rolagens.
- Registro de sessões com linha do tempo; última sessão no painel.
- Notas privadas ou da campanha, com categoria, filtro e busca.

## CI

`.github/workflows/ci.yml` roda lint, typecheck, testes com cobertura, build e E2E a cada push e PR, assim que o código estiver num repositório GitHub.

## Ainda não

Contas, convites e servidor (dados só no navegador, um usuário que é sempre a mestra). Ver próximos passos na arquitetura.
