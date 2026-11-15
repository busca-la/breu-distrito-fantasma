# BREU — Ala 03 / novo motor 3D

**Prévia isolada** do jogo BREU, no mesmo repositório. A versão principal na raiz não é substituída por esta experiência.

## Acessar

Após deploy: `https://breu-distrito-fantasma.vercel.app/laboratorio/`

## O que existe nesta entrega

- Um único setor de shopping inspirado em galerias japonesas de serviços, com corredor, bifurcação e escritório de segurança.
- Sete fachadas comerciais diferentes, duas lojas acessíveis, piso cerâmico danificado, teto acústico, fios, dutos, letreiros e objetos distribuídos por função.
- Three.js (WebGL2) com fog, materiais PBR, luzes localizadas e texturas procedurais geradas em Canvas.
- Física Rapier WASM em 60 Hz, personagem com cápsula dinâmica, gravidade, salto, paredes e objetos físicos, com detecção contínua de colisão.
- Missão: entrar na sala de segurança, ativar o alarme e atravessar a porta de saída de incêndio para escapar.
- Controles no computador (WASD, mouse, Shift, Espaço, E, F) e no celular (joystick, câmera por toque, pulo, interação).

## Rodar testes

Na pasta `laboratorio/`:

```bash
npm install --no-audit --no-fund
npm test
npm run test:physics
```

`npm test` examina a arquitetura e geometria sem rede. `npm run test:physics` executa a simulação **real** de Rapier com WebAssembly (exige instalar a dependência gratuita). O GitHub Actions também executa as verificações de instalação e física.

## Limitações verificadas e pendentes

- **Aprovado localmente:** sintaxe JS, planta, vedação, cobertura, diversidade de lojas, rota principal e pontos de interação.
- **Pendente neste ambiente:** renderização/controles em navegador real com carregamento de bibliotecas externas (acesso externo bloqueado no Chromium usado); a publicação será um protótipo a validar em celular e PC.
- **Multiplayer:** esta ala é individual. O multiplayer do BREU antigo não foi migrado, não deve ser apresentado como funcional na nova versão.
- **Assets:** geometria e materiais gerados em Three.js. Nenhum modelo foi produzido ou exportado pelo Blender nesta etapa.

## Arquitetura

- `layout.mjs`: planta única, colisores e itens físicos declarados.
- `level.mjs`: rendering dos mesmos elementos, fachadas e texturas procedurais.
- `physics-world.mjs`: lógica Rapier independente da origem do pacote, testável em Node e navegador.
- `physics.mjs`: loader do pacote WASM para navegadores.
- `main.mjs`: controles, interface, câmera, objetivo e loop fixo.

Os arquivos do BREU tradicional no projeto raiz permanecem intocados.
