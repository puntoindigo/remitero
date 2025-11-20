import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface Commit {
  hash: string;
  date: string;
  message: string;
  author: string;
}

export async function GET() {
  try {
    // En producción (Vercel), git puede no estar disponible
    // Verificar si estamos en un entorno donde git está disponible
    const isVercel = !!process.env.VERCEL;
    
    if (isVercel) {
      // En Vercel, devolver commits vacíos o un mensaje informativo
      // Los commits no están disponibles en el entorno de producción
      return NextResponse.json({ 
        commits: [],
        message: 'Los commits no están disponibles en el entorno de producción'
      }, { status: 200 });
    }

    // Obtener los últimos 50 commits
    const { stdout } = await execAsync(
      'git log --pretty=format:"%H|%ai|%an|%s" -50',
      { cwd: process.cwd() }
    );

    const commits: Commit[] = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, date, author, ...messageParts] = line.split('|');
        return {
          hash: hash?.trim() || '',
          date: date?.trim() || '',
          author: author?.trim() || '',
          message: messageParts.join('|').trim() || ''
        };
      })
      .filter(commit => commit.hash && commit.message);

    return NextResponse.json({ commits }, { status: 200 });
  } catch (error: any) {
    // Si hay error, devolver array vacío en lugar de error 500
    // Esto permite que el modal funcione aunque no haya commits
    console.warn('Error fetching commits (continuando sin commits):', error.message);
    return NextResponse.json({ 
      commits: [],
      message: 'No se pudieron cargar los commits'
    }, { status: 200 });
  }
}

