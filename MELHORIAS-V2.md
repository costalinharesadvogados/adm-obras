# Obra em Dia — ideias para a v2

Em ordem do que mais devolve trabalho poupado.

## 1. Cálculo de material a partir da medida
Hoje o app calcula a área e você informa a quantidade. Na v2, o material pode ter um "rendimento" (m² por caixa, kg por m², litros por demão) e o app sugere sozinho: *piso de 12,8 m², caixa com 2,16 m², 10% de perda → 7 caixas*. O botão do Claude vira conferência, não cálculo obrigatório.

## 2. Diário da obra por data
Uma linha do tempo: foto tirada no dia, quem esteve na obra, o que foi feito. Serve para acompanhar e, se der problema com o empreiteiro, vira prova organizada por data.

## 3. Etapas e cronograma
Agrupar tarefas em etapas (demolição, hidráulica, elétrica, revestimento, acabamento) com percentual por etapa e previsão de término. Hoje só existe a lista solta.

## 4. Pagamentos e mão de obra
Materiais já estão cobertos; falta o pedreiro. Cadastro de prestador, valor combinado, parcelas pagas e a pagar, com recibo anexado — hoje isso não entra em lugar nenhum e é metade do custo de uma reforma.

## 5. Comparar orçamentos
Três orçamentos do mesmo item, lado a lado, com o vencedor marcado e os outros guardados. Útil na hora de negociar e para justificar a escolha depois.

## 6. Antes e depois
Marcar duas fotos do mesmo ambiente e ver as duas lado a lado, com arrastar para comparar. É o que dá vontade de mostrar para os outros.

## 7. Exportar em PDF
Hoje o relatório sai em `.md`. Um PDF com as fotos embutidas serve para mandar ao arquiteto ou ao condomínio.

## 8. Busca
Com muitos materiais, um campo de busca por nome e fornecedor evita rolar a lista inteira.

## 9. Compartilhar a obra
Um arquivo de backup já leva tudo para outro aparelho. A v2 poderia gerar um link ou QR para a Rita abrir a mesma obra — exige servidor, então é decisão de projeto, não só de código.

## 10. Lembrete de prazo
Notificação no dia da tarefa. Funciona bem no Android; no iPhone o navegador é limitado, então vale avisar em vez de prometer.

## 11. Reordenar e duplicar
Arrastar para reordenar tarefas e duplicar um ambiente inteiro ("Banheiro Social" → "Banheiro Francisco" com os mesmos materiais) poupa muita digitação.

## 12. Foto com a câmera direto no app
Hoje o app abre o seletor de arquivos. Um botão "tirar foto agora" (`capture="environment"`) encurta o caminho quando você está de pé na obra.
