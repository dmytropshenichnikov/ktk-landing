import { NextResponse } from 'next/server';
import sql from '@/lib/db';

type ContactPayload = {
  name?: string;
  phone?: string;
  email?: string;
  product?: string;
  message?: string;
};

const phoneRegex = /^[0-9+()\s-]{8,20}$/;

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = normalize(body.name);
    const phone = normalize(body.phone);
    const email = normalize(body.email);
    const product = normalize(body.product);
    const message = normalize(body.message);

    if (!name || !phone) {
      return NextResponse.json({ error: "Ім'я та телефон обов'язкові." }, { status: 400 });
    }

    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Невірний формат телефону.' }, { status: 400 });
    }

    // Save to database
    try {
      // Ensure applications table exists (auto-migrate)
      await sql(`CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        product TEXT DEFAULT '',
        message TEXT DEFAULT '',
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`).catch(() => {});
      
      await sql(`INSERT INTO applications (name, phone, email, product, message, status) 
        VALUES ($1, $2, $3, $4, $5, 'new')`,
        [name, phone, email, product, message]);
    } catch (dbError) {
      console.error('DB save error:', dbError);
      // Non-fatal - continue to Telegram
    }

    // Save to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const textLines = [
        '<b>Нова заявка з сайту ТОВ "КТК"</b>',
        `<b>Ім'я:</b> ${name}`,
        `<b>Телефон:</b> ${phone}`,
        email ? `<b>Email:</b> ${email}` : '<b>Email: не вказано</b>',
        product ? `<b>Матеріал:</b> ${product}` : '<b>Матеріал: не вказано</b>',
        message ? `<b>Коментар:</b> ${message}` : '<b>Коментар: -</b>',
        `<b>Час:</b> ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`,
      ];

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: textLines.join('\n'), parse_mode: 'HTML' }),
        });
      } catch (tgError) {
        console.error('Telegram error:', tgError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера.' }, { status: 500 });
  }
}
