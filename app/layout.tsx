import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Easy-Log',
  description: 'Sistema integrado para controle de marcenaria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('tema_noturno')==='true')document.body.classList.add('dark-theme');if(localStorage.getItem('fonte_maior')==='true')document.documentElement.classList.add('large-font')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
