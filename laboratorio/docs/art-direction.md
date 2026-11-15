# BREU — Direção de arte e critérios de qualidade

## Identidade

Um shopping futurista japonês que foi abandonado após uma pane de infraestrutura. Deve parecer um edifício construído e usado por pessoas, **não** um labirinto de cubos idênticos. Terror de arquitetura: compressão espacial, iluminação insuficiente, infraestruturas expostas, sujeira crível e silêncio.

## Regras visuais

1. **Circulação racional:** galerias, eixos e cruzamentos seguem a função original do shopping. Passagens apertadas decorrem de obras, desabamento, móveis ou fechamento de emergência, e nunca de curvas aleatórias.
2. **Setores reconhecíveis:** lámen (materiais quentes, cozinha), câmeras (vidros e madeira de segurança), moda (espelhos e painéis), eletrônicos (monitores e bancadas), farmácia (grade), fliperama (máquinas), banheiros (azulejos e lavatórios), segurança (monitores, quadro de energia) e doca (aço oxidado).
3. **Escuridão legível:** a luz precisa permitir distinguir a próxima porta e o obstáculo mais próximo. O terror vem da incerteza, não de um quadro preto.
4. **Paleta envelhecida:** concreto frio, azulejo mofado, aço corroído, âmbar de cozinha, vermelho de emergência e branco fluorescente cansado. Evitar saturação neon indiscriminada.
5. **Materiais distintos:** não cobrir todo o mapa com a mesma textura. Cada área deve ter motivo para piso, teto e revestimento particulares.
6. **Desordem com causa:** carrinhos perto das lojas, fiação perto do teto, reformas em alas isoladas, lixo junto às paredes, mesas na alimentação, cabines nos banheiros.
7. **Sem paredes falsas:** qualquer vitrine bloqueada deve corresponder a um sólido. Qualquer abertura visível deve ter navegação e colisões compatíveis.
8. **Mundo fechado:** perímetro, forros, pisos e vãos de escadas precisam impedir que jogadores vejam o vazio de fora ou atravessem os pavimentos.

## Zonas-piloto da Ala 03

- **Entrada:** piso cerâmico desbotado, maior espaço de respiro, luz difusa.
- **Comércio:** corredor mais escuro, revestimento gasto, vitrines distintas e lojas de interior profundo.
- **Trecho de obra:** barreiras físicas que reduzem a largura a um vão central legível.
- **Banheiros:** espelho marcado, pias, três compartimentos físicos e um painel de iluminação fria.
- **Doca/segurança:** concreto exposto, quadro de alarme e porta física destravada por interação.

## Aprovação antes de integrar ao jogo principal

- Pelo menos uma captura frontal e uma lateral de cada loja, entrada e saída do banheiro, corredor estreito, segurança e doca.
- Conferir visual de dia/noite **dentro do motor** e no celular real. Não aprovar com base apenas em testes de lógica ou mock de renderização.
- Testar a rota completa, incluindo saltos, contatos e alarme, com física Rapier real.
- Validar que o alarme **não** destrava imediatamente a saída, que o cronômetro não avança durante pausa e que a criatura consegue se aproximar antes da fuga.
- Revisar FPS e consumo de memória em aparelho real. Se cair demais, reduzir geometria e luzes, nunca eliminar o desenho do cenário.
- Testar multiplayer em aparelhos reais **antes** de anunciá-lo como disponível neste motor.

## Situação atual

A Ala 03 é um laboratório isolado. Os testes automatizados cobrem lógica, geometria, cena simulada e física WASM no GitHub Actions. Renderização WebGL, controle e desempenho em telefones físicos ainda não foram auditados completamente.
