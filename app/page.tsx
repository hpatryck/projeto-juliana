'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginScreen() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  // Se já houver um ID guardado de sessões anteriores, pode saltar o login no futuro
  useEffect(() => {
    const jogadorId = localStorage.getItem('jogadorId');
    if (jogadorId) {
      // Opcional: router.push('/dashboard'); 
      // Por enquanto vamos deixar comentado para poder testar o botão à vontade
    }
  }, [router]);

  const iniciarJogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!nome.trim()) return;

    setLoading(true);
    
    try {
      // Chama a nossa nova API de login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao entrar');
      }

      // LOGIN RÍGIDO: Guardamos o ID oficial da base de dados e o nome!
      localStorage.setItem('jogadorId', data.id);
      localStorage.setItem('jogadorNome', data.nome);
      
      router.push('/dashboard');
    } catch (err: any) {
      setErro(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-slate-100">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2">PROJETO JULIANA</h1>
        <p className="text-center text-slate-400 mb-8">Hi! What's ur name?</p>
        
        <form onSubmit={iniciarJogo} className="flex flex-col gap-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Name"
            className="bg-slate-700 border border-slate-600 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            required
            autoComplete="off"
            disabled={loading}
          />
          
          {erro && <p className="text-red-400 text-sm text-center">{erro}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {loading ? 'A conectar à base de dados...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}