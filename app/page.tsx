'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !senha.trim()) return;

    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao entrar.');
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
        <h1 className="text-3xl font-bold text-white text-center mb-2">Quiz ENEM</h1>
        <p className="text-slate-400 text-center mb-8">Identifica-te para começar</p>

        <form onSubmit={handleEntrar} className="flex flex-col gap-4">
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition"
          />

          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition"
          />

          {erro && (
            <p className="text-red-400 text-sm text-center font-medium">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition mt-2"
          >
            {carregando ? 'A entrar...' : 'Entrar ➔'}
          </button>
        </form>
      </div>
    </main>
  );
}