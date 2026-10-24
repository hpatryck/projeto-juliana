import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    
    const { rows: perguntas } = await pool.sql`SELECT * FROM perguntas WHERE disciplina = 'Química'`;
    const { rows: alternativas } = await pool.sql`SELECT * FROM alternativas`;

    const questoesCompletas = perguntas.map(pergunta => {
      // Filtra as alternativas desta pergunta e embaralha a ordem delas de forma aleatória
      const alternativasEmbaralhadas = alternativas
        .filter(alt => alt.pergunta_id === pergunta.id)
        .sort(() => Math.random() - 0.5);

      return {
        ...pergunta,
        alternativas: alternativasEmbaralhadas
      };
    });

    // Sorteia também a ordem das próprias perguntas para o quiz nunca ser repetitivo!
    const questoesEmbaralhadas = questoesCompletas.sort(() => Math.random() - 0.5);

    return NextResponse.json(questoesEmbaralhadas);
  } catch (error) {
    console.error("Erro de BD:", error);
    return NextResponse.json({ error: 'Erro ao carregar as questões' }, { status: 500 });
  }
}