# Atlas Ninja — revisão integral das hunts e caves

Extraia **o ZIP inteiro** e abra `index.html` em um navegador moderno. Não há instalação ou build. Para hospedar, publique o conteúdo desta pasta como site estático.

## Cobertura atual

A revisão percorreu **todos os 333 registros de hunt da base** em todos os seus andares:

- **252 áreas delimitadas pelo terreno**, com South Forest em uma região única.
- **326 registros associados a áreas**. Uma área pode ter vários marcadores de entrada/referência.
- **6 referências sem perímetro próprio**: Zetsu (513), Hebi Shiro (570), os acessos de Kirigakure (377/405), Beezer na superfície (233) e NPC Minorax (598). As hunts urbanas incorretas foram removidas; os acessos e NPCs continuam como pontos próprios.
- **1 ponto sem terreno explorado**: Rounin Waraji, id 232, X1747, Y1403, Z7. A imagem está preta nessa coordenada.
- Todos os registros de hunt nos andares **Z8 a Z12** receberam área. Também foram revisadas as hunts de Z2, Z4, Z5, Z6 e Z7.

Ilhas com uma única família de monstros indicada nos marcadores recebem a silhueta da ilha inteira. Em caves, são usados os pisos, salas e caminhos; paredes e vazios ficam de fora. Caves compartilhadas foram agrupadas em uma área com todos os monstros indicados, preservando as separações de regiões e andares informadas pelo usuário.

A ilha de **Werekan** agora tem seu próprio recorte completo; os pontos de acesso de **Araks** ficam nas ilhas correspondentes. Foram incluídas, entre outras, regiões de Konchu, Gedou Skeleton, Mamushi, Keshin, Kido, Gedou Dog, Scorpion, Eirian, Wamu, Akatsuki e Zetsu.

## Correções de composição e regiões

- **South Forest:** uma área com Nukenin, Kuroari, Renegade, Skeleton e Insecnoide, conforme a confirmação do usuário. Os recortes anteriores por monstro foram retirados.
- **Vale do Fim:** caminho ao norte dos Bandits até o vale, com **Sound Shinobi**.
- **Bikkubado / Scorpion / Hebi Shiro:** a ilha inteira da nova referência tem os três mobs, sem divisão entre parte superior e inferior.
- **Skeleton Fear / Dog Fear:** Z7 com ambos; Z8 somente Skeleton Fear; Z9 somente Supreme Skeleton. A sala separada de Dog Fear em Z9 foi mantida.
- **Fortress:** Tayuya e Jiroubou juntos na área interna. A área externa junto de Minoru/portão foi corrigida para Karasu.
- O Renegade incorreto abaixo de Konoha foi retirado. Junto da ponte de Kirigakure, o Z7 indica somente o acesso; a hunt de Renegade fica no andar acima, Z6 (referência 508).
- **Dungeon Yoth Furie:** nome e associação corrigidos, usando a grafia do catálogo integrado.
- **Arak:** ilha inteira da imagem em Z7. Aracnideo permanece no andar acima, sem associação à ilha de Z7.
- **Spectre:** a terceira ilha inteira em Z4; os antigos recortes de Scorpion e Akamanto foram retirados deste andar. Os acessos de quests, saga e dungeon são preservados separadamente da composição da hunt.
- **Kakarasu:** nome e ficha corrigidos na quarta ilha de Z4. As outras hunts de Karasu continuam preservadas.
- **Orochimaru / Jya Boss:** uma ficha compartilhada com a observação explícita de **1 spawn de Orochimaru; restante da área de Jya Boss**, visível no hover e nas notas.
- **Snake Najin / Great Snake / Severium Snake:** lista completa na região de Z4. Severium Snake pode ser selecionado e buscado, com level/drops próprios ainda não cadastrados.
- **Região gelada de Z7:** a grande ilha de neve branca é de Sound Shinobi. O chão azul-claro e as manchas brancas nele pertencem a Yoth Furie. As montanhas azuis dentro da neve continuam com Yoth. A divisão segue os terrenos nativos, sem agrupar as manchas brancas do gelo com a ilha de neve.
- Outras caves compartilhadas agora têm uma ficha e uma entrada de navegação por área, com a lista completa de monstros. Os pontos originais continuam preservados como referências.

Foram mantidos o campo verde de Bandit fora de Konoha, a ilha inteira de Devil com vegetação e areia, e as três estrelas de Kamon 250+ com seus vazios internos.

## Ferramentas novas

