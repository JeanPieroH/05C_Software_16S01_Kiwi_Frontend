
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchStudentClassrooms } from "@/lib/api";
import type { Classroom } from "@/types/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentClassroomsSectionProps {
  userId: string;
}

export default function StudentClassroomsSection({ userId }: StudentClassroomsSectionProps) {
  const [classrooms, setClassrooms] = useState<Omit<Classroom, 'quiz' | 'competences'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadClassrooms() {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        const fetchedClassrooms = await fetchStudentClassrooms(userId);
        setClassrooms(fetchedClassrooms);
      } catch (err) {
        setError("Error al cargar tus salones. Intenta de nuevo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClassrooms();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <div className="mt-4 flex justify-end">
                    <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center py-10">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline text-primary">Mis Classrooms</h2>
      </div>
      {classrooms.length === 0 ? (
        <Card className="shadow-md text-center">
          <CardHeader>
            <CardTitle>No estás inscrito en ningún classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <School className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">
              Aún no te han añadido a ningún classroom. Contacta a tu profesor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <Link href={`/dashboard/classrooms/${classroom.id}`}>
            <Card key={classroom.id} className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <School className="h-6 w-6 text-accent" />
                  {classroom.name}
                </CardTitle>
                <CardDescription>{classroom.description || "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/classrooms/${classroom.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ingresar
                  </Link>
                </Button>
              </CardContent>
            </Card></Link>
          ))}
        </div>
      )}
    </div>
  );
}
