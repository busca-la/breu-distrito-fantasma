# BREU — Distrito Fantasma

Jogo experimental de terror 3D em navegador, ambientado em um shopping futurista japonês abandonado e claustrofóbico.

**Jogar:** https://breu-distrito-fantasma.vercel.app

## v0.6 — reforma da arquitetura do mapa

O cenário anterior de lojas repetidas foi substituído por **um mapa autoral de dois pavimentos**, composto por galerias sinuosas, bifurcações e ambientes diferentes.

- **Térreo:** portaria, praça de alimentação, banheiros com cabines, sala de segurança, fliperama, loja de roupas, área técnica, arquivos e doca de descarga.
- **Mezanino:** cinema fechado, café superior, laboratório de telefonia e depósito.
- **Conexões verticais jogáveis:** escada de serviço, escada rolante e escada do depósito, com mudança física de altura entre andares.
- Corredores projetados por curvas interpoladas (não apenas caixas padronizadas), salas com mobília própria, letreiros distintos, cabos, sujeira e iluminação por setor.
- Colisão fundamentada na planta do edifício, separada por pavimento e com obstáculos sólidos. Pulo no PC (Espaço) e celular (PULAR).
- Perseguição com navegação de criatura por malha discretizada, contemplando os dois andares.
- Missão: encontrar a sala de segurança, disparar o alarme e fugir pelo portão de incêndio na doca. **Sem coleta de núcleos.**

## Plataforma e controles

Tudo roda em `index.html` usando JavaScript, Canvas 2D para letreiros e WebGL2 para o mundo 3D. Não precisa instalar aplicativo. No PC use WASD, Shift para correr, Espaço para pular, F para lanterna, E para interagir e Tab/M para mapa. No celular use os controles na tela.

## Testes e limitações

- **Confirmado:** verificação de sintaxe JavaScript; inicialização e lógica simulada em navegador; 13 ambientes alcançáveis pela malha de navegação; três subidas até o segundo andar; pulo, barreiras físicas externas, acionamento do alarme e conclusão da fuga.
- **Pendente:** teste de **renderização WebGL2 real** neste ambiente (o navegador de teste não oferece contexto WebGL2; a lógica foi testada com contexto gráfico simulado), teste visual de FPS/qualidade em aparelhos reais e validação de multiplayer entre celulares.
- A arte é procedural de baixo custo; ainda não é fotorrealista. O modo com amigos usa WebRTC/PeerJS e depende do serviço de sinalização e da rede.

Repositório: [busca-la/breu-distrito-fantasma](https://github.com/busca-la/breu-distrito-fantasma).
