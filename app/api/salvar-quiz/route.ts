import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { jogadorId, disciplina, assuntos, pontuacao, total, tempoGasto, erros } = data;

    if (!jogadorId) return NextResponse.json({ error: 'Sem ID' }, { status: 400 });

    const pool = createPool({ connectionString: process.env.DATABASE_URL });

    // 1. Grava o Quiz no Histórico
    const assuntosString = assuntos.join(', ');
    await pool.sql`
      INSERT INTO quizzes (jogador_id, disciplina, assuntos, pontuacao, total, tempo_gasto)
      VALUES (${jogadorId}, ${disciplina}, ${assuntosString}, ${pontuacao}, ${total}, ${tempoGasto})
    `;

    // 2. Guarda as questões erradas no Cofre da Juliana
    if (erros && erros.length > 0) {
      for (const perguntaId of erros) {
        await pool.sql`
          INSERT INTO questoes_erradas (jogador_id, pergunta_id)
          VALUES (${jogadorId}, ${perguntaId})
          ON CONFLICT (jogador_id, pergunta_id) DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return NextResponse.json({ error: 'Falha ao salvar relatorio' }, { status: 500 });
  }
}