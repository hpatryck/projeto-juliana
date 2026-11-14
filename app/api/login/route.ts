import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function hashSenha(senha: string) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { nome, senha, modo } = await request.json();

    if (!nome || typeof nome !== 'string' || !senha || typeof senha !== 'string') {
      return NextResponse.json({ error: 'Preenche o nome e a senha corretamente.' }, { status: 400 });
    }

    const nomeFormatado = nome.trim();
    const senhaCriptografada = hashSenha(senha);
    const pool = createPool({ connectionString: process.env.DATABASE_URL });

    // MODO CADASTRO: cria uma conta nova com senha
    if (modo === 'cadastro') {
      const existente = await pool.sql`
        SELECT id FROM jogadores WHERE LOWER(nome) = LOWER(${nomeFormatado})
      `;

      if (existente.rows.length > 0) {
        return NextResponse.json(
          { error: 'Esse nome já está em uso. Escolhe outro ou faz login.' },
          { status: 409 }
        );
      }

      const novoJogador = await pool.sql`
        INSERT INTO jogadores (nome, senha)
        VALUES (${nomeFormatado}, ${senhaCriptografada})
        RETURNING id, nome
      `;

      return NextResponse.json(novoJogador.rows[0]);
    }

    // MODO LOGIN: valida usuário e senha existentes
    const result = await pool.sql`
      SELECT id, nome, senha FROM jogadores WHERE LOWER(nome) = LOWER(${nomeFormatado})
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. Cria uma conta primeiro!' },
        { status: 404 }
      );
    }

    const jogador = result.rows[0];

    if (!jogador.senha) {
      return NextResponse.json(
        { error: 'Conta antiga sem senha cadastrada. Atualiza a senha no banco ou cria uma nova conta.' },
        { status: 401 }
      );
    }

    if (jogador.senha !== senhaCriptografada) {
      return NextResponse.json(
        { error: 'Senha incorreta.' },
        { status: 401 }
      );
    }

    // Devolve o ID e o nome para serem guardados no localStorage
    return NextResponse.json({ id: jogador.id, nome: jogador.nome });

  } catch (error) {
    console.error('Erro no Login:', error);
    return NextResponse.json({ error: 'Falha ao conectar com o banco de dados.' }, { status: 500 });
  }
}