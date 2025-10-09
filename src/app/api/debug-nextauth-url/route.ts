import { NextResponse } from 'next/server'

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL
  
  return NextResponse.json({
    nextAuthUrl: nextAuthUrl,
    nextAuthUrlLength: nextAuthUrl?.length,
    nextAuthUrlChars: nextAuthUrl?.split('').map((char, index) => ({
      index,
      char,
      charCode: char.charCodeAt(0),
      isNewline: char === '\n',
      isCarriageReturn: char === '\r'
    })),
    hasNewline: nextAuthUrl?.includes('\n'),
    hasCarriageReturn: nextAuthUrl?.includes('\r'),
    trimmed: nextAuthUrl?.trim(),
    trimmedLength: nextAuthUrl?.trim().length
  })
}
