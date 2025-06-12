
"use client";

import { useEffect, useState } from "react";
import { fetchTeacherCompetencies } from "@/lib/api";
import type { Competency } from "@/types/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Edit3, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateCompetencyDialog from "./create-competency-dialog";
import EditCompetencyDialog from "./edit-competency-dialog"; // Import the new dialog
import { useToast } from "@/hooks/use-toast";


interface CompetenciesSectionProps {
  userId: string;
}

export default function CompetenciesSection({ userId }: CompetenciesSectionProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isCreateCompetencyDialogOpen, setIsCreateCompetencyDialogOpen] = useState(false);
  const [isEditCompetencyDialogOpen, setIsEditCompetencyDialogOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);


  async function loadCompetencies() {
    try {
      setLoading(true);
      setError(null);
      const fetchedCompetencies = await fetchTeacherCompetencies(userId);
      setCompetencies(fetchedCompetencies);
    } catch (err) {
      setError("Error al cargar las competencias. Intente de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadCompetencies();
    }
  }, [userId]);

  const handleCompetencyCreated = (newCompetency: Competency) => {
    loadCompetencies();
  };

  const handleOpenEditDialog = (competency: Competency) => {
    setEditingCompetency(competency);
    setIsEditCompetencyDialogOpen(true);
  };

  const handleCompetencyUpdated = (updatedCompetency: Competency) => {
     loadCompetencies(); 
  };


  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-10 w-36" />
        </div>
        {[...Array(2)].map((_, i) => (
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
        <h2 className="text-3xl font-headline text-primary">Mis Competencias</h2>
        <Button onClick={() => setIsCreateCompetencyDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Añadir Competencia
        </Button>
      </div>
      {competencies.length === 0 ? (
         <Card className="shadow-md text-center">
          <CardHeader>
            <CardTitle>No hay competencias</CardTitle>
          </CardHeader>
          <CardContent>
            <Target className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">Aún no has añadido ninguna competencia.</p>
            <Button className="mt-4" onClick={() => setIsCreateCompetencyDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Añadir mi primera competencia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {competencies.map((competency) => (
            <Card key={competency.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-accent" />
                  {competency.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{competency.description}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(competency)}>
                        <Edit3 className="mr-1 h-4 w-4" /> Editar
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="bg-destructive/80 hover:bg-destructive"
                        onClick={() => toast({title: "Funcionalidad no implementada", description: `La eliminación de ${competency.name} aún no está disponible.`, variant: "default"})}
                    >
                        <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <CreateCompetencyDialog
        userId={userId}
        open={isCreateCompetencyDialogOpen}
        onOpenChange={setIsCreateCompetencyDialogOpen}
        onCompetencyCreated={handleCompetencyCreated}
      />
      <EditCompetencyDialog
        competency={editingCompetency}
        open={isEditCompetencyDialogOpen}
        onOpenChange={setIsEditCompetencyDialogOpen}
        onCompetencyUpdated={handleCompetencyUpdated}
      />
    </div>
  );
}

