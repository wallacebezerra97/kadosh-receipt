// ===== CONFIGURAÇÃO =====

// texto que vai ser enviado junto com a foto pra IA
let pedido = `Você é um assistente especializado em leitura de notas fiscais e comprovantes brasileiros.

Analise a imagem da nota fiscal ou comprovante enviado e extraia as informações dela.

Para cada produto, identifique a categoria e o emoji correspondente, usando esta lista:
- Alimentos/Mercado: 🛒
- Bebidas: 🥤
- Limpeza: 🧽
- Higiene/Farmácia: 💊
- Vestuário: 👕
- Eletrônicos: 🔌
- Outros: 📦

Responda APENAS em formato JSON válido, sem markdown, sem crases, sem texto antes ou depois, seguindo esta estrutura exata:

{
  "data_emissao": "",
  "estabelecimento": "",
  "cnpj": "",
  "numero_nota": "",
  "produtos": [
    { "descricao": "", "categoria": "", "emoji": "", "quantidade": 0, "valor_unitario": 0, "valor_total": 0 }
  ],
  "valor_total_nota": 0,
  "forma_pagamento": ""
}

Se algum campo não estiver visível ou legível na imagem, retorne null nesse campo.`;

// ===== VARIÁVEIS DE CONTROLE =====

// guarda o total acumulado de todas as notas já lidas
let totalGeral = 0;

// guarda quantos comprovantes já foram lidos
let quantidadeLida = 0;

// ===== FUNÇÃO PRINCIPAL: LER A FOTO =====

async function lerFoto() {
  let foto = document.querySelector(".foto").files[0];

  if (!foto) {
    console.log("Nenhuma imagem selecionada");
    return;
  }

  // avisa o usuário que está processando, enquanto espera a IA responder
  document.querySelector(".resultado").innerHTML = "<p>⏳ Lendo o comprovante...</p>";

  try {
    let resposta = await puter.ai.chat(pedido, foto);

    // a resposta vem como texto, precisamos transformar em objeto JS
    let nota = JSON.parse(resposta);

    renderizarNota(nota);
    atualizarTotal(nota);

  } catch (erro) {
    console.log("Erro ao ler o comprovante:", erro);
    document.querySelector(".resultado").innerHTML =
      "<p>⚠️ Não consegui ler esse comprovante. Tente outra foto.</p>";
  }
}

// ===== FUNÇÃO: DESENHAR A NOTA NA TELA =====

function renderizarNota(nota) {
  let html = `
    <div class="nota-fiscal">
      <h3>🧾 ${nota.estabelecimento ?? "Estabelecimento não identificado"}</h3>
      <p>📅 ${nota.data_emissao ?? "data não identificada"} | 🔢 Nota Nº ${nota.numero_nota ?? "-"}</p>
      <ul class="produtos">
        ${nota.produtos.map(p => `
          <li>${p.emoji ?? "📦"} ${p.descricao} — ${p.quantidade}x R$ ${Number(p.valor_unitario).toFixed(2)} = <strong>R$ ${Number(p.valor_total).toFixed(2)}</strong></li>
        `).join("")}
      </ul>
      <p class="total-nota">💰 Total da nota: <strong>R$ ${Number(nota.valor_total_nota).toFixed(2)}</strong></p>
      <p>💳 Pagamento: ${nota.forma_pagamento ?? "não identificado"}</p>
    </div>
  `;

  document.querySelector(".resultado").innerHTML = html;
}

// ===== FUNÇÃO: ATUALIZAR O TOTAL GERAL E A CONTAGEM =====

function atualizarTotal(nota) {
  // soma o valor dessa nota ao total acumulado
  totalGeral += Number(nota.valor_total_nota) || 0;

  // aumenta a contagem de comprovantes lidos
  quantidadeLida += 1;

  // atualiza o texto na tela, no formato R$ 0,00
  document.querySelector(".total").textContent =
    "R$ " + totalGeral.toFixed(2).replace(".", ",");

  // atualiza a contagem de comprovantes na tela
  document.querySelector(".quantos").textContent =
    quantidadeLida + (quantidadeLida === 1 ? " comprovante lido" : " comprovantes lidos");
}