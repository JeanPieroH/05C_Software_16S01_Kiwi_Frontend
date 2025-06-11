
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import CompetenciesSection from '@/components/dashboard/teacher/competencies-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserCompetenciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        if (currentUser.role === 'TEACHER') {
            setUser(currentUser);
        } else {
            router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  if (loading) {
     return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
                <CardCompetencySkeleton key={i}/>
            ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Competencias no disponibles para este rol o usuario no autenticado.</p>;
  }

  return <CompetenciesSection userId={user.id} />;
}

function CardCompetencySkeleton() {
    return (
        <div className="shadow-md rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}