Use **XP/h** no topo e o botão flutuante **Assistente Atlas** no canto inferior direito, também disponível no celular. O ícone foi criado no estilo da logo do Guia Ninja: pergaminho, kunais, folhas e tons de madeira/dourado.

### Calculadora de XP por hora — beta

- 53 registros de XP fornecidos pela comunidade e 14 faixas de rates da imagem do Guia NTO.
- Tempo padrão de **10 s por abate**, editável; campos para level, bônus percentual e espera/deslocamento por abate.
- Normalização por registro: `XP base = XP observada ÷ bônus observado ÷ 2`. O level de referência 581 usa rate **×2**; +80% é interpretado como ×1,8 e +380% como ×4,8.
- Estimativa: `XP/h = XP base × rate(level) × (1 + bônus/100) × 3600 / (tempo por abate + espera)`.
- Mantém precisão interna, arredondando somente a exibição. As rates são avaliadas pelo level atual, inclusive os limites 560/561, 579/580 e 699/700. No 700+, a rate é zero, conforme o Guia.
- Mostra a XP por abate, XP/h, abates/h, rate e registro usado na normalização. A ficha de uma hunt pode abrir a calculadora já com o monstro selecionado.
- Não simula troca de level/rate durante a hora, respawn, stamina, grupo ou eventos. Não atribui XP aos monstros que ainda não foram medidos.
- Preferências salvas somente neste navegador; nenhum cadastro necessário.

### Drops de bosses e recompensas de quests

As 21 quests do Guia preservam requisitos, dicas e prêmios textuais, mais a Quest New Shuriken/Glove confirmada pela comunidade (22 no total). Foram integradas **24 associações de itens em 11 quests** a partir de `NTO_QUEST_ITENS`, `NTO_QUEST_AJUSTE` e da origem dos itens em `items.js` do Guia fornecido.

| Boss | Peça do Guia |
| --- | --- |
| Deidara | Akatsuki Mask |
| Itachi | Akatsuki Legs |
| Kisame | Akatsuki Boots |
| Pain | Akatsuki Armor |
| Hidan | Amulet of Akatsuki |
| Kakuzu | Gourd Fuin |

As fichas mostram os itens com sprites e nomes, tanto na seção de loot quanto no cartão da quest. Clique em um item para consultar sua origem no assistente. Fake Samehada, Third Scythe e Hiramekarei também foram vinculados pelas origens explícitas dos itens no Guia. O ajuste do Guia que remove a recompensa antiga de Quest New Boots foi respeitado.

As peças de Hidan e Kakuzu são vinculadas aos bosses correspondentes, mesmo estando na mesma quest. As chances só aparecem quando cadastradas; ausência de chance não é tratada como 100%. Os pontos de acesso continuam identificados, e a busca prioriza os marcadores de boss. A Quest Pain não fica associada à superfície de Gamaguren.

### Recomendações e conversa do assistente

O assistente entende perguntas de recomendação, sinônimos e pequenas variações de escrita:

- **Espada / sword:** recomenda Quest New Sword em Ilhota, com as sete armas do Guia e seus caminhos. Pode destacar uma passiva de acordo com HP, chakra, crítico ou controle.
- **Distance / shuriken:** recomenda Fuuma Katon Shuriken e o acesso à Quest New Shuriken/Glove no Covil Orochimaru. A origem foi confirmada pelo usuário em 09/11/2026 e também aparece na busca pelo item e nas fichas dos pontos da quest.
- **Luva / glove:** mostra Raikage Furie Glove, a origem Quest New Kage/Glove do Guia e o acesso de Shuriken/Glove no Covil Orochimaru.
- **Melhor set free:** explica Akatsuki por quests, com as seis peças e seus bosses, e Otsutsuki por pontos de tasks no NPC [Event] Hagoromo, no depot de Konoha. Inclui as cinco peças Otsutsuki cadastradas, passivas e limites diários de tasks do Guia.
- **Preferências:** distingue opções free e VIP, considera o objetivo de iniciante e as passivas desejadas. Quando falta o tipo de arma, oferece botões para escolher espada, distance ou glove.
- **Continuação:** entende “e para distance?”, “e a luva?”, “qual recupera chakra?” e “onde fica essa quest?” usando a pergunta anterior. Um novo item/quest muda o assunto; limpar a conversa também limpa esse contexto.

As recomendações vêm dos dados do Guia, atributos/origens dos itens, confirmação da comunidade e marcadores do mapa. O módulo não simula dano nem inventa preço em pontos. A tabela das 18 tasks é consultável pelo assistente.

### Sprites e atributos nas respostas

