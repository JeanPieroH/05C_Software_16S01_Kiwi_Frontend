
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import Logo from '@/components/shared/logo';
import { Button } from '@/components/ui/button'; 
import { Power, Award, Coins } from 'lucide-react'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';


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
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    loadUserProfile();
  }, [router]);

  const handleLogout = () => { 
    logoutUser();
    router.push('/login');
  };


  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-destructive">Redirigiendo al login...</p>
      </div>
    );
  }
  
  if (user.role === 'TEACHER') {
    return (
        <div className="p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-3xl font-headline text-primary mb-4">Bienvenido, {user.name}</h2>
            <p className="text-lg text-muted-foreground">Selecciona una opción del menú lateral para comenzar a gestionar tus clases y recursos.</p>
        </div>
    );
  }

  // STUDENT OVERVIEW
  if (user.role === 'STUDENT') {
    return (
        <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-primary/20 to-background">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">¡Bienvenido de nuevo, {user.name}!</CardTitle>
                    <CardDescription className="text-lg">Explora tus clases, revisa tu progreso y personaliza tu avatar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                    <Image 
                        src="https://placehold.co/300x200.png" // Replace with a relevant student-dashboard image
                        alt="Student Dashboard Illustration" 
                        width={300} 
                        height={200} 
                        className="rounded-lg shadow-md"
                        data-ai-hint="learning education"
                    />
                    <div className="space-y-3">
                        <p className="text-muted-foreground">Usa el menú lateral para navegar.</p>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center text-yellow-500">
                                <Coins className="mr-2 h-6 w-6" />
                                <span className="text-xl font-semibold">{user.coin_available || 0}</span>
                                <span className="ml-1 text-sm text-muted-foreground">monedas</span>
                            </div>
                             <div className="flex items-center text-amber-600">
                                <Award className="mr-2 h-6 w-6" />
                                <span className="text-xl font-semibold">{user.coin_earned || 0}</span>
                                <span className="ml-1 text-sm text-muted-foreground">puntos totales</span>
                            </div>
                        </div>
                        {user.emotion && (
                             <p className="text-sm text-accent-foreground bg-accent/30 p-2 rounded-md inline-block">
                                Estado de ánimo actual: <span className="font-semibold">{user.emotion}</span>
                             </p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl">Mis Clases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Accede a tus classrooms, revisa el material y completa tus actividades.</p>
                        <Button onClick={() => router.push('/dashboard/classrooms')}>Ir a Mis Classrooms</Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl">Tienda de Avatares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">¡Personaliza tu experiencia! Usa tus monedas para obtener nuevos avatares.</p>
                        <Button onClick={() => router.push('/dashboard/store')}>Visitar Tienda</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  // Fallback for any other role or unexpected scenario
  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background p-8">
        <Logo size="large" className="mb-4" />
        <h1 className="text-2xl font-semibold">Dashboard ({user.role.toLowerCase()})</h1>
        <p className="text-muted-foreground mt-2">Bienvenido, {user.name}.</p>
        <Button onClick={handleLogout} variant="outline" className="mt-6">
          <Power className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
  );
}
