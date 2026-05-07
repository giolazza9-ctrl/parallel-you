'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EndingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/story');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-neutral-600 text-sm">Redirecting...</p>
    </div>
  );
}
