import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Força a Vercel a não usar cache (queremos ver sempre os testes mais recentes)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Pega no ID do jogador que vem no endereço do navegador
    const { searchParams } = new URL(request.url);
    const jogadorId = searchParams.get('jogadorId');

    if (!jogadorId) {
      return NextResponse.json({ error: 'ID do jogador ausente' }, { status: 400 });
    }

    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    
    // Busca os testes e ordena pela data de criação (DESC = do mais novo para o mais velho)
    const { rows } = await pool.sql`
      SELECT * FROM quizzes 
      WHERE jogador_id = ${jogadorId} 
      ORDER BY criado_em DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: 'Falha ao buscar histórico' }, { status: 500 });
  }
}