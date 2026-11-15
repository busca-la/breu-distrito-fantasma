# BREU — Ala 03 | motor 3D experimental

Uma ala **separada** do BREU, mantida em `/laboratorio/` no repositório existente. A página principal em `/` não é alterada por este laboratório.

**Jogue:** https://breu-distrito-fantasma.vercel.app/laboratorio/

## Ala 03 — revisão artística, som e perseguição

A versão do laboratório evoluiu de uma estrutura simples de lojas para um setor mais elaborado, mantendo a mesma planta usada pelas colisões Rapier.

- **Identidade visual:** restaurante de lámen com cortina *noren* e exaustão, eletrônicos com monitores CRT, vitrines de moda deterioradas, fliperama, farmácia gradeada, máquinas de venda e escritório de segurança.
- **Materiais e arquitetura:** revestimentos de parede por área, ferrugem e rachaduras geradas proceduralmente, luminárias falhando, fiação pendente, acabamento de teto, sinalização e danos localizados.
- **Banheiros:** sala sanitária realmente explorável, com entrada larga, três cabines com divisórias físicas, lavatórios, espelho sujo e iluminação fria.
- **Passagem claustrofóbica:** corredor de manutenção com isolamento de obra em ambos os lados, deixando um vão estreito e transitável.
- **Conexão visual-física:** placas de sujeira e revestimento não cobrem passagens de lojas abertas; os sólidos continuam definidos exclusivamente no `layout.mjs` e são usados também pelo Rapier.
- **Criatura:** vigia abandonado com modelo procedural original e perseguição por uma malha derivada das colisões reais. Pode alcançar e encerrar a partida; movimento mais rápido após o alarme.
- **Ambientação sonora:** hum de ventilação, ruído elétrico, goteiras, passos e alarme sintetizados localmente pelo Web Audio. Sem gravações de terceiros, contas, custos ou serviços externos. Botão para desligar o som na pausa.
- **Desempenho:** instanciamento GPU de caixas repetidas e redução das luzes/detalhes nos aparelhos de toque; sombras da lanterna no desktop.
- **Pisos por setor:** entrada de porcelanato, galeria escurecida e doca de concreto desgastado, mantendo a mesma base de colisão.
- **Interface:** menu narrativo, modo paisagem e retrato com controles touch proporcionais.
- **Objetivo melhorado:** achar a segurança, disparar o alarme, sobreviver por 12 segundos enquanto o portão destrava e escapar da criatura. Sem caça a núcleos.

## Controles

- Computador: WASD / setas, mouse, Shift para correr, Espaço para pular, E para interagir, F para a lanterna, Esc para pausar.
- Celular: joystick, arrastar para olhar, PULAR, INTERAGIR e LANTERNA.

## Desenvolvimento e testes

```bash
cd laboratorio
npm install --no-audit --no-fund
npm run check
npm test
npm run test:physics
```

- `npm run check`: análise sintática de todos os módulos JS.
- `npm test`: planta, paredes, telhados, conexões de lojas, rotas reais de navegação, runtime do cenário em ambiente simulado, criatura e Web Audio.
- `npm run test:physics`: integração **real com Rapier WASM**, incluindo pulo, solo, portas e limites. Depende de `npm install` ou GitHub Actions.

## Limitações honestas

- A renderização real no celular físico, WebGL com bibliotecas CDN e FPS ainda precisam ser avaliados em dispositivos reais; os testes de runtime em Node usam objetos gráficos simulados, não fazem screenshots do WebGL.
- O inimigo usa pathfinding sobre geometria sólida, mas ainda é um personagem procedural simples, não um modelo esculpido em Blender.
- Esta ala é **solo experimental**. Multiplayer com amigos não foi migrado para o novo motor.
- O desempenho pode variar com CPU/GPU e com o navegador. O projeto não tem assets externos nem infraestrutura paga própria, mas depende do CDN de Three.js e do pacote WASM Rapier para carregar.

## Estrutura

- `layout.mjs` — planta, paredes, obstáculos, portas e portais.
- `physics-world.mjs` — colisões Rapier.
- `level.mjs` — construção 3D da ala.
- `detail-pass.mjs` — fachadas, materiais e detalhes distintos.
- `stalker.mjs` / `threat-nav.mjs` — criatura e malha de navegação.
- `ambient-audio.mjs` — trilha procedural de ambiente (original).
- `mission.mjs` — máquina de estados testada de alarme, destravamento temporizado e fuga.
- `main.mjs` — câmera, controles, fluxo de fuga, HUD e integração.
- `docs/art-direction.md` — critérios objetivos de acabamento, legibilidade e integração.

O jogo tradicional permanece publicado na raiz. Não foi alterado nesta versão.
