'use client';
import QrCodeApp from '@/components/qr-code-app';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <QrCodeApp />
    </main>
  );
}
