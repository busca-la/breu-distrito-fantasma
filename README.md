# BREU — Distrito Fantasma

Protótipo experimental de terror 3D cooperativo, jogável diretamente no navegador. Ambientado dentro de um shopping futurista abandonado, com corredores claustrofóbicos, lojas deterioradas, letreiros falhando e zonas técnicas.

## Jogar

https://breu-distrito-fantasma.vercel.app

## Versão 0.5 — revisão visual

- Letreiros e placas únicas para setores e lojas, produzidos por atlas gráfico procedural em Canvas e renderizados em WebGL2.
- Fachadas comerciais distintas, cartazes rasgados, dutos, vidros e peças abandonadas.
- Galerias com divisórias diagonais, estreitamentos e entradas de lojas parcialmente abertas.
- Iluminação por zonas (âmbar, verde-fosco, azul frio e vermelho de emergência), neblina densa e materiais desgastados.
- Ajustes do texto inicial e telas móveis; pulo, lanterna, alarme, perseguição e fuga preservados.

## Testes

- Inicialização e renderização em Chromium com WebGL2 (ambiente local).
- Início da partida, salto, colisões pontuais, interface móvel 390×844, ausência de exceções JavaScript.
- Verificação automatizada de conectividade do mapa via grade 0,5 m da entrada até a central de segurança e da central até a saída.

## Limitações

O jogo ainda possui geometria procedural simples (não é fotorrealista), e o modo multiplayer WebRTC/PeerJS entre celulares reais ainda não foi validado ponta a ponta. Testes gráficos locais feitos em Chromium não substituem validação em Safari e aparelhos diferentes.

## Desenvolvimento

O projeto é estático: `index.html` com WebGL2, HTML, CSS e JavaScript; Vercel publica automaticamente os commits em `main`.
