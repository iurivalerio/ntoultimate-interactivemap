# Atlas Ninja v14 — contornos irregulares de hunts e hover de level

Abra `index.html` (extraia o ZIP completo antes).

## Novidades
- Os círculos da v13 foram substituídos por 46 **polígonos irregulares** recortados das cores e continuidade do minimapa. Os polígonos são **sugestões** e não limites oficiais/exatos dos spawns.
- Passe o mouse sobre uma área colorida para ver **Level inicial–final**, o nome da hunt e o estado do limite. Com um clique, a ficha daquela hunt abre.
- As faixas de nível, para Set básico e Set VIP, continuam vinculadas ao conteúdo do Guia Ninja.
- Para ajustar uma hunt: no painel **Áreas de up**, selecione uma faixa de level, encontre a hunt e clique em **Delimitar**. O mapa centraliza a hunt. Clique nos pontos que formam o perímetro, em sequência; em seguida clique em **Salvar limite**. Use **Desfazer ponto** e **Cancelar** quando precisar. Os traçados manuais passam a ter contorno contínuo; os não revisados ficam tracejados.
- Seus perímetros são salvos no navegador. Use **Exportar contornos** para backup e **Importar contornos** para carregar em outro dispositivo.
- O mapa original, os 16 andares, os 637 marcadores, as fichas, drops, checklist e o visual do Guia Ninja foram preservados.

## Precisão
O arquivo `minimap.otmm` registra os terrenos explorados e coordenadas dos pontos, mas não informa a área exata de cada spawn. **Sem informações oficiais de áreas de caça, o limite exato só pode ser estabelecido conferindo cada hunt no jogo ou em vídeo e traçando seus vértices.** Os polígonos sugeridos são auxiliares e não devem ser publicados como perímetros confirmados.

A base original contém 47 pontos distintos vinculados às recomendações de up; 46 contornos sugeridos puderam ser gerados. Um ponto, a Hunt Rounin Waraji 450+ (id 232, X 1747, Y 1403, Z7), está sobre área não explorada do minimapa e por isso não recebeu contorno automático. Você pode delimitá-lo manualmente com mais referências.

## Arquivos
- `contornos_hunts_sugeridos.json`: polígonos iniciais sugeridos por análise das cores do minimapa.
- `progresso_guia.json`: faixas de level e recomendações.
- `index.html`: aplicativo completo, usa os dados embutidos para abrir mesmo sem servidor.

### Revisão das recomendações
Algumas associações automáticas antigas ligavam hunts declaradas como 80+/150+ a faixas 1–35 ou 35–75. O aplicativo agora deixa de exibir contornos onde o level mínimo explícito da hunt supera o nível máximo da faixa escolhida, para não recomendar locais sabidamente incompatíveis. Isso pode deixar as faixas mais baixas sem overlays até que existam coordenadas confiáveis.
