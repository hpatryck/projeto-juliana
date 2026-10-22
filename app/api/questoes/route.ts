import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Forçamos a ligação usando a variável que já existe no seu .env
    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    
    const { rows: perguntas } = await pool.sql`SELECT * FROM perguntas WHERE disciplina = 'Química' ORDER BY id ASC`;
    const { rows: alternativas } = await pool.sql`SELECT * FROM alternativas`;

    const questoesCompletas = perguntas.map(pergunta => ({
      ...pergunta,
      alternativas: alternativas.filter(alt => alt.pergunta_id === pergunta.id)
    }));

    return NextResponse.json(questoesCompletas);
  } catch (error) {
    // Imprime o erro real no terminal do VS Code para conseguirmos ver se algo falhar
    console.error("Erro de BD:", error);
    return NextResponse.json({ error: 'Erro ao carregar as questões' }, { status: 500 });
  }
}