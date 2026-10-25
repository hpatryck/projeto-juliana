'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type QuizHistorico = {
  id: string;
  disciplina: string;
  assuntos: string;
  pontuacao: number;
  total: number;
  criado_em: string;
};

export default function Historico() {
  const router = useRouter();
  const [historico, setHistorico] = useState<QuizHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const jogadorId = localStorage.getItem('jogadorId');
    if (!jogadorId) {
      router.push('/');
      return;
    }

    // Chama a nossa nova API passando o ID da Juliana
    fetch(`/api/historico?jogadorId=${jogadorId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistorico(data);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [router]);

  // Função para formatar a data que vem do banco de dados
  const formatarData = (dataIso: string) => {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const refazerTeste = (disciplina: string) => {
    // Por enquanto, direciona para a tela de Química (vamos automatizar a seleção de temas no futuro)
    if (disciplina === 'Química') {
      router.push('/quiz/quimica');
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-blue-400 font-bold text-xl">A abrir o cofre de registos...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition"
          >
            ⬅ Voltar
          </button>
          <h1 className="text-3xl font-bold text-blue-400">📜 Histórico de Testes</h1>
        </div>

        {historico.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-10 text-center shadow-lg">
            <span className="text-6xl block mb-4">📭</span>
            <h2 className="text-xl font-bold text-slate-300 mb-2">Ainda não há testes registados.</h2>
            <p className="text-slate-400">Vai ao Menu Principal e começa o teu primeiro treino para preencher este mural!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {historico.map((quiz) => {
              // Calcula a percentagem para dar uma cor à nota
              const percentagem = (quiz.pontuacao / quiz.total) * 100;
              let corNota = "text-yellow-400";
              if (percentagem >= 75) corNota = "text-emerald-400";
              if (percentagem < 50) corNota = "text-red-400";

              return (
                <div key={quiz.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-slate-500 transition-colors">
                  
                  {/* Info do Teste */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm font-bold">
                        {quiz.disciplina}
                      </span>
                      <span className="text-slate-400 text-sm">
                        🗓️ {formatarData(quiz.criado_em)}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      <span className="text-slate-500 text-sm block mb-1">Assuntos testados:</span>
                      {quiz.assuntos}
                    </p>
                  </div>

                  {/* Nota e Botão */}
                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                      <span className="text-sm text-slate-400 block">Acertos</span>
                      <span className={`text-3xl font-bold ${corNota}`}>
                        {quiz.pontuacao}<span className="text-lg text-slate-500">/{quiz.total}</span>
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => refazerTeste(quiz.disciplina)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-900/50 whitespace-nowrap"
                    >
                      Refazer ➔
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}