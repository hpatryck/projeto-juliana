'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Recupera o nome guardado no navegador durante o Login
    const nomeGuardado = localStorage.getItem('jogadorNome');
    if (nomeGuardado) {
      setNome(nomeGuardado);
    } else {
      // Se por algum motivo não houver nome, recua para o ecrã inicial
      router.push('/');
    }
  }, [router]);

  // Enquanto o nome não carrega, evita que o ecrã pisque
  if (!nome) return <div className="min-h-screen bg-slate-900"></div>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 p-6 text-slate-100">
      <div className="w-full max-w-md mt-10">
        
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Hi, {nome}!</h1>
          <button 
            onClick={() => { localStorage.removeItem('jogadorNome'); router.push('/'); }}
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Sair
          </button>
        </header>

        {/* Secção de Escolha de Disciplina */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Study today?</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <button 
              onClick={() => router.push('/quiz/quimica')}
              className="bg-slate-800 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col items-center hover:bg-slate-700 hover:scale-105 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <span className="text-4xl mb-3">🧪</span>
              <span className="font-bold text-lg">Química</span>
            </button>

            {/* Disciplinas em breve (desativadas) */}
            <button disabled className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col items-center opacity-50 cursor-not-allowed">
              <span className="text-4xl mb-3">📐</span>
              <span className="font-bold">Matemática</span>
            </button>
            <button disabled className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col items-center opacity-50 cursor-not-allowed">
              <span className="text-4xl mb-3">⚡</span>
              <span className="font-bold">Física</span>
            </button>
            <button disabled className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col items-center opacity-50 cursor-not-allowed">
              <span className="text-4xl mb-3">🧬</span>
              <span className="font-bold">Biologia</span>
            </button>
          </div>
        </section>

        {/* Histórico de Quizzes Recentes */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Ur latest quizzes</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-500">
            Ainda não fizeste nenhum teste hoje. Vamos começar?
          </div>
        </section>

      </div>
    </main>
  );
}