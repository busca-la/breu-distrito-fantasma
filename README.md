# BREU — Distrito Fantasma

Jogo experimental de terror 3D em navegador ambientado em um shopping futurista abandonado, com dois andares e multiplayer experimental.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## Art pass v1.0 (experimental)

A estrutura continua a mesma; a revisão trabalha na aparência especialmente das galerias de entrada e serviço:

- Fachadas com lojas diferentes, vitrines com profundidade, persianas metálicas deterioradas e molduras.
- Lâmpadas de teto, dutos, tubulação, fiação suspensa, grelhas de drenagem e estruturas abandonadas.
- Máquinas de venda, carrinho de compras, balcão e outros objetos com colisão onde necessário.
- Luzes fracas de temperatura variada que piscam irregularmente em locais diferentes.

O mapa mantém as 13 salas, banheiros, praça de alimentação, galeria, cinema e três acessos ao segundo andar. Objetivo: acionar o alarme na sala de segurança e fugir pela doca.

## Validação e limitações

- Sintaxe JavaScript: aprovada.
- Geometria e conectividade entre ambientes: aprovada no teste automático local.
- Movimento físico do jogador até todos os ambientes e objetivos: aprovado.
- Perseguição entre andares: aprovada em teste local.
- **Renderização WebGL2 e qualidade visual da revisão:** não verificadas neste ambiente, pois o Chromium utilizado não disponibilizou WebGL2.
- **Multiplayer real em dois celulares:** ainda não verificado.
- A arte é procedural de baixo custo; as outras áreas ainda precisam de acabamento. **Esta versão não é um jogo visualmente finalizado.**

## Tecnologia

Página HTML + JavaScript com WebGL2, sem instalar aplicativo. O Vercel publica automaticamente commits na branch `main`.
