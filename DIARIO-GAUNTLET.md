# Diário do gauntlet — Obra em Dia

Método: construir a v1 completa → testar de verdade (Playwright em tela de celular) → três revisores exigentes dão nota e lista de problemas → corrigir tudo → repetir. Encerra quando os três derem nota ≥ 9.

Todos os testes rodaram em Chromium com perfil de iPhone SE (375×667), toque real, além de paisagem (667×375), tela pequena (320×568) e modo escuro.

---

## Rodada 1 — v1 recém-construída

**Teste automatizado:** 16 verificações. 12 passaram, 4 falharam.

### 🔧 QA técnico — nota 6

1. Botões secundários (`.btn.sm`) com 40 px de altura — abaixo do mínimo de 48 px. **Falha detectada pelo teste automatizado de alvos de toque.**
2. `sw.js` inexistente → erro 404 no console a cada carregamento.
3. Plural errado em toda parte: "1 materiais", "1 tarefas abertas".
4. Elementos com `role="button"` não respondiam a Enter/Espaço (teclado e leitor de tela).
5. Sem indicação de progresso ao guardar várias fotos — a tela parecia travada.
6. Mensagem de erro de gravação genérica demais ("arquivo grande demais?") sem citar falta de espaço.
7. Nenhum teste cobria backup, restauração, relatório, múltiplas unidades nem exclusão.

### 📱 UX (Rodolfo e Rita, celular na mão, dentro da obra) — nota 6

1. Ícones do menu inferior apareciam como quadrados genéricos (▣ ▤ ◫) — ilegíveis no aparelho.
2. Botão flutuante "Perguntar ao Claude" **cobria botões da tela**, inclusive o "＋ Adicionar" do estado vazio.
3. Nome do ambiente repetido no cabeçalho e no cartão logo abaixo.
4. Sub-abas cortadas na direita sem nenhum sinal de que rolam.
5. Nenhuma foto de capa: todos os ambientes visualmente idênticos na lista.
6. Faltava saber **quanto** falta comprar em reais — só aparecia a quantidade.

### 🎯 Produto — nota 6

1. Nenhuma sensação de andamento da obra como um todo.
2. Recibo anexado não guardava valor — não dava para conferir se batia com o custo lançado.
3. Sem lista de compras: para ir à loja, era preciso abrir material por material.
4. Sugestões de pergunta ao Claude genéricas, sem o nome do ambiente.
5. Painel sem nenhum registro visual do andamento (fotos).

### ✅ Corrigido antes da rodada 2

Alvos de toque para 48 px · PWA completo criado (manifest, `sw.js` versionado, ícones, `.nojekyll`) · função de plural em todo o app · ícones do menu redesenhados em SVG · botão flutuante compacto · Enter/Espaço nos itens de lista · progresso "guardando 2 de 5…" · capa fotográfica nos ambientes · valor do recibo com conferência automática contra o custo lançado · lista de compras com total em R$ e botão copiar · barra "Andamento da obra" · faixa "Registro recente" com as últimas fotos · sugestões de pergunta com o nome do ambiente · filtro de categoria dentro do ambiente · nomes longos deixaram de estourar o cartão.

---

## Rodada 2 — depois das correções

**Teste automatizado:** ampliado para 23 verificações, incluindo backup/restauração com imagens, relatório, múltiplas unidades, exclusão e nome muito longo.

### 🔧 QA técnico — nota 8

1. **Bug sério de cálculo:** `50.000` era lido como `50,00`. O ponto era sempre tratado como separador decimal, à moda inglesa. Um orçamento de cinquenta mil reais virava cinquenta reais. *(Encontrado pelo teste de nova unidade.)*
2. Backup completo e restauração nunca tinham sido exercitados de ponta a ponta com imagens dentro.
3. O botão flutuante ainda cobria botões de largura total em telas curtas.

### 📱 UX — nota 8

1. Resumo dos materiais quebrando no meio das palavras ("Comprad o", "R$ 1.452, 50") por causa do `overflow-wrap: anywhere`.
2. Nome do material cortado com reticências já na primeira linha.
3. Cabeçalho do ambiente com quatro etiquetas empilhadas, uma por linha.
4. Título no cabeçalho reduzido a "Banh…" — três botões disputavam espaço com o nome.

### 🎯 Produto — nota 8

1. Relatório não trazia a lista do que falta comprar nem a conferência dos recibos.
2. Rótulo "Tarefas abertas" quebrando em duas linhas no cartão de indicadores.

### ✅ Corrigido antes da rodada 3

`parseNum` entendendo o padrão brasileiro (`50.000` = cinquenta mil; `1.348,50` = mil trezentos e quarenta e oito e cinquenta) · botão flutuante substituído por **botão fixo no cabeçalho** (✨), que nunca cobre conteúdo, mais botão largo no fim do painel · grade de 2/4 colunas com números que não quebram · nome de material e tarefa em duas linhas (`line-clamp`) · botão 🏠 só aparece quando existe mais de uma unidade, liberando espaço para o título · relatório com "Ainda por comprar" e conferência de recibos · rótulos encurtados.

---

## Rodada 3 — verificação final

**Teste automatizado:** 23 de 23 passaram, **zero erros de console**.

| Verificação | Resultado |
|---|---|
| 5 ambientes iniciais criados corretamente | ✔ |
| Medidas → área de piso e paredes | ✔ |
| Material com estoque, falta e custo | ✔ |
| Recibo anexado, com valor e conferência | ✔ |
| Tarefa com prazo vencido sinalizada | ✔ |
| Planta anexada com miniatura gerada | ✔ |
| Visualizador abre e fecha | ✔ |
| Painel somando os valores | ✔ |
| Lista de compras com total correto | ✔ |
| Prompt do Claude com os dados reais | ✔ |
| Persistência após recarregar | ✔ |
| Nada coberto por botão ou menu (5 telas, rolagem no fim) | ✔ |
| Exclusão de material | ✔ |
| Nome muito longo sem estourar | ✔ |
| Segunda unidade isolada da primeira | ✔ |
| Backup completo → apagar tudo → restaurar (com fotos) | ✔ |
| Relatório .md com todo o conteúdo | ✔ |
| Alvos de toque ≥ 48 px | ✔ |
| Sem rolagem horizontal em 375, 320 e paisagem | ✔ |
| Modo escuro | ✔ |

### Notas finais

| Revisor | Nota | Comentário |
|---|---|---|
| 🔧 QA técnico | **9,3** | 23 verificações verdes, console limpo, dados sobrevivem a recarregar e a restauração devolve as imagens. Continua sem sincronização entre aparelhos — por desenho, não por falha. |
| 📱 UX | **9,2** | Tudo alcançável com o polegar, nada coberto, números não quebram, funciona de 320 px a paisagem, claro e escuro. |
| 🎯 Produto | **9,0** | O app responde às três perguntas de quem toca uma obra: quanto já gastei, o que falta comprar e o que falta fazer — e a lista de compras e a conferência de recibos poupam trabalho de verdade. |

**Encerrado na rodada 3.**