Respostas sobre itens exibem cards com os sprites locais do Guia. Isso inclui drops, recompensas, armas e recomendações de set free/VIP. Passe o mouse, use foco de teclado ou toque no card para ver nome, atributos, passiva e origem. O tooltip fica fora da área rolável da conversa, para não ser cortado, e fecha ao rolar, sair, tocar fora ou fechar o assistente.

A recomendação VIP inclui os 11 itens do conjunto de referência Senju + Kurama do comparativo do Guia, com as opções de arma por categoria. A resposta explica o uso de Senju para PvE e diferencia os objetivos dos sets VIP. Itens sem atributos de equipamento, como Gold Bar, não recebem estatísticas inventadas.

### Assistente Atlas

Consulta a base local do Guia e as regiões revisadas: **onde dropa um item**, **onde upar em um level** e **onde fica uma quest/monstro**. As respostas incluem taxas de drop quando cadastradas e destinos reais, com o botão **Ir até**.

A navegação faz uma viagem animada com deslocamento e zoom; atravessa andares e pode ser interrompida por arraste, scroll, controles ou o botão Parar. No celular, a ficha abre após a chegada. A preferência de movimento reduzido é respeitada.

O assistente reconhece perguntas como “onde eu dropo chakra mask”, “onde dropa gold bar”, “onde posso dropar” e “onde consigo”. Ele pesquisa itens de monstros, quests e bosses, incluindo peças do set Akatsuki. Exemplos: “Onde consigo Akatsuki Mask?”, “O que o Itachi dropa?” e “Onde consigo o set Akatsuki?”. Os destinos do assistente continuam usando a viagem animada.

O assistente faz consulta textual aos dados locais, sem enviar mensagens a um serviço externo. Informa quando não há correspondência ou localização; não inventa coordenadas. O histórico da conversa fica apenas na sessão.

### Correções desta revisão

- Circuito costeiro pintado na referência: **Supreme Sand**, incluindo o contorno inteiro do caminho cinza.
- **Venom Snake / Hidan** limitados à pequena pedra; o restante dos caminhos de areia é **Shinobi Archer**.
- Área rosa da superfície unificada com **Gamaguren**. Quest Pain e hunt 300+ ficam indicadas nos andares inferiores.
- **Konoha sem contornos nem ícones de hunts** nas ruas. NPCs, quests e acessos preservados. **Beezer somente no subsolo Z8**.
- Faixas azul e roxa de Kirigakure removidas. Os pontos de acesso continuam cadastrados.
- Região de inverno separada pela divisão do terreno: ilha branca de Sound Shinobi; gelo azul-claro com manchas brancas de Yoth Furie; montanhas da neve de Yoth.

## Controles

| Ação | Controle |
| --- | --- |
| Zoom | Scroll, botões + / − ou teclas + / −; máximo de 600% |
| Subir de andar | **Ctrl + scroll para baixo**, botão de subir ou Page Up |
| Descer de andar | **Ctrl + scroll para cima**, botão de descer ou Page Down |
| Mover | Clique e arraste, inclusive sobre as áreas coloridas |
| Buscar locais, monstros e itens | Campo de busca ou tecla `/` |
| Mostrar todo o andar | Botão de enquadramento ou Home |
| Voltar a South Forest | Botão de localização abaixo do zoom |
| Consultar uma área | Hover, foco pelo teclado, clique ou toque |
| Fechar painel / cancelar edição | Esc |

Trocar de andar preserva as coordenadas centrais e o zoom. No sistema do jogo, Z menor representa andar mais alto.

## Encontrar uma hunt

Abra **Respawns por monstro**, escolha uma criatura e selecione o local. A lista percorre todos os andares e inclui também nomes de monstros encontrados nos marcadores que ainda não têm ficha de drops no catálogo.

- **Área:** há um contorno associado ao local.
- **Referência:** o ponto foi preservado, mas o piso da superfície não determina uma área própria. A ficha oferece **Ver áreas deste monstro** para localizar outras caves mapeadas.
- **Sem terreno:** a imagem não contém terreno explorado suficiente para desenhar o local.

Alguns pontos originais ficam na água ou junto da borda. Suas coordenadas foram preservadas; quando há uma área associada por nome e proximidade, a ficha informa essa condição. A ilha de Devil é o exemplo de um ponto junto do acesso que agora abre a ilha completa.

