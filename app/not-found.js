// custom 404 not found page
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <span className="text-6xl font-serif font-bold text-gray-300 mb-2">404</span>
      <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        The milk delivery route you followed does not exist. Check the URL or return to the main gate.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
