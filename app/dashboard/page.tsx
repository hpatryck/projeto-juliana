'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const router = useRouter();

  useEffect(() => {
    const nomeGuardado = localStorage.getItem('jogadorNome');
    const idGuardado = localStorage.getItem('jogadorId');
    
    if (nomeGuardado && idGuardado) {
      setNome(nomeGuardado);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!nome) return <div className="min-h-screen bg-slate-900"></div>;

  const fazerLogout = () => {
    localStorage.removeItem('jogadorNome');
    localStorage.removeItem('jogadorId');
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 p-4 md:p-6 text-slate-100 pb-10">
      <div className="w-full max-w-3xl mt-6 md:mt-10">
        
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-10 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Olá, {nome}! 👋</h1>
            <p className="text-emerald-400 mt-2 font-medium">Pronta para gabaritar o ENEM?</p>
          </div>
          <button 
            onClick={fazerLogout}
            className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl text-sm font-bold transition shadow-md"
          >
            Sair
          </button>
        </header>

        {/* Secção 1: Começar um Novo Treino */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-slate-300 px-2">Novo Treino</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* QUÍMICA */}
            <button 
              onClick={() => router.push('/quiz/quimica')}
              className="col-span-2 md:col-span-1 bg-slate-800 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-slate-700 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] group"
            >
              <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🧪</span>
              <span className="font-bold text-lg">Química</span>
            </button>

            {/* GEOGRAFIA (NOVO) */}
            <button 
              onClick={() => router.push('/quiz/geografia')}
              className="col-span-2 md:col-span-1 bg-slate-800 border-2 border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-slate-700 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)] group"
            >
              <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🌍</span>
              <span className="font-bold text-lg">Geografia</span>
            </button>

            {/* Disciplinas Futuras */}
            <button disabled className="col-span-2 md:col-span-1 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center opacity-40 cursor-not-allowed">
              <span className="text-5xl mb-3 grayscale">📐</span>
              <span className="font-bold text-slate-400">Matemática</span>
            </button>
            <button disabled className="col-span-2 md:col-span-1 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center opacity-40 cursor-not-allowed">
              <span className="text-5xl mb-3 grayscale">🧬</span>
              <span className="font-bold text-slate-400">Biologia</span>
            </button>

          </div>
        </section>

        {/* Secção 2: Ferramentas de Desempenho */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-slate-300 px-2">Central de Desempenho</h2>
          <div className="flex flex-col gap-4">
            
            {/* Histórico */}
            <button 
              onClick={() => router.push('/historico')}
              className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 flex items-center justify-between hover:bg-slate-700 hover:border-blue-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-blue-900/30 p-4 rounded-2xl text-3xl group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20">📜</div>
                <div className="text-left">
                  <h3 className="font-bold text-xl text-white mb-1">Histórico de Testes</h3>
                  <p className="text-slate-400 text-sm md:text-base">Vê os teus testes anteriores e repete os exames completos.</p>
                </div>
              </div>
              <span className="text-blue-500 font-bold text-2xl hidden md:block group-hover:translate-x-2 transition-transform">➔</span>
            </button>

            {/* Estatísticas */}
            <button 
              onClick={() => router.push('/estatisticas')}
              className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 flex items-center justify-between hover:bg-slate-700 hover:border-purple-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-purple-900/30 p-4 rounded-2xl text-3xl group-hover:scale-110 transition-transform shadow-inner border border-purple-500/20">📊</div>
                <div className="text-left">
                  <h3 className="font-bold text-xl text-white mb-1">Estatísticas e Gráficos</h3>
                  <p className="text-slate-400 text-sm md:text-base">Descobre onde és mais forte e o que precisa de mais atenção.</p>
                </div>
              </div>
              <span className="text-purple-500 font-bold text-2xl hidden md:block group-hover:translate-x-2 transition-transform">➔</span>
            </button>

            {/* Refazer Erros */}
            <button 
              onClick={() => router.push('/revisao')}
              className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 flex items-center justify-between hover:bg-slate-700 hover:border-red-500/50 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-red-900/30 p-4 rounded-2xl text-3xl group-hover:scale-110 transition-transform shadow-inner border border-red-500/20">⚠️</div>
                <div className="text-left">
                  <h3 className="font-bold text-xl text-white mb-1">Cofre de Revisão</h3>
                  <p className="text-slate-400 text-sm md:text-base">Pratica novamente apenas as questões que erraste antes.</p>
                </div>
              </div>
              <span className="text-red-500 font-bold text-2xl hidden md:block group-hover:translate-x-2 transition-transform relative z-10">➔</span>
            </button>

          </div>
        </section>

      </div>
    </main>
  );
}