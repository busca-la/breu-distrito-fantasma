# BREU — Distrito Fantasma

Jogo experimental de terror 3D no navegador, ambientado em um shopping abandonado de dois pavimentos. O código roda como página HTML estática com WebGL2, sem aplicativo nem serviços pagos.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## Versão 0.9 — auditoria estrutural e de jogabilidade

A versão anterior escondia problemas que não eram detectados apenas por verificar a conectividade superficial do mapa. A revisão atua na **causa física e visual**, não somente na decoração.

- **Acesso aos banheiros** desviado da caixa da escada de serviço: agora há uma circulação própria, fora do vão das escadas.
- **Escadas desobstruídas**: objetos e mesas não são gerados sobre os degraus e patamares.
- **Navegação corrigida**: o grafo de caminhos verifica amostras ao longo de cada ligação, incluindo a largura do corpo e altura do teto; a criatura não recebe mais variáveis do salto do jogador.
- **Colisão aprimorada**: nove pontos no perímetro do corpo, verificação de teto, móveis e mudanças de nível; estado físico independente entre jogador, monstro e colegas conectados.
- **Geometria fechada**: vãos menores na cobertura selados sem cobrir os acessos das escadas; fundo físico sob o mapa e paredes de perímetro contínuas, em vez de centenas de cubinhos.
- **Pisos alinhados** com a altura física, faces do piso superior orientadas para cima e material apropriado também no segundo pavimento.
- **Menos trabalho no celular**: atualizações de HUD e minimapa limitadas, junção de trechos de paredes em painéis contínuos e PeerJS carregado somente quando se acessa o multiplayer.

## Verificação automática

Requer somente Node.js, sem pacotes externos:

```bash
npm test
```

Os testes de geometria e movimentação avaliam:

- 13 ambientes, três escadas, conexões e colisão de corpo;
- amostragem da cobertura de teto em ambos os andares;
- obstáculos nas rotas de navegação e acesso aos objetivos;
- travessia real da malha por passos, do spawn a todos os ambientes;
- perseguição da criatura do térreo ao mezanino;
- mapa fora dos limites, independência da colisão de personagem/monstro.

## Limitações ainda abertas

Este é um **protótipo procedural**, não um jogo 3D com acabamento artístico definitivo. Não foi possível garantir a ausência de falhas visuais em todos os ângulos nem medir FPS em celulares reais. A conexão WebRTC de quatro jogadores ainda **não foi testada ponta a ponta em telefones diferentes**. O modo online depende de um serviço externo de sinalização (PeerJS), portanto não há garantia de disponibilidade permanente.

## Controles

PC: WASD, Shift, Espaço (pular), E (interagir), F (lanterna), Tab/M (mapa). Celular: direcional, arrastar para olhar, botões PULAR, USAR, CORRER, LUZ e MAPA.

## Publicação

O Vercel está ligado à branch `main`; cada alteração aprovada nessa branch dispara uma publicação. Código principal: `index.html`.