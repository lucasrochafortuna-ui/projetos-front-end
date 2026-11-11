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
const bntMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");

if (bntMenu && menu) {
    bntMenu.addEventListener("click", () => {
        const aberto = menu.classList.toggle("aberto");
        bntMenu.setAttribute("aria-expanded", aberto);
        bntMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        bntMenu.textContent = aberto ? "✕" : "☰";
    });

    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            menu.classList.remove("aberto");
            bntMenu.setAttribute("aria-expanded", "false");
            bntMenu.setAttribute("aria-label", "Abrir menu");
            bntMenu.textContent = "☰";
        }
    });
}

// ===== Projetos: contador, filtro, remoção =====
const lista = document.getElementById("lista-projetos");
const contadorProjetos = document.getElementById("contador");
const filtros = document.getElementById("filtros");

function atualizarContadorProjetos() {
    if (!lista || !contadorProjetos) return;
    const visiveis = lista.querySelectorAll(".card:not([hidden])").length;
    contadorProjetos.textContent = `Projetos visíveis: ${visiveis}`;
}

if (filtros) {
    filtros.addEventListener("click", (e) => {
        const botao = e.target.closest("button[data-filtro]");
        if (!botao) return;
        const filtro = botao.dataset.filtro;
        filtros.querySelectorAll("button").forEach((b) =>
            b.setAttribute("aria-pressed", b === botao)
        );
        if (lista) {
            lista.querySelectorAll(".card").forEach((card) => {
                card.hidden = filtro !== "todos" && card.dataset.categoria !== filtro;
                card.classList.toggle("destaque", filtro !== "todos" && !card.hidden);
            });
        }
        atualizarContadorProjetos();
    });
}

if (lista) {
    lista.addEventListener("click", (e) => {
        const botao = e.target.closest(".btn-remover");
        if (!botao) return;
        botao.closest(".card").remove();
        atualizarContadorProjetos();
    });
}

// ===== Cadastro de projetos =====
const formProjeto = document.getElementById("form-projeto");
if (formProjeto) {
    const campos = [
        { el: document.getElementById("p-titulo"), erro: "erro-titulo",
            valida: (v) => v.trim().length >= 3, msg: "Informe um título com pelo menos 3 caracteres." },
        { el: document.getElementById("p-categoria"), erro: "erro-categoria",
            valida: (v) => v !== "", msg: "Escolha uma categoria." },
        { el: document.getElementById("p-desc"), erro: "erro-desc",
            valida: (v) => v.trim().length >= 10, msg: "A descrição precisa de pelo menos 10 caracteres." },
    ];

    function validarCampo(c) {
        const ok = c.valida(c.el.value);
        const elErro = document.getElementById(c.erro);
        if (elErro) elErro.textContent = ok ? "" : c.msg;
        c.el.classList.toggle("invalido", !ok);
        c.el.setAttribute("aria-invalid", !ok);
        return ok;
    }

    formProjeto.addEventListener("submit", (e) => {
        e.preventDefault();
        const resultados = campos.map(validarCampo);
        const primeiroInvalido = campos.find((c, i) => !resultados[i]);
        if (primeiroInvalido) {
            primeiroInvalido.el.focus();
            return;
        }
        const titulo = campos[0].el.value.trim();
        const categoria = campos[1].el.value;
        const descricao = campos[2].el.value.trim();

        const fragmento = document.createDocumentFragment();
        const card = document.createElement("article");
        card.className = "card";
        card.dataset.categoria = categoria;
        const h3 = document.createElement("h3");
        h3.textContent = titulo;
        const p = document.createElement("p");
        p.textContent = descricao;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-remover";
        btn.textContent = "Remover";
        card.append(h3, p, btn);
        fragmento.appendChild(card);
        if (lista) lista.appendChild(fragmento);
        formProjeto.reset();
        atualizarContadorProjetos();
    });
}

// ===== Formulário de contato =====
const formContato = document.getElementById("form-contato");

if (formContato) {
    const cNome = document.getElementById("c-nome");
    const cEmail = document.getElementById("c-email");
    const cMotivo = document.getElementById("c-motivo");
    const cAssunto = document.getElementById("c-assunto");
    const cMensagem = document.getElementById("c-mensagem");
    const cSimular = document.getElementById("c-simular");
    const grupoAssunto = document.getElementById("grupo-assunto");
    const contadorMsg = document.getElementById("contador-msg");
    const statusContato = document.getElementById("status-contato");
    const resumo = document.getElementById("resumo-erros");
    const btnEnviar = document.getElementById("btn-enviar");

    const MSG_MIN = 30;
    const MSG_MAX = 1000;

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

    function enviarDemo(dados, resultado) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (resultado === "sucesso") resolve({ ok: true });
                else reject(new Error("Falha simulada no envio."));
            }, 1500);
        });
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

    formContato.addEventListener("submit", (e) => {
    e.preventDefault();

        tentouEnviar = true;
        const resultados = camposContato.map(validarContato);
        const primeiro = camposContato.find((c, i) => !resultados[i]);
    
        // Se tiver erro nos campos, para aqui
        if (primeiro) {
            atualizarResumo();
            definirEstado("erro", "Erro: o formulário tem campos para corrigir.");
            if (primeiro.el) primeiro.el.focus();
            return;
        }

        if (resumo) resumo.hidden = true;

        // 1. Digite seu número com DDD (apenas números, com código do país 55)
        // Exemplo: 5571981514561
        const meuNumeroWhatsApp = "5571981514561"; 

        // 2. Coleta dos dados do formulário
        const nome = ler(cNome);
        const email = ler(cEmail);
        const motivo = cMotivo ? cMotivo.options[cMotivo.selectedIndex].text : "";
        const assunto = (cMotivo && cMotivo.value === "outro") ? ler(cAssunto) : "";
        const mensagem = ler(cMensagem);

        // 3. Montagem da mensagem formatada
        let textoMensagem = `*Novo contato pelo Portfólio!*\n\n`;
        textoMensagem += `👤 *Nome:* ${nome}\n`;
        textoMensagem += `✉️ *E-mail:* ${email}\n`;
        textoMensagem += `📌 *Motivo:* ${motivo}\n`;
        if (assunto) {
            textoMensagem += `🏷️ *Assunto:* ${assunto}\n`;
        }
        textoMensagem += `💬 *Mensagem:* ${mensagem}`;

        // 4. Codifica o texto para formato de URL (evita quebras por causa de espaços e acentos)
        const mensagemEncoded = encodeURIComponent(textoMensagem);

        // 5. Cria a URL final do WhatsApp
        const urlWhatsApp = `https://wa.me/${meuNumeroWhatsApp}?text=${mensagemEncoded}`;

        definirEstado("sucesso", "Redirecionando para o WhatsApp...");

        // 6. Abre em uma nova aba (ou no app do WhatsApp no celular)
        window.open(urlWhatsApp, "_blank");

        // Opcional: limpa o formulário após enviar
        formContato.reset();
        camposContato.forEach(limparCampo);
        tentouEnviar = false;
        atualizarAssunto();
        atualizarContadorMensagem();
});

    // Inicializações
    atualizarAssunto();
    atualizarContadorMensagem();
}

// Inicialização do contador de projetos
atualizarContadorProjetos();