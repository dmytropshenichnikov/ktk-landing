import { NextResponse } from 'next/server';

type ContactPayload = {
  name?: string;
  phone?: string;
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
    const product = normalize(body.product);
    const message = normalize(body.message);

    if (!name || !phone) {
      return NextResponse.json({ error: "Ім'я та телефон обов'язкові." }, { status: 400 });
    }

    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Невірний формат телефону.' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in env');
      return NextResponse.json(
        { error: 'Сервер не налаштований для відправки повідомлень.' },
        { status: 500 },
      );
    }

    const textLines = [
      '<b>Нова заявка з сайту ТОВ "КТК"</b>',
      `<b>Ім'я: ${name}</b>`,
      `<b>Телефон: ${phone}</b>`,
      product ? `<b>Матеріал: ${product}</b>` : '<b>Матеріал: не вказано</b>',
      message ? `<b>Коментар: ${message}</b>` : '<b>Коментар: -</b>',
      `<b>Час: ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}</b>`,
    ];

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: textLines.join('\n'),
        parse_mode: 'HTML'
      }),
    });

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      console.error('Telegram API error:', error);
      return NextResponse.json({ error: 'Не вдалося передати заявку в Telegram.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера.' }, { status: 500 });
  }
}
