import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(req: NextRequest, ctx: { params: Promise<{ number: string }> }) {
  const { number } = await ctx.params;
  const origin = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';
  const url = `${origin}/remitos/number/${number}/print?pdf=1`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('[data-print-wrapper]', { timeout: 30000 });
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: true,
    });

    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
    const blob = new Blob([arrayBuffer as unknown as BlobPart], { type: 'application/pdf' });
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="remito-${number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(`Error generando PDF: ${err?.message || String(err)}`, { status: 500 });
  } finally {
    try { await browser?.close(); } catch {}
  }
}
