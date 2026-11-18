// ===== Tema claro/escuro =====
const btnTema = document.getElementById("btn-tema");
if (btnTema) {
    btnTema.addEventListener("click", () => {
        const escuro = document.body.classList.toggle("escuro");
        btnTema.setAttribute("aria-pressed", escuro);
        btnTema.textContent = escuro ? "Tema claro" : "Tema escuro";
    });
}

// ===== Mostrar mais / menos =====
const btnMostrar = document.getElementById("btn-mostrar");
const sobreExtra = document.getElementById("sobre-extra");
if (btnMostrar && sobreExtra) {
    btnMostrar.addEventListener("click", () => {
        const abrir = sobreExtra.hidden;
        sobreExtra.hidden = !abrir;
        btnMostrar.setAttribute("aria-expanded", abrir);
        btnMostrar.textContent = abrir ? "Mostrar menos" : "Mostrar mais";
    });
}

// ===== Menu Hambúrguer =====
const btnMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");

function definirMenu(aberto) {
    menu.classList.toggle("aberto", aberto);
    btnMenu.setAttribute("aria-expanded", aberto);
    btnMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    btnMenu.textContent = aberto ? "✕" : "☰";
}

if (btnMenu && menu) {
    btnMenu.addEventListener("click", () => definirMenu(!menu.classList.contains("aberto")));
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) definirMenu(false);
    });
}

// ===== Projetos: dados, área pública e painel admin =====
const CATEGORIAS = { html: "HTML", frontend: "Front-End", backend: "Back-End" };

// Lista PUBLICADA: é o que todos os visitantes veem.
// Para publicar mudanças, cole aqui o JSON exportado pelo painel e faça commit.
const PROJETOS_PADRAO = [
    { id: 1, titulo: "Meu primeiro site", categoria: "html",
        descricao: "Projeto criado para praticar estrutura HTML e organização de conteúdo.",
        link: "https://github.com/lucasrochafortuna-ui/projetos-front-end/tree/main/flamengo" },
    { id: 2, titulo: "Portfólio pessoal", categoria: "frontend",
        descricao: "Projeto para apresentar meus conhecimentos em HTML, CSS e JavaScript.",
        link: "https://github.com/lucasrochafortuna-ui/projetos-front-end" },
];

const CHAVE_LOCAL = "projetos-admin";
const HASH_ADMIN = "33aa1136af825f78230e03537b4ba0eecb4d79b9427e1ebfdc17c3d04d53d052";   // nunca a senha em si

const lista = document.getElementById("lista-projetos");
const contador = document.getElementById("contador");
const filtros = document.getElementById("filtros");
const secaoAdmin = document.getElementById("admin");
const listaAdmin = document.getElementById("lista-admin");
const statusAdmin = document.getElementById("status-admin");
const btnAdmin = document.getElementById("btn-admin");

let filtroAtual = "todos";
let admin = sessionStorage.getItem("admin") === "1";

function linkGithubValido(v) {
    try {
        const u = new URL(v.trim());
        return u.protocol === "https:" && u.hostname === "github.com";
    } catch {
        return false;
    }
}

function carregarProjetos() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_LOCAL));
        if (Array.isArray(salvo)) return salvo;
    } catch { /* usa a lista publicada */ }
    return structuredClone(PROJETOS_PADRAO);
}
let projetos = carregarProjetos();

function salvarProjetos() {
    try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(projetos)); } catch { /* sem storage */ }
}

// ---------- Área pública ----------
function criarCard(p) {
    const card = document.createElement("article");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = p.titulo;                       
    const desc = document.createElement("p");
    desc.textContent = p.descricao;
    const cat = document.createElement("p");
    cat.textContent = `Categoria: ${CATEGORIAS[p.categoria] ?? p.categoria}`;
    card.append(h3, desc, cat);

    if (linkGithubValido(p.link)) {
        const a = document.createElement("a");
        a.className = "botao";
        a.href = p.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Ver no GitHub";
        a.setAttribute("aria-label", `Ver o projeto ${p.titulo} no GitHub (abre em nova aba)`);
        card.append(a);
    }
    return card;
}

function renderizarPublico() {
    const visiveis = projetos.filter((p) => filtroAtual === "todos" || p.categoria === filtroAtual);
    lista.replaceChildren(...visiveis.map(criarCard));
    if (visiveis.length) {
    contador.textContent = `Projetos visíveis: ${visiveis.length}`;
    } else if (filtroAtual === "todos") {
    contador.textContent = "Nenhum projeto cadastrado ainda.";
    } else {
    contador.textContent = `Nenhum projeto em ${CATEGORIAS[filtroAtual]} por enquanto. Escolha "Todos" para ver os outros projetos.`;
    }
}

