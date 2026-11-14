// Next.js App Router metadata route: robots.txt
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doodhwala.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
