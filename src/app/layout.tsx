import type { Metadata } from 'next';
import Script from 'next/script';

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
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18027445545"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18027445545');
          `}
        </Script>
      </body>
    </html>
  );
}
