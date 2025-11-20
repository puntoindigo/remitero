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
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: 'Error al obtener commits', message: error.message },
      { status: 500 }
    );
  }
}

