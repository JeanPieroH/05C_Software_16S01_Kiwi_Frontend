
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchTeacherClassrooms } from "@/lib/api";
import type { Classroom } from "@/types/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, School, Edit3, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateClassroomDialog from "./create-classroom-dialog";

interface ClassroomsSectionProps {
  userId: string;
}

export default function ClassroomsSection({ userId }: ClassroomsSectionProps) {
  const [classrooms, setClassrooms] = useState<Omit<Classroom, 'quiz' | 'competences'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isCreateClassroomDialogOpen, setIsCreateClassroomDialogOpen] = useState(false);

  async function loadClassrooms() {
    try {
      setLoading(true);
      setError(null);
      const fetchedClassrooms = await fetchTeacherClassrooms(userId);
      setClassrooms(fetchedClassrooms);
    } catch (err) {
      setError("Error al cargar los salones. Intente de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadClassrooms();
    }
  }, [userId]);

  const handleClassroomCreated = (newClassroom: Omit<Classroom, 'quiz' | 'competences'>) => {
    loadClassrooms();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline text-primary">Mis Classrooms</h2>
        <Button onClick={() => setIsCreateClassroomDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Crear Classroom
        </Button>
      </div>
      {classrooms.length === 0 ? (
        <Card className="shadow-md text-center">
          <CardHeader>
            <CardTitle>No hay classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <School className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">Aún no has creado ningún classroom.</p>
            <Button className="mt-4" onClick={() => setIsCreateClassroomDialogOpen(true)}>
             <PlusCircle className="mr-2 h-5 w-5" /> Crear mi primer Classroom
            </Button>
          </CardContent>
        </Card>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <Link key={classroom.id} href={`/dashboard/classrooms/${classroom.id}`} passHref legacyBehavior>
              <a className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
                <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer">
                  <CardHeader className="flex-grow">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <School className="h-6 w-6 text-accent" />
                      {classroom.name}
                    </CardTitle>
                    <CardDescription>{classroom.description || "Sin descripción"}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); alert(`Editar ${classroom.name} (Funcionalidad no implementada)`);}}
                      aria-label={`Editar ${classroom.name}`}
                    >
                      <Edit3 className="mr-1 h-4 w-4" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="bg-destructive/80 hover:bg-destructive" 
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); alert(`Eliminar ${classroom.name} (Funcionalidad no implementada)`);}}
                      aria-label={`Eliminar ${classroom.name}`}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      )}
      <CreateClassroomDialog
        userId={userId}
        open={isCreateClassroomDialogOpen}
        onOpenChange={setIsCreateClassroomDialogOpen}
        onClassroomCreated={handleClassroomCreated}
      />
    </div>
  );
}
