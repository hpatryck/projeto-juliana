'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Alternativa = { id: number; texto: string; is_correta: boolean };
type Questao = { id: number; tema: string; enunciado: string; explicacao: string; alternativas: Alternativa[] };

const TEMAS_DISPONIVEIS = [
  'Citologia animal e vegetal', 
  'Fisiologia e Metabolismo', 
  'Doenças (Vírus, Fungos, Bactérias e Genéticas)',
  'Evolução', 
  'Relações Ecológicas', 
  'Botânica e Plantas', 
  'Genética',
  'Funcionalidade dos fungos, vírus e bactérias',
  'Biogeoquímica'
];

export default function QuizBiologia() {
  const router = useRouter();
  const [todasQuestoes, setTodasQuestoes] = useState<Questao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [fase, setFase] = useState<'selecao' | 'jogando' | 'resultado'>('selecao');
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>(TEMAS_DISPONIVEIS);

  const [questoesFiltradas, setQuestoesFiltradas] = useState<Questao[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [alternativaMarcada, setAlternativaMarcada] = useState<Alternativa | null>(null);
  const [respostasConfirmadas, setRespostasConfirmadas] = useState<{ [key: number]: Alternativa }>({});
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    fetch('/api/questoes')
      .then(res => res.json())
      .then(data => {
        const apenasBiologia = Array.isArray(data) ? data.filter(q => q.disciplina === 'Biologia') : [];
        setTodasQuestoes(apenasBiologia);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  const toggleTema = (tema: string) => {
    setTemasSelecionados(prev => prev.includes(tema) ? prev.filter(t => t !== tema) : [...prev, tema]);
  };

  const iniciarQuiz = () => {
    if (temasSelecionados.length === 0) return;
    const filtradas = todasQuestoes.filter(q => temasSelecionados.includes(q.tema));
    setQuestoesFiltradas(filtradas);
    setIndiceAtual(0);
    setAlternativaMarcada(null);
    setRespostasConfirmadas({});
    setAcertos(0);
    setFase('jogando');
  };

  const selecionarAlternativa = (alt: Alternativa) => {
    if (respostasConfirmadas[indiceAtual]) return;
    setAlternativaMarcada(alt);
  };

  const confirmarResposta = () => {
    if (!alternativaMarcada) return;
    setRespostasConfirmadas(prev => ({ ...prev, [indiceAtual]: alternativaMarcada }));
    if (alternativaMarcada.is_correta) setAcertos(prev => prev + 1);
  };

  const salvarResultadoFinal = async () => {
    const jogadorId = localStorage.getItem('jogadorId');
    if (!jogadorId) return;

    const erros: number[] = [];
    questoesFiltradas.forEach((questao, index) => {
      const resposta = respostasConfirmadas[index];
      if (resposta && !resposta.is_correta) erros.push(questao.id);
    });

    try {
      await fetch('/api/salvar-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jogadorId,
          disciplina: 'Biologia',
          assuntos: temasSelecionados,
          pontuacao: acertos,
          total: questoesFiltradas.length,
          tempoGasto: 0,
          erros
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const proximaQuestao = () => {
    if (indiceAtual + 1 < questoesFiltradas.length) {
      setIndiceAtual(prev => prev + 1);
      setAlternativaMarcada(respostasConfirmadas[indiceAtual + 1] || null);
    } else {
      setFase('resultado');
      salvarResultadoFinal();
    }
  };

  const questaoAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual(prev => prev - 1);
      setAlternativaMarcada(respostasConfirmadas[indiceAtual - 1] || null);
    }
  };

  if (carregando) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-green-400 font-bold text-xl">A isolar o DNA...</div>;
  
  if (fase === 'selecao') {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl mt-4">
          <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 font-medium">⬅ Voltar ao Menu</button>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Treino de Biologia 🧬</h1>
          <p className="text-slate-400 mb-8">Seleciona os sistemas biológicos que desejas estudar hoje:</p>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-lg flex flex-col gap-3">
            {TEMAS_DISPONIVEIS.map(tema => (
              <label key={tema} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700 transition border border-slate-600">
                <input type="checkbox" checked={temasSelecionados.includes(tema)} onChange={() => toggleTema(tema)} className="w-5 h-5 accent-green-500" />
                <span className="font-medium">{tema}</span>
              </label>
            ))}
          </div>
          <button onClick={iniciarQuiz} disabled={temasSelecionados.length === 0} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition">
            Iniciar Estudo ➔
          </button>
        </div>
      </main>
    );
  }

  if (fase === 'resultado') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-5xl mb-4">🔬</h1>
          <h2 className="text-2xl font-bold mb-2">Análise Concluída!</h2>
          <p className="text-slate-400 mb-8 text-lg">Acertaste <strong className="text-green-400">{acertos}</strong> de {questoesFiltradas.length} questões.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setFase('selecao')} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition">Estudar outros temas</button>
            <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition">Voltar ao Laboratório (Menu)</button>
          </div>
        </div>
      </main>
    );
  }

  const questaoAtual = questoesFiltradas[indiceAtual];
  const jaConfirmou = !!respostasConfirmadas[indiceAtual];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setFase('selecao')} className="text-slate-400 hover:text-white flex items-center gap-1 transition text-sm font-medium">⬅ Trocar Matéria</button>
          <span className="bg-slate-800 px-4 py-1 rounded-full text-sm font-medium border border-slate-700 text-green-400">Questão {indiceAtual + 1} de {questoesFiltradas.length}</span>
        </div>
        <div className="mb-4"><span className="bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded text-sm font-bold">{questaoAtual.tema.toUpperCase()}</span></div>
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-700 mb-6"><p className="text-lg leading-relaxed">{questaoAtual.enunciado}</p></div>
        <div className="flex flex-col gap-3 mb-6">
          {questaoAtual.alternativas.map((alt) => {
            let corBotao = "bg-slate-800 border-slate-600 hover:bg-slate-700";
            if (jaConfirmou) {
              if (alt.is_correta) corBotao = "bg-green-900/50 border-green-500 text-green-100";
              else if (respostasConfirmadas[indiceAtual].id === alt.id) corBotao = "bg-red-900/50 border-red-500 text-red-100";
              else corBotao = "bg-slate-800 border-slate-700 opacity-50";
            } else if (alternativaMarcada?.id === alt.id) corBotao = "bg-blue-900/30 border-blue-500 text-blue-100 ring-2 ring-blue-500/30";
            
            return (
              <button key={alt.id} onClick={() => selecionarAlternativa(alt)} disabled={jaConfirmou} className={`text-left p-4 rounded-xl border-2 transition-all ${corBotao}`}>
                {alt.texto}
              </button>
            );
          })}
        </div>
        {jaConfirmou && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg mb-8 animate-fade-in">
            <h3 className={`font-bold mb-3 ${respostasConfirmadas[indiceAtual].is_correta ? 'text-green-400' : 'text-red-400'}`}>
              {respostasConfirmadas[indiceAtual].is_correta ? '✨ Mutação bem-sucedida!' : '❌ Falha celular...'}
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">{questaoAtual.explicacao}</p>
          </div>
        )}
        <div className="flex gap-4 mb-10">
          <button onClick={questaoAnterior} disabled={indiceAtual === 0} className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-20 text-white font-bold py-4 rounded-xl transition">⬅ Anterior</button>
          {!jaConfirmou ? (
            <button onClick={confirmarResposta} disabled={!alternativaMarcada} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold py-4 rounded-xl transition">Confirmar</button>
          ) : (
            <button onClick={proximaQuestao} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition">
              {indiceAtual + 1 === questoesFiltradas.length ? 'Ver Resultados ➔' : 'Próxima ➔'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}