filtros.addEventListener("click", (e) => {
    const botao = e.target.closest("button[data-filtro]");
    if (!botao) return;
    filtroAtual = botao.dataset.filtro;
    filtros.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === botao));
    renderizarPublico();
});

// ---------- Painel admin ----------
function renderizarAdmin() {
    listaAdmin.replaceChildren(...projetos.map((p) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = `${p.titulo} (${CATEGORIAS[p.categoria] ?? p.categoria})`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-remover";
        btn.dataset.id = p.id;
        btn.textContent = "Remover";
        btn.setAttribute("aria-label", `Remover ${p.titulo}`);
        li.append(span, btn);
        return li;
    }));
}

function renderizar() {
    renderizarPublico();
    renderizarAdmin();
}

listaAdmin.addEventListener("click", (e) => {
    const botao = e.target.closest(".btn-remover");
    if (!botao || !admin) return;
    const id = Number(botao.dataset.id);
    const projeto = projetos.find((p) => p.id === id);
    if (!projeto || !confirm(`Remover "${projeto.titulo}"?`)) return;
    projetos = projetos.filter((p) => p.id !== id);
    salvarProjetos();
    renderizar();
    statusAdmin.textContent = `Projeto "${projeto.titulo}" removido (só nesta cópia local).`;
});

// ===========Cadastro validado=============
const form = document.getElementById("form-projeto");
const campos = [
    { el: document.getElementById("p-titulo"), erro: "erro-titulo",
        valida: (v) => v.trim().length >= 3, msg: "Informe um título com pelo menos 3 caracteres." },
    { el: document.getElementById("p-categoria"), erro: "erro-categoria",
        valida: (v) => v in CATEGORIAS, msg: "Escolha uma categoria." },
    { el: document.getElementById("p-desc"), erro: "erro-desc",
        valida: (v) => v.trim().length >= 10, msg: "A descrição precisa de pelo menos 10 caracteres." },
    { el: document.getElementById("p-link"), erro: "erro-link",
        valida: linkGithubValido, msg: "Informe um link https://github.com/... válido." },
];

function validarCampo(c) {
    const ok = c.valida(c.el.value);
    document.getElementById(c.erro).textContent = ok ? "" : c.msg;
    c.el.classList.toggle("invalido", !ok);
    c.el.setAttribute("aria-invalid", !ok);
    return ok;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!admin) return;
    const resultados = campos.map(validarCampo);
    const primeiro = campos.find((c, i) => !resultados[i]);
    if (primeiro) { primeiro.el.focus(); return; }

    projetos.push({
        id: Date.now(),
        titulo: campos[0].el.value.trim(),
        categoria: campos[1].el.value,
        descricao: campos[2].el.value.trim(),
        link: campos[3].el.value.trim(),
    });
    salvarProjetos();
    form.reset();
    renderizar();
    statusAdmin.textContent = "Projeto adicionado nesta cópia local. Use 'Copiar JSON' para publicar.";
});

document.getElementById("btn-exportar").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(projetos, null, 4));
        statusAdmin.textContent = "JSON copiado. Cole em PROJETOS_PADRAO no Script.js e faça commit.";
    } catch {
        statusAdmin.textContent = "Não consegui copiar. Rode JSON.stringify(projetos, null, 4) no Console.";
    }
});

document.getElementById("btn-resetar").addEventListener("click", () => {
    if (!confirm("Descartar a cópia local e voltar à lista publicada?")) return;
    localStorage.removeItem(CHAVE_LOCAL);
    projetos = structuredClone(PROJETOS_PADRAO);
    renderizar();
    statusAdmin.textContent = "Lista publicada restaurada.";
});

// ---------- Login do administrador ----------
const dlgLogin = document.getElementById("dlg-login");
const formLogin = document.getElementById("form-login");
const campoSenha = document.getElementById("l-senha");
const erroLogin = document.getElementById("erro-login");

async function sha256(texto) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function aplicarModoAdmin() {
    secaoAdmin.hidden = !admin;
    btnAdmin.textContent = admin ? "Sair do modo admin" : "Entrar como admin";
}

btnAdmin.addEventListener("click", () => {
    if (admin) {
        admin = false;
        sessionStorage.removeItem("admin");
        aplicarModoAdmin();
    } else {
        dlgLogin.showModal();
        campoSenha.focus();
    }
});

