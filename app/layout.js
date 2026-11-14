// root layout - wraps everything, sets up fonts, navbar, and global providers
import { Lora, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ClientProviders from '@/components/ClientProviders';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'DoodhWala - Fresh Cow Milk Delivery',
    template: '%s | DoodhWala',
  },
  description:
    'Fresh desi cow milk delivered to your doorstep every morning in Fatehgarh Sahib, Mandi Gobindgarh and Amloh.',
};

export default async function RootLayout({ children }) {
  // get server-side session for fast hydration without layout shift
  let initialUser = null;
  const session = await getSession();
  if (session?.userId) {
    try {
      initialUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          area: true,
          address: true,
          walletBalance: true,
        },
      });
    } catch {
      initialUser = null;
    }
  }

  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-cream text-foreground antialiased font-sans">
        <ClientProviders initialUser={initialUser}>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
