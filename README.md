# BREU — Distrito Fantasma

Jogo experimental de terror cooperativo em WebGL2 para navegador, ambientado dentro de um shopping futurista abandonado.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## v0.4

- Pulo com **Espaço** no computador e **PULAR** no celular; gravidade e possibilidade de superar obstáculos baixos.
- Colisão física de paredes, vitrines, balcões, portão de incêndio e limites do edifício; movimentação com varredura para evitar atravessar obstáculos.
- Shopping coberto e fechado, sem áreas abertas para o vazio do mapa.
- Lojas com fachadas, iluminação e sinalização distintas, desvios em zigue-zague e trecho com rampa.
- Missão de fuga: chegar à sala de segurança na galeria lateral, acionar o alarme, alcançar o portão de incêndio em até 150 segundos e escapar da criatura.
- Jogo solo e salas multiplayer experimentais com WebRTC/PeerJS, sem garantia de conectividade entre diferentes redes.

## Executar

Sirva `index.html` em qualquer hospedagem HTTPS estática compatível com WebGL2. Vercel conectada ao branch `main` publica automaticamente cada commit.

## Limitações

Protótipo gráfico de baixa complexidade; ainda não é um jogo fotorrealista ou totalmente aberto. Multiplayer entre celulares reais não foi validado com testes ponta a ponta.
