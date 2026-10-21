import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Garante que a Vercel não guarda as respostas em cache e vai sempre buscar a versão mais recente
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Vai buscar as perguntas e as alternativas
    const { rows: perguntas } = await sql`SELECT * FROM perguntas WHERE disciplina = 'Química' ORDER BY id ASC`;
    const { rows: alternativas } = await sql`SELECT * FROM alternativas`;

    // Junta as alternativas dentro da respetiva pergunta
    const questoesCompletas = perguntas.map(pergunta => ({
      ...pergunta,
      alternativas: alternativas.filter(alt => alt.pergunta_id === pergunta.id)
    }));

    return NextResponse.json(questoesCompletas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar as questões' }, { status: 500 });
  }
}