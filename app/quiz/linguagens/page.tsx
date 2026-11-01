'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipagem baseada na nossa base de dados Prisma
type Alternativa = {
  id: number;
  texto: string;
  is_correta: boolean;
};

type Pergunta = {
  id: number;
  disciplina: string;
  tema: string;
  enunciado: string;
  explicacao: string;
  alternativas: Alternativa[];
};

export default function QuizLinguagens() {
  const router = useRouter();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Jogo
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<number | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [quizFinalizado, setQuizFinalizado] = useState(false);

  useEffect(() => {
    // Vai buscar as perguntas de Linguagens à nossa API
    async function carregarPerguntas() {
      try {
        // Supondo que a sua API aceita a disciplina como parâmetro
        const res = await fetch('/api/perguntas?disciplina=Linguagens');
        if (!res.ok) throw new Error('Erro ao buscar perguntas');
        
        const data = await res.json();
        
        // Baralha as perguntas para não ser sempre a mesma ordem
        const perguntasBaralhadas = data.sort(() => Math.random() - 0.5).slice(0, 10); // Traz 10 perguntas por partida
        setPerguntas(perguntasBaralhadas);
      } catch (erro) {
        console.error("Erro ao carregar as questões:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarPerguntas();
  }, []);

  const handleResponder = (alternativa: Alternativa) => {
    if (respondido) return; // Evita duplo clique

    setAlternativaSelecionada(alternativa.id);
    setRespondido(true);

    if (alternativa.is_correta) {
      setPontuacao((prev) => prev + 1);
    } else {
      // Se errou, guarda a pergunta no LocalStorage para o "Cofre de Revisão"
      const perguntaAtual = perguntas[indiceAtual];
      const errosSalvos = JSON.parse(localStorage.getItem('errosJuliana') || '[]');
      
      // Evita guardar a mesma pergunta duplicada no cofre
      const jaExiste = errosSalvos.find((p: Pergunta) => p.id === perguntaAtual.id);
      if (!jaExiste) {
        errosSalvos.push(perguntaAtual);
        localStorage.setItem('errosJuliana', JSON.stringify(errosSalvos));
      }
    }
  };

  const handleProximaPergunta = () => {
    if (indiceAtual + 1 < perguntas.length) {
      setIndiceAtual((prev) => prev + 1);
      setRespondido(false);
      setAlternativaSelecionada(null);
    } else {
      setQuizFinalizado(true);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin text-5xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-orange-500 animate-pulse">A preparar os textos...</h2>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Nenhuma questão encontrada!</h2>
        <button onClick={() => router.push('/dashboard')} className="bg-slate-800 px-6 py-3 rounded-xl font-bold">Voltar ao Início</button>
      </div>
    );
  }

  if (quizFinalizado) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full">
          <div className="text-6xl mb-6">{pontuacao > 6 ? '🎉' : '💪'}</div>
          <h2 className="text-3xl font-bold text-white mb-2">Fim do Treino!</h2>
          <p className="text-slate-400 mb-8">Acertaste <span className="text-orange-500 font-bold text-xl">{pontuacao}</span> de {perguntas.length} questões.</p>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition"
            >
              Jogar Novamente
            </button>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition border border-slate-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const perguntaAtual = perguntas[indiceAtual];

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200">
      <div className="max-w-3xl mx-auto mt-4 md:mt-10">
        
        {/* Cabeçalho do Jogo */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white transition">
            ← Sair
          </button>
          <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 font-bold text-orange-400">
            Questão {indiceAtual + 1} de {perguntas.length}
          </div>
          <div className="text-slate-400 font-medium">
            Acertos: <span className="text-emerald-400 font-bold">{pontuacao}</span>
          </div>
        </div>

        {/* Área da Pergunta */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div 
              className="h-full bg-orange-500 transition-all duration-500" 
              style={{ width: `${((indiceAtual) / perguntas.length) * 100}%` }}
            ></div>
          </div>
          
          <span className="inline-block px-3 py-1 bg-orange-950 text-orange-400 text-sm font-bold rounded-lg mb-4 border border-orange-900/50">
            {perguntaAtual.tema}
          </span>
          
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-white">
            {perguntaAtual.enunciado}
          </h2>
        </div>

        {/* Alternativas */}
        <div className="flex flex-col gap-3 mb-8">
          {perguntaAtual.alternativas.map((alt) => {
            
            // Lógica de cores para mostrar certo/errado após responder
            let corBotao = "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-orange-500/50";
            if (respondido) {
              if (alt.is_correta) {
                corBotao = "bg-emerald-900/40 border-emerald-500 text-emerald-100"; // Resposta Certa (Fica verde)
              } else if (alternativaSelecionada === alt.id) {
                corBotao = "bg-red-900/40 border-red-500 text-red-100"; // Resposta que ela errou (Fica vermelha)
              } else {
                corBotao = "bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed"; // Outras opções ficam apagadas
              }
            }

            return (
              <button
                key={alt.id}
                onClick={() => handleResponder(alt)}
                disabled={respondido}
                className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 shadow-sm ${corBotao}`}
              >
                <span className="text-base md:text-lg">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        {/* Explicação e Botão de Avançar */}
        {respondido && (
          <div className="animate-fade-in-up">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-6">
              <h3 className="text-emerald-400 font-bold mb-2 text-lg">Explicação:</h3>
              <p className="text-slate-300 leading-relaxed">{perguntaAtual.explicacao}</p>
            </div>
            
            <button
              onClick={handleProximaPergunta}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg py-5 rounded-2xl transition shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]"
            >
              {indiceAtual + 1 === perguntas.length ? 'Ver Resultado Final' : 'Próxima Questão ➔'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}