Os símbolos do mapa são vetoriais e distintos: espadas para hunt, pergaminho para quest, pessoa para NPC, caveira para boss, entrada para dungeon e losango para outros locais. O quadro flutuante “Hunts nesta região” foi removido. O menu Camadas permite ligar/desligar áreas e marcadores e ajustar a intensidade. A mensagem “Aproxime para ver os marcadores” foi retirada.

## Qualidade e precisão

O minimapa tem um pixel por tile. O desenho usa a resolução da tela com interpolação desligada, preservando os pixels originais. A ampliação é limitada a 600%; detalhes que não existem na fonte não são gerados.

**Os recortes seguem o terreno; limites reais de spawn continuam aproximados quando não foram conferidos no jogo.** A associação entre monstro e região usa os nomes/coordenadas dos marcadores. As áreas compartilhadas podem precisar de revisão pela comunidade.

Kuroari e Severium Snake foram nomeados pelo usuário e permanecem com level/drops próprios não informados. A grafia Spectre foi aplicada à criatura catalogada originalmente como Spectro, preservando seu sprite e seus dados. Os dados de criaturas, itens, quests e porcentagens são os já integrados no Atlas. O ZIP separado do NTO Guia excedeu o limite de transferência de 32 MiB; não foi importado nesta revisão.

A paleta segue o Guia Ninja/NTO Ultimate: madeira escura, areia, dourado, verde-folha e laranja. A referência de cores foi conferida no CSS do Guia fornecido.

## Editar e fazer backup

Abra uma ficha e use **Ajustar limite desta área**. Posicione os vértices e salve. As revisões ficam no navegador. Em **Encontrar uma área de up**, use **Exportar limites** / **Importar limites** para transferir as revisões manuais. Favoritos e fichas enriquecidas também preservam o armazenamento da versão anterior.

## Arquivos

- `index.html`: interface e dados incorporados para abrir sem servidor.
- `app.js`: navegação, filtros, fichas, renderizador, editor e viagens animadas.
- `atlas-tools.js`: calculadora, consultas de monstros/bosses/recompensas e destinos.
- `assistant-advisor.js`: interpretação de recomendações, sinônimos, preferências e contexto da conversa.
- `assistant_knowledge.json`: recomendações e fontes, itens, rotas, passivas de sets e tasks.
- `recompensas_quests.json`: quests, vínculos de itens, bosses e procedência dos dados do Guia.
- `img/assistant-atlas.webp`: ícone original do assistente, gerado a partir da referência visual da logo, em formato sem perdas e com transparência.
- `xp-model.js`: normalização de XP e cálculo por rate/level.
- `xp_monstros_beta.json`: registros originais, percentuais de bônus, XP normalizada e rates da print do Guia.
- `atlas.css`: estilo, responsividade e animação com movimento reduzido.
- `areas_hunts_terreno.json`: catálogo de áreas e seus caminhos SVG compactos.
- `revisao_hunts.json`: situação de cada um dos 333 registros.
- `cobertura_hunts_terreno.json`: resumo da revisão e pontos pendentes.
- `areas_south_forest_referencia.json`: composição e referência à área unificada de South Forest.
- `correcoes_hunts_comunidade.json`: histórico estruturado das correções de composição e agrupamento.
- `andares/` e demais pastas: imagens, sprites, ícones e dados originais.

Os JSON separados são referências do projeto. O aplicativo usa os payloads incorporados no HTML. O catálogo de áreas é diferente do formato de exportação dos limites manuais.

## Assistente com o Guia completo

A base `assistant_guide.json`, também incorporada no HTML, reúne 1.873 conteúdos e 5.617 perguntas preparadas: 13 sagas e seus 88 passos, 22 quests, 15 dungeons, 61 fichas de personagens com 1.016 jutsus, combos de 60 personagens e 9 Bijuus, receitas, tasks, NPCs, lojas, preços, VIP, cards/status, elementos, graduação, treinos, rates, equipamentos e drops.

`guide-assistant.js` interpreta o assunto, sinônimos, variações de palavras e continuações da conversa. Mantém as recomendações especializadas de armas/sets, drops e hunts em `assistant-advisor.js` e `atlas-tools.js`. Respostas podem trazer código copiável de macros, itens com sprites/atributos, referências do Guia e viagem aos marcadores reais do Atlas. Código de macro é mostrado como texto e não é executado pelo site.

A lista diária de monstros dos elementos depende do servidor: o assistente orienta a consultar os Registros e não apresenta o exemplo do Guia como lista atual. Valores que não constam no Guia, como preços de conta VIP ou levels mínimos de dungeons, são identificados como ausentes. Registros com nomes iguais e dados diferentes aparecem como versões distintas.

