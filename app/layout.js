// root layout - wraps everything, sets up fonts and global providers
import { Lora, Inter } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-cream text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
