
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import ProfileSection from '@/components/dashboard/teacher/profile-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfilePage() {
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
            // Redirect non-teachers or show an access denied message
            router.push('/dashboard'); // Or a specific page for other roles
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
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-4 pt-6 border-b pb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
        <div className="border-t pt-6 flex justify-end">
            <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    // User is not a teacher or not logged in, handled by redirect or layout.
    // Or show specific message for non-teachers if they land here.
    return <p className="text-center text-muted-foreground">Perfil no disponible para este rol o usuario no autenticado.</p>;
  }

  return <ProfileSection user={user} />;
}
