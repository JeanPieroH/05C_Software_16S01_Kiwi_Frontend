
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/api';
import type { User } from '@/types/auth';
import TeacherClassroomsSection from '@/components/dashboard/teacher/classrooms-section';
import StudentClassroomsSection from '@/components/dashboard/student/classrooms-section'; // New
import { Skeleton } from '@/components/ui/skeleton';

export default function UserClassroomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        setUser(currentUser);
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
          {/* Skeleton for create button might be here for teachers */}
          <Skeleton className="h-10 w-32" /> 
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
            ))}
        </div>
      </div>
    );
  }
  if (!user) {
     return <p className="text-center text-muted-foreground">Usuario no autenticado. Redirigiendo...</p>;
  }

  if (user.role === 'TEACHER') {
    return <TeacherClassroomsSection userId={user.id} />;
  }

  if (user.role === 'STUDENT') {
    return <StudentClassroomsSection userId={user.id} />;
  }
  
  // Fallback if user role is neither TEACHER nor STUDENT (shouldn't happen with current roles)
  router.push('/dashboard');
  return <p className="text-center text-muted-foreground">Rol de usuario no reconocido para esta página.</p>;
}


function CardSkeleton() {
  return (
    <div className="shadow-md rounded-lg p-4 space-y-3 border bg-card">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
      {/* Skeletons for action buttons might be here for teachers */}
      <div className="flex justify-end gap-2 pt-2">
        {/* <Skeleton className="h-8 w-20" /> 
        <Skeleton className="h-8 w-20" /> */}
      </div>
    </div>
  );
}
