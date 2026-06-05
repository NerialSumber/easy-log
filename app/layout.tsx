import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
