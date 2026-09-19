'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginScreen() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const iniciarJogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    
    // Guardamos o nome temporariamente no navegador da Juliana
    localStorage.setItem('jogadorNome', nome.trim());
    
    // Avançamos para o menu principal (que vamos criar a seguir)
    router.push('/dashboard');
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
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {loading ? 'A carregar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}