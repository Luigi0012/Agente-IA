import { useEffect, useState } from "react";
import axios from "axios";
import "./agentStyle.scss";

export default function Agente() {
  const [conteudo, setConteudo] = useState(null);
  const [perguntaId, setPerguntaId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [finalizado, setFinalizado] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const userId = "user123";

  // carregar a primeira pergunta ao montar
  useEffect(() => {
    async function carregarPrimeira() {
      try {
        setLoading(true);
        const resp = await axios.post("http://localhost:7483/respostas", {
          userId,
          perguntaId: 0,
          alternativa: null,
          primeira: true,
        });
        setConteudo(resp.data.conteudo);
        setFinalizado(false);
      } catch (err) {
        console.error("Erro ao carregar primeira pergunta:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarPrimeira();
  }, []);

  async function enviarResposta() {
    if (!selecionada) return;

    try {
      setTransitioning(true); // Inicia transição
      
      // Delay para mostrar a animação de transição
      setTimeout(async () => {
        setLoading(true);
        
        try {
          const resp = await axios.post("http://localhost:7483/respostas", {
            userId,
            perguntaId,
            alternativa: selecionada,
          });

          if (resp.data.tipo === "pergunta") {
            setConteudo(resp.data.conteudo);
            
            if (resp.data.conteudo.id === 2) {
              setPerguntaId(0);
            } else {
              setPerguntaId((prev) => prev + 1);
            }
            
            setSelecionada(null);
            
          } else if (resp.data.tipo === "resultado") {
            setConteudo(resp.data.conteudo);
            setFinalizado(true);
          }
          
          // Remove transição após delay
          setTimeout(() => {
            setTransitioning(false);
          }, 100);
          
        } catch (err) {
          console.error("Erro ao enviar resposta:", err);
        } finally {
          setLoading(false);
        }
      }, 200);
      
    } catch (err) {
      console.error("Erro geral:", err);
      setTransitioning(false);
    }
  }

  function reiniciarTeste() {
    setConteudo(null);
    setPerguntaId(0);
    setSelecionada(null);
    setFinalizado(false);
    setTransitioning(false);
    
    setTimeout(async () => {
      try {
        setLoading(true);
        const resp = await axios.post("http://localhost:7483/respostas", {
          userId,
          perguntaId: 0,
          alternativa: null,
          primeira: true,
        });
        setConteudo(resp.data.conteudo);
      } catch (err) {
        console.error("Erro ao reiniciar:", err);
      } finally {
        setLoading(false);
      }
    }, 100);
  }

  // Classes CSS dinâmicas
  const containerClasses = [
    "Container",
    transitioning && "question-transition",
    finalizado && "resultado"
  ].filter(Boolean).join(" ");

  if (loading) {
    return (
      <section className="Container">
        <div className="formul">
          <img
            src="ChatGPT_Image_25_de_set._de_2025__22_10_03-removebg-preview.png"
            alt=""
          />
        </div>
        <div className="loading-message">
          <h2 style={{color: 'white', textAlign: 'center'}}>
            Carregando...
          </h2>
        </div>
      </section>
    );
  }

  // Se finalizou, mostrar resultado
  if (finalizado || typeof conteudo === "string") {
    return (
      <section className={containerClasses}>
        <div className="formul">
          <img
            src="ChatGPT_Image_25_de_set._de_2025__22_10_03-removebg-preview.png"
            alt=""
          />
        </div>

      <div className="quiz-container">
        <div className="linhas-externas">
          <div className="linha-1"></div>
          <div className="linha-2"></div>
        </div>

        <div className="main">
          <h1>{typeof conteudo === "string" ? conteudo : conteudo}</h1>
          <button onClick={reiniciarTeste} className="enviarBotao">
             Fazer Novo Teste
          </button>
        </div>
      </div>
      </section>
    );
  }

  if (!conteudo) {
    return (
      <section className="Container">
        <div className="formul">
          <img
            src="ChatGPT_Image_25_de_set._de_2025__22_10_03-removebg-preview.png"
            alt=""
          />
        </div>
        <div className="loading-message">
          <h2 style={{color: 'white', textAlign: 'center'}}>
            Carregando perguntas...
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className={containerClasses}>
      <div className="formul">
        <img
          src="ChatGPT_Image_25_de_set._de_2025__22_10_03-removebg-preview.png"
          alt=""
        />
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
                checked={selecionada === letra}
                onChange={() => setSelecionada(letra)}
                disabled={transitioning}
              />
              <p>{alt.texto}</p>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={enviarResposta} 
        className="enviarBotao"
        disabled={!selecionada || transitioning}
      >
        {transitioning ? " Processando..." : " Enviar"}
      </button>
    </section>
  );
}