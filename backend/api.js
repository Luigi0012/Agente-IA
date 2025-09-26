import express from 'express';
import cors from 'cors';
import { perguntasParte1, perguntasParte2 } from './perguntas.js';

const api = express();
api.use(express.json());
api.use(cors());

let respostas = {}; // { userId: { parte: 'parte1', respostas: [] } }

api.post('/respostas', (req, resp) => {
  const { userId, perguntaId, alternativa } = req.body;

  if (!respostas[userId]) {
    respostas[userId] = {
      parte: 'parte1',   // começa na primeira parte
      respostas: []      // respostas acumuladas
    };
  }

  const usuario = respostas[userId];

  // seleciona array correto de perguntas de acordo com a parte
  let perguntasAtuais =
    usuario.parte === 'parte1' ? perguntasParte1 : perguntasParte2;

  const pergunta = perguntasAtuais[perguntaId];
  const profissao = pergunta.alternativas[alternativa].profissao;

  usuario.respostas.push(profissao);

  // verifica se há próxima pergunta na parte atual
  if (perguntaId + 1 < perguntasAtuais.length) {
    const proximaPergunta = perguntasAtuais[perguntaId + 1];
    return resp.json({ tipo: "pergunta", conteudo: proximaPergunta });
  }

  // se acabou a parte1, passa para parte2
  if (usuario.parte === 'parte1') {
    usuario.parte = 'parte2';
    return resp.json({ tipo: "pergunta", conteudo: perguntasParte2[0] });
  }

  // se acabou a parte2, calcula resultado final
  const pontos = {};
  usuario.respostas.forEach(prof => {
    pontos[prof] = (pontos[prof] || 0) + 1;
  });

  let resultado = null;
  let maior = 0;
  for (const profissao in pontos) {
    if (pontos[profissao] > maior) {
      maior = pontos[profissao];
      resultado = profissao;
    }
  }

  return resp.json({ tipo: "resultado", conteudo: `Sua profissão ideal é: ${resultado}` });
});

api.listen(7483, () => console.log('==> SUPER API em funcionamento!!!'));
