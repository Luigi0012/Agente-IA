import express from 'express';
import cors from 'cors';
import { perguntasParte1, perguntasParte2 } from './perguntas.js';

const api = express();
api.use(express.json());
api.use(cors());

let respostas = {}; // { userId: { parte: 'parte1', respostas: [] } }

api.post('/respostas', (req, resp) => {
  const { userId, perguntaId, alternativa, primeira } = req.body;

  if (!respostas[userId]) {
    respostas[userId] = { parte: 'parte1', respostas: [] };
  }

  const usuario = respostas[userId];
  const perguntasAtuais = usuario.parte === 'parte1' ? perguntasParte1 : perguntasParte2;

  // Se for primeira requisição, limpa dados anteriores e retorna a primeira pergunta
  if (primeira) {
    // Limpar dados anteriores do usuário
    respostas[userId] = { parte: 'parte1', respostas: [] };
    return resp.json({ tipo: "pergunta", conteudo: perguntasParte1[0] });
  }

  const pergunta = perguntasAtuais[perguntaId];
  if (!pergunta) return resp.status(400).json({ erro: "Pergunta não encontrada" });

  const alternativaEscolhida = pergunta.alternativas[alternativa];
  if (!alternativaEscolhida) return resp.status(400).json({ erro: "Alternativa inválida" });

  const profissao = alternativaEscolhida.profissao;
  usuario.respostas.push(profissao);

  // Verifica se ainda há mais perguntas na parte atual
  if (perguntaId + 1 < perguntasAtuais.length) {
    return resp.json({ tipo: "pergunta", conteudo: perguntasAtuais[perguntaId + 1] });
  }

  // Se acabaram as perguntas da parte 1, vai para parte 2
  if (usuario.parte === 'parte1') {
    usuario.parte = 'parte2';
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