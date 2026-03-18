import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'ТОВ "КТК" | Щебінь та сипучі матеріали',
  description: 'Поставка щебеню, піску та ЩПС з доставкою по Полтаві та області.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
