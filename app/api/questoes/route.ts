import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    
    // O SEGREDO ESTÁ AQUI: Removemos o "WHERE disciplina = 'Química'"
    // Agora o sistema puxa TODAS as perguntas do banco de dados!
    const { rows: perguntas } = await pool.sql`SELECT * FROM perguntas`;
    const { rows: alternativas } = await pool.sql`SELECT * FROM alternativas`;

    const questoesCompletas = perguntas.map(pergunta => {
      const alternativasEmbaralhadas = alternativas
        .filter(alt => alt.pergunta_id === pergunta.id)
        .sort(() => Math.random() - 0.5);

      return {
        ...pergunta,
        alternativas: alternativasEmbaralhadas
      };
    });

    const questoesEmbaralhadas = questoesCompletas.sort(() => Math.random() - 0.5);

    return NextResponse.json(questoesEmbaralhadas);
  } catch (error) {
    console.error("Erro de BD:", error);
    return NextResponse.json({ error: 'Erro ao carregar as questões' }, { status: 500 });
  }
}