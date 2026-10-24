'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define a estrutura dos dados
type Alternativa = { id: number; texto: string; is_correta: boolean };
type Questao = { id: number; tema: string; enunciado: string; explicacao: string; alternativas: Alternativa[] };

const TEMAS_DISPONIVEIS = [
  'Química Ambiental', 'Estequiometria', 'Eletroquímica',
  'Termoquímica', 'Equilíbrio Químico', 'Química Orgânica', 'Separação de Misturas'
];

export default function QuizQuimica() {
  const router = useRouter();
  const [todasQuestoes, setTodasQuestoes] = useState<Questao[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados da Fase de Seleção de Temas
  const [fase, setFase] = useState<'selecao' | 'jogando' | 'resultado'>('selecao');
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>(TEMAS_DISPONIVEIS); // Todos vêm marcados por padrão

  // Estados do Jogo (Quiz)
  const [questoesFiltradas, setQuestoesFiltradas] = useState<Questao[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [alternativaMarcada, setAlternativaMarcada] = useState<Alternativa | null>(null);
  
  // Guardamos as respostas confirmadas pelo índice da questão, para podermos voltar atrás e rever!
  const [respostasConfirmadas, setRespostasConfirmadas] = useState<{ [key: number]: Alternativa }>({});
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    fetch('/api/questoes')
      .then(res => res.json())
      .then(data => {
        if (data.error || !Array.isArray(data) || data.length === 0) {
          setTodasQuestoes([]);
        } else {
          setTodasQuestoes(data);
        }
        setCarregando(false);
      })
      .catch(() => {
        setTodasQuestoes([]);
        setCarregando(false);
      });
  }, []);

  const toggleTema = (tema: string) => {
    setTemasSelecionados(prev =>
      prev.includes(tema) ? prev.filter(t => t !== tema) : [...prev, tema]
    );
  };

  const iniciarQuiz = () => {
    if (temasSelecionados.length === 0) return;

    // Filtra apenas as questões dos temas que a Juliana escolheu na caixinha
    const filtradas = todasQuestoes.filter(q => temasSelecionados.includes(q.tema));
    
    setQuestoesFiltradas(filtradas);
    setIndiceAtual(0);
    setAlternativaMarcada(null);
    setRespostasConfirmadas({});
    setAcertos(0);
    setFase('jogando');
  };

  const selecionarAlternativa = (alt: Alternativa) => {
    // Se a questão já foi confirmada (já está verde/vermelha), bloqueia a mudança
    if (respostasConfirmadas[indiceAtual]) return;
    
    // Apenas sombreia a alternativa
    setAlternativaMarcada(alt);
  };

  const confirmarResposta = () => {
    if (!alternativaMarcada) return;

    // Grava a resposta como definitiva para esta questão
    setRespostasConfirmadas(prev => ({
      ...prev,
      [indiceAtual]: alternativaMarcada
    }));

    if (alternativaMarcada.is_correta) {
      setAcertos(prev => prev + 1);
    }
  };

  const proximaQuestao = () => {
    if (indiceAtual + 1 < questoesFiltradas.length) {
      setIndiceAtual(prev => prev + 1);
      // Ao avançar, tenta recuperar a marcação caso ela já tenha respondido a esta questão antes
      setAlternativaMarcada(respostasConfirmadas[indiceAtual + 1] || null);
    } else {
      setFase('resultado');
    }
  };

  const questaoAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual(prev => prev - 1);
      // Ao voltar, recupera a resposta que ela já tinha dado para ela poder rever
      setAlternativaMarcada(respostasConfirmadas[indiceAtual - 1] || null);
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-400 font-bold text-xl">A preparar as questões...</div>;
  }

  if (!carregando && todasQuestoes.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">Ops! As questões fugiram.</h2>
          <p className="text-slate-400 mb-6">Não conseguimos conectar ao banco de dados no momento.</p>
          <button onClick={() => router.push('/dashboard')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition">
            Voltar ao Menu
          </button>
        </div>
      </main>
    );
  }

  // =======================================================================
  // ECRÃ 1: SELEÇÃO DE ASSUNTOS
  // =======================================================================
  if (fase === 'selecao') {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl mt-4">
          
          <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition font-medium">
            ⬅ Voltar ao Menu
          </button>

          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Treino de Química</h1>
          <p className="text-slate-400 mb-8">Seleciona os assuntos que desejas estudar hoje:</p>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-lg">
            <div className="flex flex-col gap-3">
              {TEMAS_DISPONIVEIS.map(tema => (
                <label key={tema} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700 transition border border-slate-600">
                  <input
                    type="checkbox"
                    checked={temasSelecionados.includes(tema)}
                    onChange={() => toggleTema(tema)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium">{tema}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={iniciarQuiz}
            disabled={temasSelecionados.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition"
          >
            {temasSelecionados.length === 0 ? 'Selecione pelo menos um assunto' : 'Começar a Praticar ➔'}
          </button>
        </div>
      </main>
    );
  }

  // =======================================================================
  // ECRÃ 2: RESULTADOS
  // =======================================================================
  if (fase === 'resultado') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-5xl mb-4">🏆</h1>
          <h2 className="text-2xl font-bold mb-2">Quiz Terminado!</h2>
          <p className="text-slate-400 mb-8 text-lg">Acertaste <strong className="text-emerald-400">{acertos}</strong> de {questoesFiltradas.length} questões.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setFase('selecao')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition">
              Treinar outros assuntos
            </button>
            <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition">
              Voltar ao Menu Principal
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =======================================================================
  // ECRÃ 3: O JOGO (QUIZ)
  // =======================================================================
  const questaoAtual = questoesFiltradas[indiceAtual];
  const jaConfirmou = !!respostasConfirmadas[indiceAtual]; // Verifica se já submeteu a resposta desta questão

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Cabeçalho do Quiz com botão de sair */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setFase('selecao')} className="text-slate-400 hover:text-white flex items-center gap-1 transition text-sm font-medium">
            ⬅ Trocar de Assunto
          </button>
          <span className="bg-slate-800 px-4 py-1 rounded-full text-sm font-medium border border-slate-700 text-emerald-400">
            Questão {indiceAtual + 1} de {questoesFiltradas.length}
          </span>
        </div>

        {/* Indicação do Tema da Questão */}
        <div className="mb-4">
          <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-3 py-1 rounded text-sm font-bold tracking-wide">
            {questaoAtual.tema.toUpperCase()}
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

            if (jaConfirmou) {
              // MODO APÓS CONFIRMAR: Pinta a verde e vermelho e bloqueia cliques
              if (alt.is_correta) {
                corBotao = "bg-emerald-900/50 border-emerald-500 text-emerald-100"; // A certa
              } else if (respostasConfirmadas[indiceAtual].id === alt.id) {
                corBotao = "bg-red-900/50 border-red-500 text-red-100"; // A errada que a pessoa escolheu
              } else {
                corBotao = "bg-slate-800 border-slate-700 opacity-50"; // As restantes inativas
              }
            } else {
              // MODO ANTES DE CONFIRMAR: Apenas sombreia a azul o que ela tocou
              if (alternativaMarcada?.id === alt.id) {
                corBotao = "bg-blue-900/30 border-blue-500 text-blue-100 ring-2 ring-blue-500/30";
              }
            }

            return (
              <button
                key={alt.id}
                onClick={() => selecionarAlternativa(alt)}
                disabled={jaConfirmou}
                className={`text-left p-4 rounded-xl border-2 transition-all ${corBotao}`}
              >
                {alt.texto}
              </button>
            );
          })}
        </div>

        {/* Explicação da Questão (Aparece só após confirmar) */}
        {jaConfirmou && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg mb-8 animate-fade-in">
            <h3 className={`font-bold mb-3 ${respostasConfirmadas[indiceAtual].is_correta ? 'text-emerald-400' : 'text-red-400'}`}>
              {respostasConfirmadas[indiceAtual].is_correta ? '✨ Mandaste bem!' : '❌ Ops, não foi desta...'}
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {questaoAtual.explicacao}
            </p>
          </div>
        )}

        {/* Zona Inferior: Botões de Navegação Duplos */}
        <div className="flex gap-4 mb-10">
          
          <button
            onClick={questaoAnterior}
            disabled={indiceAtual === 0}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
          >
            ⬅ Anterior
          </button>

          {!jaConfirmou ? (
            <button
              onClick={confirmarResposta}
              disabled={!alternativaMarcada}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
            >
              Confirmar
            </button>
          ) : (
            <button
              onClick={proximaQuestao}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              {indiceAtual + 1 === questoesFiltradas.length ? 'Ver Resultados ➔' : 'Próxima ➔'}
            </button>
          )}

        </div>

      </div>
    </main>
  );
}