`perguntas_assistente.json` contém as perguntas por conteúdo; `cobertura_assistente.json` registra a cobertura e os arquivos de origem. O botão “Baixar o projeto completo” foi removido da interface. O ZIP para a Vercel não contém a pasta `downloads`.

## Verificação

Revisão 16: 49 perguntas naturais dos principais sistemas; continuações e troca de contexto; 1.698 perguntas por registro; retenção dos fatos de todas as sagas, jutsus e macros; preços/unidades dos NPCs; links de fonte; código copiável e inerte; botão de download removido; regressão de recomendações, sprites/atributos, drops, XP e viagens no mapa.

Revisão 15: expansão incorreta para o leste desfeita. Respawns, nomes, níveis, vínculos e contornos das referências 413 e 419 restaurados ao estado anterior. Alterada somente a hunt de Kamon/Yoth da referência 123: gelo à esquerda preenchido até a costa, limite anterior à rachadura preservado, sem pintar terreno verde ou água.

Revisão 13: ilha oeste inteira de Supreme Sand (Z7, referências 87 e 112), contorno pela silhueta nativa com 36 pixels de escada antes ausentes, preservando a água interna; ponta leste da referência 422 corrigida para Kimimaro e unificada à área adjacente de Kimimaro. Vínculos de Quest Matatabi mantidos.

Cards de “Locais para explorar”, guia de up e lista de respawns usam viagem animada: primeiro deslocamento suave, depois zoom no destino. Filtros são preservados e a viagem pode ser interrompida pelos controles do mapa. Movimento reduzido mantém navegação imediata.

Revisão das imagens seguintes: cave inteira de Giant Ice Yoth em Z8 com recomendação 100+; cave inteira adicional de Kamon em Z6 com recomendação 250+; duas áreas de Gedou Dog do Covil Orochimaru em Z6 unificadas, sem associar respawn de Orochimaru. Quests e acessos preservados.

Nesta revisão: os fechamentos pendentes dos tooltips são cancelados e vinculados ao item correto. Trocar rapidamente entre itens, navegar com Tab e entrar no painel de atributos mantém os atributos visíveis. O clique continua fixando o painel; sair, clicar fora, pressionar Esc ou rolar a conversa fecha conforme a interação. Retirada a área incorreta de Renegade no Z7 perto de Kirigakure, mantendo a hunt de Z6 e o ponto de acesso.

Verificados nesta revisão: as frases exatas de Chakra Mask e Gold Bar das capturas; variações de “dropo”, “dropa”, “dropar” e “farmar”; sprites de todos os cards free/VIP; atributos e passivas por hover/foco/toque; origens reais, fechamento dos tooltips e ausência de estatísticas inventadas para moedas.

Verificados também nesta revisão: retirada completa do quadro “Hunts nesta região”; hover, fichas, busca de respawns e assistente com os três monstros corretos; separação por terreno sem perder pixels, sem sobreposição e sem alterar as montanhas; movimentos, camadas e 16 andares funcionando sem os callbacks da antiga legenda.

Verificados anteriormente: recomendações de armas e sets, sinônimos, erros simples de escrita, contexto de perguntas seguintes, troca de assunto, preferências free/VIP, NPC de Otsutsuki, origem confirmada da Fuuma e botões de resposta.

Verificados anteriormente e na regressão: os seis vínculos de boss/peça; consulta por item, boss e set completo; distinção entre Hidan e Kakuzu; itens de requisitos não confundidos com recompensas; buscas sem chances inventadas; links das fichas; botão flutuante, abas e foco de teclado.

Verificados também: reconstrução dos 53 registros de XP; todas as bordas das 14 faixas; bônus 80%/380%; tempo por abate e espera; rate zero; valores inválidos; consultas de drops, quests e up; destinos de criaturas sem ficha de drops; viagem entre andares, interrupção, movimento reduzido e fluxo mobile.

Verificados: equivalência exata entre caminhos SVG e máscaras de pixels; ausência de preenchimento sobre água/trechos pretos; ausência de sobreposição entre áreas; cobertura dos 333 registros; preservação das áreas indicadas pelo usuário; Werekan separado dos acessos Araks; estrelas de Kamon; busca e seleção por monstro; referências e ponto sem terreno; favoritos; filtros; andares; scroll invertido; teto de zoom e desenho sem suavização.

A geometria foi conferida com diagnósticos das imagens originais. As interações foram testadas em DOM simulado. **A revisão visual em navegador real permanece pendente**, pois a ferramenta de navegador deste ambiente não está disponível.
