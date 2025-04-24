import './globals.css'; // Global CSS dosyanız
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hava Nasıl',
  description: 'En güncel hava durumu bilgileri',
  manifest: '/manifest.json',
};

function RootLayout({ children }: { children: React.ReactNode }) {

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker kaydedildi:', registration);
          })
          .catch((error) => {
            console.error('Service Worker kaydetme başarısız oldu:', error);
          });
      });
    }

  return (
    <html lang="tr">
      <head>
        {/* Metadata head içinde tanımlandı */}
      </head>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;