document.getElementById("btn-cancelar-login").addEventListener("click", () => dlgLogin.close());
dlgLogin.addEventListener("close", () => { formLogin.reset(); erroLogin.textContent = ""; });

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    if ((await sha256(campoSenha.value)) === HASH_ADMIN) {
        admin = true;
        sessionStorage.setItem("admin", "1");
        dlgLogin.close();
        aplicarModoAdmin();
        secaoAdmin.scrollIntoView();
    } else {
        erroLogin.textContent = "Senha incorreta.";
        campoSenha.value = "";
        campoSenha.focus();
    }
});
function montarCategorias() {
    const opcoes = [["todos", "Todos"], ...Object.entries(CATEGORIAS)];
    filtros.replaceChildren(...opcoes.map(([valor, rotulo]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.filtro = valor;
        b.textContent = rotulo;
        b.setAttribute("aria-pressed", valor === filtroAtual);
        return b;
    }));
    document.getElementById("p-categoria").replaceChildren(
        new Option("Selecione...", ""),
        ...Object.entries(CATEGORIAS).map(([v, r]) => new Option(r, v))
    );
}
montarCategorias();

aplicarModoAdmin();
renderizar();

// ===== Formulário de contato =====
const formContato = document.getElementById("form-contato");

if (formContato) {
    const cNome = document.getElementById("c-nome");
    const cEmail = document.getElementById("c-email");
    const cMotivo = document.getElementById("c-motivo");
    const cAssunto = document.getElementById("c-assunto");
    const cMensagem = document.getElementById("c-mensagem");
    const grupoAssunto = document.getElementById("grupo-assunto");
    const contadorMsg = document.getElementById("contador-msg");
    const statusContato = document.getElementById("status-contato");
    const resumo = document.getElementById("resumo-erros");
    const btnEnviar = document.getElementById("btn-enviar");

    const MSG_MIN = 30;
    const MSG_MAX = 1000;
    const NUMERO_WHATSAPP = "5571981514561";

    const ler = (el) => el ? el.value.trim() : "";
    const contar = (texto) => [...texto].length;
    const entre = (v, min, max) => contar(v) >= min && contar(v) <= max;

    let estado = "edicao";
    let tentouEnviar = false;

    function definirEstado(novo, texto = "") {
        estado = novo;
        formContato.dataset.estado = novo;
        const ocupado = novo === "processando";
        if (btnEnviar) btnEnviar.disabled = ocupado;
        formContato.setAttribute("aria-busy", ocupado);
        if (statusContato) {
            statusContato.textContent = texto;
            statusContato.className = "status " + novo;
        }
    }

    const camposContato = [
        { el: cNome, rotulo: "Nome", erro: "erro-c-nome",
        regra: () => entre(ler(cNome), 3, 80) ? "" : "Informe um nome de 3 a 80 caracteres." },
        { el: cEmail, rotulo: "E-mail", erro: "erro-c-email",
        regra: () => !ler(cEmail) ? "Informe seu e-mail."
                    : (cEmail && cEmail.validity.typeMismatch) ? "Use um e-mail no formato nome@dominio.com." : "" },
        { el: cMotivo, rotulo: "Motivo do contato", erro: "erro-c-motivo",
        regra: () => (cMotivo && cMotivo.value) ? "" : "Selecione um motivo de contato." },
        { el: cAssunto, rotulo: "Assunto adicional", erro: "erro-c-assunto",
        ativo: () => cMotivo && cMotivo.value === "outro",
        regra: () => entre(ler(cAssunto), 5, 100) ? "" : "Informe um assunto de 5 a 100 caracteres." },
        { el: cMensagem, rotulo: "Mensagem", erro: "erro-c-mensagem",
        regra: () => entre(ler(cMensagem), MSG_MIN, MSG_MAX)
            ? "" : `A mensagem deve ter de ${MSG_MIN} a ${MSG_MAX} caracteres.` },
    ];

    function erroDe(c) {
        if (c.ativo && !c.ativo()) return "";
        return c.regra();
    }

    function mostrarErro(c, msg) {
        const elErro = document.getElementById(c.erro);
        if (elErro) elErro.textContent = msg;
        if (c.el) {
            c.el.classList.toggle("invalido", msg !== "");
            c.el.setAttribute("aria-invalid", msg !== "");
            c.el.setCustomValidity(msg);
        }
    }

    function validarContato(c) {
        const msg = erroDe(c);
        mostrarErro(c, msg);
        return msg === "";
    }

    function limparCampo(c) {
        mostrarErro(c, "");
        c.tocado = false;
    }

    function atualizarResumo() {
        if (!resumo) return;
        const erros = camposContato
            .map((c) => ({ c, msg: erroDe(c) }))
            .filter((x) => x.msg);

        resumo.replaceChildren();
        if (!erros.length) { resumo.hidden = true; return; }

        const p = document.createElement("p");
        p.textContent = `Corrija ${erros.length} ${erros.length === 1 ? "campo" : "campos"} antes de enviar:`;
        const ul = document.createElement("ul");
        erros.forEach(({ c, msg }) => {
            const li = document.createElement("li");
            li.textContent = `${c.rotulo}: ${msg}`;
            ul.append(li);
        });
        resumo.append(p, ul);
        resumo.hidden = false;
    }

    function atualizarAssunto() {
        if (!cMotivo || !grupoAssunto || !cAssunto) return;
        const outro = cMotivo.value === "outro";
        grupoAssunto.hidden = !outro;
        cAssunto.disabled = !outro;
        if (!outro) {
            cAssunto.value = "";
            const campo = camposContato.find((c) => c.el === cAssunto);
            if (campo) limparCampo(campo);
        }
    }

    function atualizarContadorMensagem() {
        if (contadorMsg && cMensagem) {
            contadorMsg.textContent = `${contar(ler(cMensagem))} / ${MSG_MAX} (mínimo ${MSG_MIN})`;
        }
    }

    if (cMotivo) {
        cMotivo.addEventListener("change", () => {
            atualizarAssunto();
            if (tentouEnviar) atualizarResumo();
        });
    }

    if (cMensagem) {
        cMensagem.addEventListener("input", atualizarContadorMensagem);
    }

    camposContato.forEach((c) => {
        if (c.el) {
            c.el.addEventListener("input", () => {
                c.tocado = true;
                if (estado !== "processando" && estado !== "edicao") definirEstado("edicao");
                if (tentouEnviar || c.el.classList.contains("invalido")) validarContato(c);
                if (tentouEnviar) atualizarResumo();
            });
            c.el.addEventListener("blur", () => {
                if (c.tocado || tentouEnviar) validarContato(c);
            });
        }
    });
    function lerDadosContato() {
    return {
        nome: ler(cNome),
        email: ler(cEmail),
        motivo: cMotivo.options[cMotivo.selectedIndex].text,
        assunto: cMotivo.value === "outro" ? ler(cAssunto) : "",
        mensagem: ler(cMensagem),
    };
}

function criarUrlWhatsApp(texto) {
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

function mostrarFalhaDeValidacao(primeiroInvalido) {
    atualizarResumo();
    definirEstado("erro", "Erro: o formulário tem campos para corrigir.");
    primeiroInvalido.el.focus();
}

function finalizarEnvio() {
    definirEstado("sucesso", "WhatsApp aberto com a mensagem pronta. Ela só é enviada quando você confirmar no WhatsApp");
    camposContato.forEach(limparCampo);
    tentouEnviar = false;
    atualizarAssunto();
    atualizarContadorMensagem();
}

function montarMensagemWhatsApp({ nome, email, motivo, assunto, mensagem }) {
    return [
        "*Novo contato pelo Portfólio!*",
        "",
        `👤 *Nome:* ${nome}`,
        `✉️ *E-mail:* ${email}`,
        `📌 *Motivo:* ${motivo}`,
        ...(assunto ? [`🏷️ *Assunto:* ${assunto}`] : []),
        `💬 *Mensagem:* ${mensagem}`,
    ].join("\n");
}

formContato.addEventListener("submit", (e) => {
    e.preventDefault();
    tentouEnviar = true;

    const resultados = camposContato.map(validarContato);
    const primeiroInvalido = camposContato.find((_, i) => !resultados[i]);
    if (primeiroInvalido) { mostrarFalhaDeValidacao(primeiroInvalido); return; }

    resumo.hidden = true;
    const janela = window.open(criarUrlWhatsApp(montarMensagemWhatsApp(lerDadosContato())), "_blank");
    if (janela) janela.opener = null;
    finalizarEnvio();
});
        atualizarAssunto();
        atualizarContadorMensagem();
}
// ===== Animação ao rolar =====
const elementosRevelar = document.querySelectorAll(".secao, .extra");
elementosRevelar.forEach((el) => el.classList.add("revelar"));

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target); // anima só uma vez
        }
    });
}, { threshold: 0.1 });

elementosRevelar.forEach((el) => observador.observe(el));