# BREU — Distrito Fantasma

Jogo experimental de terror 3D, em WebGL2, ambientado dentro de um shopping abandonado. O projeto roda no navegador.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## Correção estrutural — v0.8

- **Vãos reais nas três escadas**: pisos superiores e forros inferiores são repartidos em painéis; os painéis que cobririam os acessos verticais não são gerados.
- **Teto com colisão vertical**: a altura do jogador e o salto são limitados pela superfície física do pavimento, com pé-direito distinto nos banheiros e salas.
- **Galerias com teto contínuo**: os antigos segmentos esporádicos de forro deixam de mostrar o vazio acima dos corredores.
- **Fechamento de segurança do mapa**: paredes externas e cobertura secundária oculta impedem visão direta do espaço infinito através das falhas nas juntas.
- **Navegação preservada**: todos os 13 ambientes, a sala de segurança, a doca e as três escadas continuam acessíveis.

## Testes

Executar `node tests/geometry.test.cjs` para validar vãos das escadas, teto, limites e conectividade do mapa, sem dependências de build.

Testes locais complementares com Chromium + WebGL2 de software cobriram início da partida, geração da geometria, as três subidas e descidas, colisão externa e interface móvel 390×844. O modo online entre celulares reais continua sem validação de ponta a ponta. O acabamento visual ainda é de protótipo, não fotorrealista.

## Controles

No computador: WASD para andar, Shift para correr, Espaço para pular, E para interagir, F para lanterna, M para mapa. No celular: comandos na tela.

## Publicação

O Vercel está conectado à branch `main` deste repositório. Cada commit aceito faz novo deploy da versão estática.