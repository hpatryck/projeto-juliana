import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nome } = await request.json();
    
    if (!nome || typeof nome !== 'string') {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 });
    }

    const nomeFormatado = nome.trim();
    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    
    // 1. Tenta encontrar o jogador na base de dados
    let result = await pool.sql`SELECT * FROM jogadores WHERE nome = ${nomeFormatado}`;
    
    // 2. Se não existir, cria um novo perfil
    if (result.rows.length === 0) {
      result = await pool.sql`
        INSERT INTO jogadores (nome) 
        VALUES (${nomeFormatado}) 
        RETURNING *
      `;
    }
    
    // 3. Devolve os dados do jogador (incluindo o ID único gerado pelo PostgreSQL)
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Erro no Login:", error);
    return NextResponse.json({ error: 'Falha ao conectar com o banco de dados.' }, { status: 500 });
  }
}