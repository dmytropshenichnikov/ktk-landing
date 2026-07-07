import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';

export const metadata: Metadata = {
  title: 'ТОВ "КТК" | Щебінь та сипучі матеріали',
  description: 'Поставка щебеню, піску та ЩПС з доставкою по Полтаві та області.',
  icons: {
    icon: '/site_icon.png',
    shortcut: '/site_icon.png',
    apple: '/site_icon.png',
  },
  openGraph: {
    title: 'ТОВ "КТК" | Щебінь та сипучі матеріали',
    description: 'Поставка щебеню, піску та ЩПС з доставкою по Полтаві та області.',
    type: 'website',
    url: 'https://ktkpoltava.com.ua/', // Placeholder URL - typically domain for the project
    images: [
      {
        url: '/photos/kamaz-hero.jpg', // Using hero image for OG
        width: 1200,
        height: 630,
        alt: 'ТОВ "КТК" Доставка будматеріалів',
      },
    ],
  },
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
          src="https://www.googletagmanager.com/gtag/js?id=AW-18199730227"
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18199730227');
          `}
        </Script>
        <Script
          src="https://apis.google.com/js/platform.js"
          strategy="afterInteractive"
        />
        <Script id="merchant-widget" src="https://www.gstatic.com/shopping/merchant/merchantwidget.js" strategy="lazyOnload" />
        <Script id="merchant-widget-init" strategy="lazyOnload">
          {`
            window.addEventListener('load', function () {
              if (window.merchantwidget) {
                window.merchantwidget.start({
                  merchant_id: 5698959504,
                  position: 'LEFT_BOTTOM'
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
