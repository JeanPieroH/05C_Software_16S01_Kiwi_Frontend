
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import Logo from '@/components/shared/logo';
import { Button } from '@/components/ui/button'; // Keep for potential student view actions
import { Power } from 'lucide-react'; // Keep for potential student view actions
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true);
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        setUser(currentUser);
         // Role specific logic remains, e.g., for students
        if (currentUser.role !== 'TEACHER') {
            console.warn("User is not a teacher, showing student/other role overview.");
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    loadUserProfile();
  }, [router]);

  const handleLogout = () => { // Keep for student view
    // Assuming logoutUser is available or imported if needed for student view
    // For now, directly use the one from api if this page might be used by students
    // import { logoutUser } from '@/lib/api';
    // logoutUser();
    router.push('/login');
  };


  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect in useEffect
    // or the main layout's loading/auth check
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-destructive">Redirigiendo al login...</p>
      </div>
    );
  }
  
  // TEACHER OVERVIEW
  if (user.role === 'TEACHER') {
    return (
        <div className="p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-3xl font-headline text-primary mb-4">Bienvenido, {user.name}</h2>
            <p className="text-lg text-muted-foreground">Selecciona una opción del menú lateral para comenzar a gestionar tus clases y recursos.</p>
        </div>
    );
  }

  // STUDENT/OTHER ROLE OVERVIEW (Placeholder)
  // This part can be expanded for a student dashboard overview
  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background p-8">
        <Logo size="large" className="mb-4" />
        <h1 className="text-2xl font-semibold">Dashboard ({user.role.toLowerCase()})</h1>
        <p className="text-muted-foreground mt-2">Bienvenido, {user.name}. El resumen para tu rol estará disponible pronto.</p>
        <Button onClick={handleLogout} variant="outline" className="mt-6">
          <Power className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
  );
}
