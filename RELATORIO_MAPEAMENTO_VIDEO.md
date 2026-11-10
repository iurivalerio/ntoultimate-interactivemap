# Atlas Ninja v12 — levantamento do vídeo de 16m18s

## Resultado efetivamente concluído
- Foram lidos quadros do MP4 enviado, 98 amostras de 10 em 10 segundos e 32 cenas comentadas.
- O minimapa visível no vídeo foi correlacionado com o PNG original do andar Z7, produzindo 13 âncoras **aproximadas de cenas exteriores**. Outras correspondências ficaram fora do mapa por terem andar incerto.
- A interface recebeu uma galeria de vídeo com os tempos, uma camada opcional de pinos 🎞 e navegação para os pontos aproximados; além de 7 âncoras verificadas nos marcadores originais.
- Para Konoha, o aplicativo recebe texturas de telhado vermelho e madeira extraídas das capturas do próprio jogo fornecidas pelo usuário, aplicadas **somente em tiles que já são marcados como construções no minimapa**. A vegetação de South Forest continua baseada no piso ciano e nas árvores repetidas nos tiles verde-escuros.

## Evidências pontuais mais importantes

| Tempo | Região/cena | Estimativa (X,Y,Z) | Confiança do alinhamento |
|---|---|---|---|
| 00:10 | Konoha | 1011, 900, 7 | 0.830 |
| 00:30 | Konoha / floresta próxima | 1114, 920, 7 | 0.832 |
| 00:50 | Konoha / canal | 1117, 909, 7 | 0.835 |
| 01:00 | Konoha | 1096, 947, 7 | 0.855 |
| 01:30 | Konoha / canal | 1030, 901, 7 | 0.798 |
| 02:20 | Floresta com piso ciano | 966, 914, 7 | 0.856 |
| 02:50 | Mata / estruturas | 967, 889, 7 | 0.845 |
| 08:20 | Konoha / construções | 1016, 921, 7 | 0.827 |
| 08:50 | South Forest · caminho | 880, 1050, 7 | 0.878 |
| 09:00 | South Forest · Renegade | 909, 973, 7 | 0.750 |
| 14:30 | Konoha / transição | 971, 877, 7 | 0.848 |
| 14:50 | Floresta compacta | 991, 859, 7 | 0.839 |
| 15:00 | Floresta compacta | 990, 856, 7 | 0.841 |

**Confronto relevante:** aos 09:00, a estimativa foi (909, 973, 7), e o marcador original do Jounin Renegade está em (910, 978, 7). Isto é evidência de proximidade, não garantia de posição exata de todas as paredes, árvores e casas.

## Critérios por região
- **Konoha:** códigos de telhado vermelho e madeira já presentes no minimapa, casas circulares e retangulares, pisos de madeira, canais, pontes e ruas descritos no vídeo. A posição individual de janelas, móveis e escadas não foi inferida automaticamente.
- **South Forest:** o chão ciano permanece acessível; as manchas verde-escuras continuam cobertas por árvores repetidas conforme a regra já definida pelo usuário. O vídeo mostra uma plataforma de madeira e confronto com Jounin Renegade perto das coordenadas indicadas; detalhes precisos de edificação ainda precisam de conferência.
- **Outros biomas:** o vídeo também passa por areia, cavernas, canais e dungeons. Os quadros foram catalogados para próximas etapas, mas não foram colocados como objetos com coordenadas inventadas.

## Fases ainda não concluídas
O vídeo não contém por si um arquivo de mapa (.otbm), e nem mostra todos os tiles; não é possível reconstruir todo o mundo exatamente a partir dele. Restam a identificação e o posicionamento individual de cada árvore, telhado, parede e objeto fora das regras homogêneas; validação de acessos/floors; montagem dos edifícios complexos; otimização do zoom; e conferência manual de mapeamentos de baixa correlação.

## Fontes e precisão
- Fonte visual: MP4 enviado na conversa; imagens locais em `video_refs/` reproduzem apenas os quadros selecionados para referência do Atlas.
- Fonte espacial: minimapa OTMM e marcadores do `config.otml` extraídos anteriormente, preservando nome e coordenada.
- Correlação técnica: template matching do minimapa visível no vídeo contra a superfície Z7, escala aproximada 0,70. A coordenada é estimada pelo centro do indicador no minimapa; pode ter erro de alguns tiles e falha em interiores.
- Fonte de recursos: textura/catálogo NTOHard já no Atlas; amostras de telhado e madeira de Konoha recortadas das capturas fornecidas pelo usuário porque os gráficos oficiais do cliente NTO Ultimate não estavam disponíveis sem descriptografia.
