# TOV "KTK" Landing

Лендінг на Next.js + TypeScript для продажу щебеню та сипучих матеріалів.

## Запуск локально

```bash
npm install
npm run dev
```

Відкрити: [http://localhost:3000](http://localhost:3000)

## Змінні середовища

Створіть `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

`TELEGRAM_CHAT_ID` - це чат, куди надсилати заявки з форми.

## Структура

- `src/app/page.tsx` - головна сторінка лендінгу.
- `src/app/api/contact/route.ts` - API відправки заявки в Telegram.
- `src/data/products.ts` - каталог товарів.
- `src/data/services.ts` - блок послуг.
- `src/config/site.ts` - контакти та службові константи.
- `public/photos/*` - фото товарів та послуг.

## Перевірка

```bash
npm run lint
npm run build
```
