"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import Logo from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        setUser(currentUser);
        // If user is authenticated, redirect to dashboard.
        // This logic can be expanded for a more complex home page.
        router.push('/dashboard');
      } else {
        // If not authenticated, redirect to login.
        router.push('/login');
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Logo size="large" className="mb-4 animate-pulse" />
        <p className="text-lg text-muted-foreground">Cargando KIWI Classroom...</p>
      </div>
    );
  }

  // This part will typically not be reached due to redirects,
  // but serves as a fallback or if the logic changes to show a landing page.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
      <Logo size="large" className="mb-8" />
      <h1 className="text-4xl font-bold font-headline text-primary mb-4">Bienvenido a KIWI Classroom</h1>
      <p className="text-xl text-foreground/80 mb-8 max-w-2xl">
        Tu espacio para aprender, crear, y crecer. Da tu primer paso ingresando o registrando una cuenta.
      </p>
      <div className="space-x-4">
        <Button onClick={() => router.push('/login')} size="lg">Login</Button>
        <Button onClick={() => router.push('/register')} variant="outline" size="lg">Register</Button>
      </div>
    </div>
  );
}
