import express from 'express';
import cors from 'cors';
import { perguntasParte1, perguntasParte2 } from './perguntas.js';

const api = express();
api.use(express.json());
api.use(cors());

let respostas = {}; // { userId: { parte: 'parte1', respostas: [], perguntaAtual: 0 } }

api.post('/respostas', (req, resp) => {
  const { userId, perguntaId, alternativa, primeira } = req.body;

  if (!respostas[userId]) {
    respostas[userId] = { parte: 'parte1', respostas: [], perguntaAtual: 0 };
  }

  const usuario = respostas[userId];

  // Se for primeira requisição, limpa dados anteriores e retorna a primeira pergunta
  if (primeira) {
    respostas[userId] = { parte: 'parte1', respostas: [], perguntaAtual: 0 };
    return resp.json({ tipo: "pergunta", conteudo: perguntasParte1[0] });
  }

  const perguntasAtuais = usuario.parte === 'parte1' ? perguntasParte1 : perguntasParte2;
  
  // Usar perguntaAtual ao invés de perguntaId para evitar conflitos
  const pergunta = perguntasAtuais[usuario.perguntaAtual];
  if (!pergunta) return resp.status(400).json({ erro: "Pergunta não encontrada" });

  const alternativaEscolhida = pergunta.alternativas[alternativa];
  if (!alternativaEscolhida) return resp.status(400).json({ erro: "Alternativa inválida" });

  const profissao = alternativaEscolhida.profissao;
  usuario.respostas.push(profissao);
  usuario.perguntaAtual++;

  // Verifica se ainda há mais perguntas na parte atual
  if (usuario.perguntaAtual < perguntasAtuais.length) {
    return resp.json({ tipo: "pergunta", conteudo: perguntasAtuais[usuario.perguntaAtual] });
  }

  // Se acabaram as perguntas da parte 1, vai para parte 2
  if (usuario.parte === 'parte1') {
    usuario.parte = 'parte2';
    usuario.perguntaAtual = 0; // Reset do índice para parte 2
    return resp.json({ tipo: "pergunta", conteudo: perguntasParte2[0] });
  }

  // Se chegou aqui, acabaram todas as perguntas - calcular resultado
  const pontos = {};
  usuario.respostas.forEach(prof => (pontos[prof] = (pontos[prof] || 0) + 1));

  let resultado = null, maior = 0;
  for (const prof in pontos) {
    if (pontos[prof] > maior) {
      maior = pontos[prof];
      resultado = prof;
    }
  }

  // Limpar respostas do usuário para permitir novo teste
  delete respostas[userId];

  return resp.json({ 
    tipo: "resultado", 
    conteudo: `Sua profissão ideal é: ${resultado}` 
  });
});

api.listen(7483, () => console.log("==> SUPER API em funcionamento!!!"));