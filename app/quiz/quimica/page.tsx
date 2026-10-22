'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define a estrutura dos dados que vêm do banco
type Alternativa = { id: number; texto: string; is_correta: boolean };
type Questao = { id: number; tema: string; enunciado: string; explicacao: string; alternativas: Alternativa[] };

export default function QuizQuimica() {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do jogo
  const [respostaEscolhida, setRespostaEscolhida] = useState<Alternativa | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [quizTerminado, setQuizTerminado] = useState(false);

  useEffect(() => {
    // Vai à nossa nova API buscar as questões
    fetch('/api/questoes')
      .then(res => res.json())
      .then(data => {
        if (data.error || !Array.isArray(data) || data.length === 0) {
          setQuestoes([]); // Garante que fica vazio em caso de erro
        } else {
          setQuestoes(data);
        }
        setCarregando(false);
      })
      .catch(() => {
        setQuestoes([]);
        setCarregando(false);
      });
  }, []);

  const handleEscolha = (alternativa: Alternativa) => {
    if (mostrarFeedback) return; // Impede duplo clique
    
    setRespostaEscolhida(alternativa);
    setMostrarFeedback(true);
    
    if (alternativa.is_correta) {
      setAcertos(prev => prev + 1);
    }
  };

  const proximaQuestao = () => {
    if (indiceAtual + 1 < questoes.length) {
      setIndiceAtual(prev => prev + 1);
      setRespostaEscolhida(null);
      setMostrarFeedback(false);
    } else {
      setQuizTerminado(true);
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-400 font-bold text-xl">A preparar as questões...</div>;
  }

  // Proteção: Se a API falhar ou não trouxer questões
  if (!carregando && questoes.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">Ops! As questões fugiram.</h2>
          <p className="text-slate-400 mb-6">Não conseguimos conectar ao banco de dados no momento.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition"
          >
            Voltar ao Menu
          </button>
        </div>
      </main>
    );
  }

  if (quizTerminado) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-4xl mb-4">🏆</h1>
          <h2 className="text-2xl font-bold mb-2">Quiz Terminado!</h2>
          <p className="text-slate-400 mb-6">Acertaste {acertos} de {questoes.length} questões.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition"
          >
            Voltar ao Menu
          </button>
        </div>
      </main>
    );
  }

  const questaoAtual = questoes[indiceAtual];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Cabeçalho do Quiz */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-emerald-500 font-semibold">{questaoAtual.tema}</span>
          <span className="bg-slate-800 px-4 py-1 rounded-full text-sm font-medium border border-slate-700">
            Questão {indiceAtual + 1} de {questoes.length}
          </span>
        </div>

        {/* Enunciado */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-700 mb-6">
          <p className="text-lg leading-relaxed">{questaoAtual.enunciado}</p>
        </div>

        {/* Alternativas */}
        <div className="flex flex-col gap-3 mb-6">
          {questaoAtual.alternativas.map((alt) => {
            let corBotao = "bg-slate-800 border-slate-600 hover:bg-slate-700"; // Padrão
            
            if (mostrarFeedback) {
              if (alt.is_correta) {
                corBotao = "bg-emerald-900/50 border-emerald-500 text-emerald-100"; // Certa (Verde)
              } else if (respostaEscolhida?.id === alt.id && !alt.is_correta) {
                corBotao = "bg-red-900/50 border-red-500 text-red-100"; // Errada (Vermelha)
              } else {
                corBotao = "bg-slate-800 border-slate-700 opacity-50"; // Outras desativadas
              }
            }

            return (
              <button
                key={alt.id}
                onClick={() => handleEscolha(alt)}
                disabled={mostrarFeedback}
                className={`text-left p-4 rounded-xl border-2 transition-all ${corBotao}`}
              >
                {alt.texto}
              </button>
            );
          })}
        </div>

        {/* Bottom Field: Feedback e Botão Avançar */}
        {mostrarFeedback && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg animate-fade-in">
            <h3 className={`font-bold mb-2 ${respostaEscolhida?.is_correta ? 'text-emerald-400' : 'text-red-400'}`}>
              {respostaEscolhida?.is_correta ? '✨ Resposta Correta!' : '❌ Resposta Incorreta'}
            </h3>
            <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
              {questaoAtual.explicacao}
            </p>
            <button 
              onClick={proximaQuestao}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition"
            >
              {indiceAtual + 1 === questoes.length ? 'Ver Resultados' : 'Próxima Questão ➔'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}