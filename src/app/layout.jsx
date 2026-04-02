import './globals.css';

export const metadata = {
  title: 'Victory Learning Hub — AI-Powered Education',
  description: 'After-hours AI learning platform for Victory International Schools students',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)]">
        {children}
      </body>
    </html>
  );
}
