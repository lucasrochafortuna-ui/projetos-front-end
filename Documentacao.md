# Documentação técnica — Portfólio

## Sumário

1. [Diagnóstico de cinco problemas](#1-diagnóstico-de-cinco-problemas)
2. [Evidências de antes e depois](#2-evidências-de-antes-e-depois)
3. [Refatoração](#3-refatoração)
4. [Como o contato funciona](#4-como-o-contato-funciona)
5. [Matriz de testes](#5-matriz-de-testes)
6. [Revisão cruzada](#6-revisão-cruzada)
7. [Limitações conhecidas](#7-limitações-conhecidas)
8. [Decisões de implementação](#8-decisões-de-implementação)

---

## 1. Diagnóstico de cinco problemas

### Problema 1 — Link quebrado no projeto "Meu primeiro site" (Funcional)

- **Local:** `Script.js`, constante `PROJETOS_PADRAO`, projeto de `id: 1`, campo `link`.
- **Passos para reproduzir:** abrir a seção Projetos, localizar o card "Meu primeiro site" e clicar em "Ver no GitHub".
- **Comportamento atual (antes):** abria `.../NOME-DO-REPOSITORIO` e retornava erro 404. O botão aparecia porque `linkGithubValido` só confere `https` e `github.com`, não a existência do repositório.
- **Comportamento esperado:** abrir o projeto no GitHub.
- **Prioridade:** Alta. É a principal prova do trabalho e o visitante cai em uma página de erro.
- **Correção:** o link foi trocado pelo endereço real do projeto no repositório `projetos-front-end`.

### Problema 2 — Rodapé e links ilegíveis no tema escuro (Acessibilidade)

- **Local:** `Style.css`, regras de `body.escuro`, `.extra` (rodapé), links da `.nota`, `.erro` e `.status`.
- **Passos para reproduzir:** clicar em "Tema escuro" e rolar até Contato e rodapé.
- **Comportamento atual (antes):** o `body.escuro` define texto claro (`#e6e6e6`), mas o rodapé mantinha fundo `lightgray`, resultando em contraste de cerca de 1,2:1. Os links ficavam no azul padrão sobre fundo escuro (cerca de 1,6:1) e as mensagens de erro em `crimson` ficavam perto de 3:1. O mínimo WCAG AA é 4,5:1.
- **Comportamento esperado:** contraste de pelo menos 4,5:1 em todos os textos.
- **Prioridade:** Alta. Quem usa o tema escuro não consegue ler o rodapé nem os canais de contato.
- **Correção:** fundo escuro no `.extra`, cores claras para links, erros e status no tema escuro.

### Problema 3 — Aviso do formulário contradizia o comportamento (Conteúdo)

- **Local:** `index.html`, parágrafo `.nota` da seção Contato, e o `submit` do formulário em `Script.js`.
- **Passos para reproduzir:** preencher o formulário corretamente, enviar e ler a nota abaixo dele.
- **Comportamento atual (antes):** o formulário abria o WhatsApp com a mensagem pronta, mas a nota dizia que era uma demonstração e que nada era enviado. O visitante podia achar que não funcionava.
- **Comportamento esperado:** o texto descrever o que realmente acontece.
- **Prioridade:** Média. O formulário funciona, mas o texto afasta o visitante de um canal real.
- **Correção:** nota reescrita para explicar que o WhatsApp abre com a mensagem pronta e que só é enviada quando o visitante confirma lá. _(Se acrescentou "Nenhum e-mail é enviado", cite aqui.)_

### Problema 4 — Sem largura máxima nem margem lateral (Responsividade)

- **Local:** `Style.css`, `.cabecalho`, `main`, `.secao` e `.extra`.
- **Passos para reproduzir:** abrir a página em 1920 px e em 390 px (modo dispositivo do navegador).
- **Comportamento atual (antes):** em tela larga, cabeçalho e seções ocupavam toda a largura, com linhas de texto muito longas, e o botão "Mostrar mais" virava uma barra de cerca de 1.400 px. No celular, as caixas encostavam nas bordas da tela.
- **Comportamento esperado:** conteúdo centralizado, com largura máxima, respiro lateral e botão do tamanho do texto.
- **Prioridade:** Média. Prejudica a leitura em todos os tamanhos, mas nada fica inacessível.
- **Correção:** `width: min(100% - 32px, 1100px)` com `margin: auto` em `.cabecalho` e `main`, e `align-self: flex-start` no botão.

### Problema 5 — Classe `.erro` com dois usos e CSS sem uso (Organização do código)

- **Local:** `Style.css`, regra `.erro` e regras `.card aside`, `.titulo-centro`, `.info-extra` e `.destaque`.
- **Passos para reproduzir:** enviar o formulário de contato vazio e comparar o tamanho do texto de status ("Erro: ...") com o da mensagem de sucesso; procurar as classes sem uso no HTML e no JS.
- **Comportamento atual (antes):** o JS aplica `class="status erro"` ao parágrafo de status, que também recebia a regra `.erro`, feita para os `<span>` dos campos (fonte de 14 px e altura mínima menor). Além disso, quatro regras não eram usadas em lugar nenhum.
- **Comportamento esperado:** cada classe com um único papel e sem código morto.
- **Prioridade:** Baixa. O visitante quase não percebe, mas gera bugs de estilo e dificulta a manutenção.
- **Correção:** a regra foi restrita a `span.erro` e as regras sem uso foram removidas.

### Ordem de trabalho e justificativa

1. **Link quebrado** (Alta): erro direto na principal prova do trabalho.
2. **Tema escuro ilegível** (Alta): impede a leitura de quem escolhe esse tema.
3. **Aviso do formulário** (Média): atrapalha o uso de um canal de contato real.
4. **Largura e margens** (Média): afeta o conforto de leitura, mas não bloqueia o uso.
5. **CSS duplicado** (Baixa): impacto interno, quase invisível ao visitante.

---

## 2. Refatoração

### 2.1 Envio do formulário de contato (principal)

- **Problema anterior:** um único `submit` fazia tudo: ler os campos, validar, mostrar erros, montar o texto, criar o link com o número escrito no meio do código, abrir o WhatsApp e limpar o formulário. Para testar o texto da mensagem era preciso preencher o formulário inteiro.
- **Mudança:** separei em funções com uma responsabilidade cada: `lerDadosContato` (leitura e normalização), `montarMensagemWhatsApp` (monta o texto, função pura), `criarUrlWhatsApp` (codifica e cria o link), `mostrarFalhaDeValidacao` (apresentação de erros) e `finalizarEnvio` (estado final). O número foi para a constante `NUMERO_WHATSAPP`. O `submit` agora só orquestra.
- **Por que facilita:** `montarMensagemWhatsApp` pode ser testada no Console com um objeto qualquer, sem abrir o WhatsApp. O formato da mensagem e o número mudam em um só lugar.

----

## 3. Como o contato funciona

### Regras dos campos

| Campo | Regra | Onde está |
|---|---|---|
| Nome | obrigatório, 3 a 80 caracteres após `trim()`, sem restrição de letras | `camposContato` (`regra`) |
| E-mail | obrigatório, `type="email"`, formato verificado por `validity.typeMismatch` | `camposContato` |
| Motivo | seleção obrigatória; a opção inicial tem valor vazio e não conta | `camposContato` |
| Assunto adicional | só aparece e é obrigatório quando o motivo é "Outro"; 5 a 100 caracteres após `trim()` | `atualizarAssunto` e `ativo` |
| Mensagem | obrigatória, 30 a 1000 caracteres após `trim()`, com contador | `atualizarContadorMensagem` |

### Leitura e normalização

A função `ler` aplica `trim()` apenas nas pontas. O conteúdo interno da mensagem não é alterado.

### Critério de contagem

`contar(texto)` usa `[...texto].length`, ou seja, conta **pontos de código** do texto já sem as pontas.
O mesmo `contar` é usado no contador e na regra de tamanho, então os dois sempre concordam.
Escolhi esse critério porque caracteres como emojis ocupam duas unidades em `string.length`, mas são um
caractere para quem digita.
_(Sobre o `maxlength` do HTML: ele limita a digitação por unidades UTF-16 e pode divergir em emojis. Escreva aqui se
você o manteve como barreira extra ou o removeu, e por quê.)_

### Validação

- O formulário usa `novalidate`: o navegador não mostra os balões nativos e a verificação é feita explicitamente no `submit`, com `preventDefault()`.
- As restrições nativas continuam no HTML (`required`, `minlength`, `maxlength`, `type="email"`) para dar semântica e ajudar tecnologias assistivas. A regra oficial é a do JavaScript, e o e-mail aproveita `validity.typeMismatch`.
- `setCustomValidity(mensagem)` registra o erro e `setCustomValidity("")` o remove quando o valor é corrigido.
- Formato válido de e-mail **não prova** que a conta existe.

### Campo condicional

Ao trocar o motivo, `atualizarAssunto` mostra ou oculta o assunto, o desabilita, limpa o valor, a mensagem de erro e o `aria-invalid`.
Fora de "Outro", o assunto não bloqueia a validação nem entra nos dados enviados (`lerDadosContato` devolve texto vazio).

### Erros

- Mensagem de erro ao lado de cada campo, ligada por `aria-describedby`, e `aria-invalid` no campo.
- Resumo textual dos problemas ao tentar enviar, e foco levado ao primeiro campo inválido.
- Nada é validado ao carregar a página: o campo é validado depois de usado (`blur`) ou depois da primeira tentativa de envio, e o erro some quando o valor passa a atender às regras.

### Envio

Com tudo válido, o JavaScript monta a mensagem e abre `https://wa.me/<número>?text=<mensagem codificada>` em nova aba.
**Nenhum e-mail é enviado.** A mensagem só segue quando a pessoa confirma no WhatsApp.
Canais alternativos: LinkedIn e GitHub. O número fica na constante `NUMERO_WHATSAPP`.


## 4. Limitações conhecidas

- O formulário **não envia e-mail** e a página não sabe se a mensagem foi enviada: ela só sai quando a pessoa confirma dentro do WhatsApp. Por isso não há estados de processamento e falha demonstráveis, e os casos T08 e T09 não são atendidos.
- Cada clique válido em "Enviar mensagem" abre uma nova aba do WhatsApp (não há bloqueio de cliques repetidos).
- Após o envio, os valores continuam no formulário (só os erros são limpos). Foi uma decisão de experiência: _(explique)_.
- O painel de administrador guarda alterações só no navegador (`localStorage`) e usa um hash de senha no JavaScript. É uma proteção apenas visual: **não é segurança real**, e a validação no navegador não substitui a de um servidor.
- Uma cópia local do painel pode ter prioridade sobre a lista publicada no navegador onde foi usada; o botão "Voltar à lista publicada" restaura a lista do código.
- Navegadores e tamanhos testados: _(liste)_.

---

## 5. Decisões de implementação

- Categorias definidas uma única vez (`CATEGORIAS`) e usadas para gerar os botões de filtro e o `<select>` do painel.
- Cards gerados a partir de dados (`PROJETOS_PADRAO`), com texto inserido via `textContent`, nunca como HTML.
- Link de projeto aceito somente se for `https` e do domínio `github.com`.
- Menu móvel controlado por `definirMenu`, refletindo o estado em `aria-expanded`.
- Animações com `prefers-reduced-motion` respeitado em CSS e sem `behavior: "smooth"` explícito no JavaScript.
- Cores de foco e de estado escolhidas para manter contraste mínimo de 3:1 (foco) e 4,5:1 (texto).
