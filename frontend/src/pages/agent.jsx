import { useState } from "react";
import axios from "axios";
import { perguntas } from "../../../backend/perguntas.js";
import "./agentStyle.scss";

export default function Agente() {
  const [conteudo, setConteudo] = useState(perguntas[0]); // primeira pergunta
  const [perguntaId, setPerguntaId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState(null); // alternativa selecionada
  const userId = "user123";

  async function enviarResposta() {
    if (!selecionada) return; // não envia se nada estiver selecionado

    try {
      setLoading(true);
      const resp = await axios.post("http://localhost:7483/respostas", {
        userId,
        perguntaId,
        alternativa: selecionada,
      });

      if (resp.data.tipo === "pergunta") {
        setConteudo(resp.data.conteudo);
        setPerguntaId((prev) => prev + 1);
        setSelecionada(null); // reseta a seleção para a próxima pergunta
      } else if (resp.data.tipo === "resultado") {
        setConteudo(resp.data.conteudo);
      }
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (typeof conteudo === "string") {
    return (
      <section className="Container">
        <h1>{conteudo}</h1>
      </section>
    );
  }

  return (
    <section className="Container">
        <div className="formul">
<img src="ChatGPT_Image_25_de_set._de_2025__22_10_03-removebg-preview.png" alt="" />
</div>

<div className="linhas-externas">
<div className="linha-1"></div>
<div className="linha-2"></div>
</div>
<div className="main">
      <h1>{conteudo.texto}</h1>
      <div className="inputs">
        {Object.entries(conteudo.alternativas).map(([letra, alt]) => (
          <label key={letra}>
            <input
              type="radio"
              name="alternativa"
              value={letra}
              checked={selecionada === letra} // indica qual está selecionado
              onChange={() => setSelecionada(letra)} // atualiza a seleção
            />
            <p>{alt.texto}</p>
          </label>
        ))}
      </div>
      </div>

      <button onClick={enviarResposta} className="enviarBotao">
        Enviar
      </button>
    </section>
  );
}
