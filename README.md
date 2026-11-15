# BREU — Distrito Fantasma

Protótipo de terror 3D no navegador, ambientado em um shopping futurista abandonado.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## Versão 0.7 — planta arquitetônica corrigida

Reorganização dos corredores para parecerem uma planta comercial compreensível, não um labirinto serpenteando sem motivo.

- Galeria principal norte–sul conectando entrada, átrio e acesso de serviço.
- Alas transversais com destinos claros: moda, fliperama, praça de alimentação, banheiros, segurança, arquivo, manutenção e doca.
- Cotovelos de 90° somente onde a arquitetura exige mudança de direção (ex.: acesso à doca).
- Mezanino com circulação principal e ramificações para cinema, café, telefonia e depósito.
- Três conexões reais entre os dois pavimentos: escada de serviço, escada rolante e escada do depósito.
- HUD com nomes das galerias reais e sinalização ajustada aos novos cruzamentos.
- Colisão e navegação do jogador e da criatura preservadas. Missão: acionar o alarme na segurança e fugir pela doca.

## Validação

- Sintaxe JavaScript: **aprovada**.
- Grafo calculado com obstáculos físicos do cenário: **13 ambientes alcançáveis**, incluindo os quatro do mezanino.
- **Três** acessos verticais, segurança e doca acessíveis no teste de navegação.
- Renderização WebGL2 em dispositivo real e multiplayer entre celulares: **ainda não revalidados** nesta revisão. Navegador de testes local bloqueou a execução gráfica.

## Tecnologia

Projeto estático em um único `index.html` com JavaScript, WebGL2, HTML e CSS. Publicação automática pela Vercel ao atualizar a branch `main`.
