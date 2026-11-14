'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeLogin() {
  const router = useRouter();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const idGuardado = localStorage.getItem('jogadorId');
    const nomeGuardado = localStorage.getItem('jogadorNome');
    if (idGuardado && nomeGuardado) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha, modo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao autenticar.');
        setCarregando(false);
        return;
      }

      localStorage.setItem('jogadorId', String(data.id));
      localStorage.setItem('jogadorNome', data.nome);
      router.push('/dashboard');
    } catch {
      setErro('Erro de conexão com o servidor.');
      setCarregando(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-slate-100">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🎯</span>
          <h1 className="text-3xl font-bold text-white">Simulado ENEM</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Entra na tua conta para salvar o teu histórico e revisões
          </p>
        </div>

        {/* Alternador Entrar / Criar Conta */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => { setModo('login'); setErro(''); }}
            className={`py-2.5 rounded-xl font-bold text-sm transition ${
              modo === 'login'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setModo('cadastro'); setErro(''); }}
            className={`py-2.5 rounded-xl font-bold text-sm transition ${
              modo === 'cadastro'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Juliana"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {erro && (
            <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-3.5 rounded-xl text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl mt-2 transition shadow-lg"
          >
            {carregando
              ? 'Aguarda...'
              : modo === 'login'
              ? 'Entrar no Painel ➔'
              : 'Criar Conta e Entrar ➔'}
          </button>
        </form>

      </div>
    </main>
  );
}