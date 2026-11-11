# Portfólio: Lucas Rocha Fortuna Silva

Portfólio pessoal em HTML, CSS e JavaScript, desenvolvido na disciplina Programação Front-End. Esta versão inclui a Parte final da atividade "Leve a interatividade ao seu portfólio".

## Como abrir

1. Baixe ou clone o projeto e extraia o ZIP, se for o caso.
2. Abra a pasta do portfólio.
3. Dê dois cliques em `index.html` para abrir no navegador. Não precisa de servidor nem instalação.

## Estrutura

```
portfolio/
├── index.html
├── Style.css
├── Script.js
└── Images/
    └── minha_foto.png
```


## Funcionalidades

- Alternância entre tema claro e escuro.
- Botão "Mostrar mais / Mostrar menos" na seção "Sobre mim" (`hidden` e `aria-expanded`).
- Filtro de projetos por categoria.
- Cadastro de novo projeto com validação de campos e mensagens de erro.
- Remoção de projetos por delegação de eventos.
- Contador de projetos visíveis e destaque dos cards da categoria filtrada (alteração de autoria).
- Navegação por teclado (Tab, Shift+Tab, Enter e Espaço) e foco visível.

## Limitação

Os dados ficam apenas na memória da página. Ao recarregar, os projetos cadastrados ou removidos voltam ao estado inicial. Não há servidor, banco de dados nem localStorage.

## Participantes

- Lucas Rocha Fortuna Silva

## Apoios e fontes

- Material e orientações da disciplina Programação Front-End.
- MDN Web Docs (referência de DOM, eventos e atributos ARIA).
- Claude (assistente de IA da Anthropic), usado como apoio para estruturar o código e os textos. O código foi revisado e testado por mim.
