
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { fetchTeacherCompetencies, updateClassroomCompetencies } from '@/lib/api';
import type { Competency, Classroom } from '@/types/entities';
import { ArrowLeftRight, CheckCircle2, PlusCircle, Loader2, BookCopy, AlertTriangle } from 'lucide-react';

interface AssignCompetenciesDialogProps {
  classroomId: string;
  teacherId: string;
  initiallyAssignedCompetencies: Competency[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentsSaved: (updatedClassroom: Classroom) => void;
}

export default function AssignCompetenciesDialog({
  classroomId,
  teacherId,
  initiallyAssignedCompetencies,
  open,
  onOpenChange,
  onAssignmentsSaved,
}: AssignCompetenciesDialogProps) {
  const { toast } = useToast();
  const [allTeacherComps, setAllTeacherComps] = useState<Competency[]>([]);
  const [assignedInDialog, setAssignedInDialog] = useState<Competency[]>([]);
  const [loadingTeacherComps, setLoadingTeacherComps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAssignedInDialog([...initiallyAssignedCompetencies]); // Reset with initial on open
      setLoadingTeacherComps(true);
      setError(null);
      fetchTeacherCompetencies(teacherId)
        .then(setAllTeacherComps)
        .catch(err => {
          console.error("Failed to fetch teacher competencies", err);
          setError("No se pudieron cargar las competencias del docente.");
          toast({ title: "Error de Carga", description: "No se pudieron cargar las competencias generales del docente.", variant: "destructive" });
        })
        .finally(() => setLoadingTeacherComps(false));
    } else {
        // Reset state when dialog is closed
        setAllTeacherComps([]);
        setAssignedInDialog([]);
        setError(null);
        setIsSaving(false);
    }
  }, [open, teacherId, initiallyAssignedCompetencies, toast]);

  const availableCompetencies = useMemo(() => {
    const assignedIds = new Set(assignedInDialog.map(c => c.id));
    return allTeacherComps.filter(c => !assignedIds.has(c.id));
  }, [allTeacherComps, assignedInDialog]);

  const handleToggleCompetency = (competency: Competency, listType: 'assigned' | 'available') => {
    if (listType === 'available') {
      setAssignedInDialog(prev => [...prev, competency]);
    } else { // 'assigned'
      setAssignedInDialog(prev => prev.filter(c => c.id !== competency.id));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const assignedIds = assignedInDialog.map(c => c.id);
      const updatedClassroom = await updateClassroomCompetencies(classroomId, assignedIds);
      if (updatedClassroom) {
        toast({
          title: "Competencias Actualizadas",
          description: "Las competencias del classroom han sido guardadas.",
        });
        onAssignmentsSaved(updatedClassroom);
        onOpenChange(false);
      } else {
        throw new Error("No se pudo actualizar el classroom.");
      }
    } catch (err) {
      console.error("Failed to save assignments", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error al guardar.";
      setError(errorMessage);
      toast({
        title: "Error al Guardar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const CompetencyItem = ({ competency, type }: { competency: Competency; type: 'assigned' | 'available' }) => (
    <div
      key={competency.id}
      className="p-3 mb-2 border rounded-md hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between bg-card hover:bg-muted/50"
      onClick={() => handleToggleCompetency(competency, type)}
    >
      <div>
        <p className="font-medium text-sm text-foreground">{competency.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{competency.description}</p>
      </div>
      {type === 'available' ? (
        <PlusCircle className="h-5 w-5 text-green-500 hover:text-green-600" />
      ) : (
        <CheckCircle2 className="h-5 w-5 text-primary hover:text-primary/80" />
      )}
    </div>
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <BookCopy className="mr-2 h-6 w-6 text-primary" />
            Asignar Competencias al Classroom
          </DialogTitle>
          <DialogDescription>
            Mueve competencias entre "Disponibles" y "Asignadas" para este classroom.
          </DialogDescription>
        </DialogHeader>

        {loadingTeacherComps && (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {!loadingTeacherComps && error && (
            <div className="flex-grow flex flex-col items-center justify-center text-destructive p-4">
                 <AlertTriangle className="h-10 w-10 mb-3" />
                <p className="text-center">{error}</p>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">Cerrar</Button>
            </div>
        )}

        {!loadingTeacherComps && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-hidden py-4">
            {/* Columna Disponibles */}
            <div className="flex flex-col space-y-2 h-full">
              <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-1 z-10">Competencias Disponibles</h3>
              <ScrollArea className="flex-grow border rounded-md p-3 bg-muted/30 min-h-[200px]">
                {availableCompetencies.length > 0 ? (
                  availableCompetencies.map(comp => <CompetencyItem key={comp.id} competency={comp} type="available" />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {allTeacherComps.length === 0 ? "No hay competencias creadas por el docente." : "Todas las competencias del docente ya están asignadas."}
                  </p>
                )}
              </ScrollArea>
            </div>

            {/* Columna Asignadas */}
            <div className="flex flex-col space-y-2 h-full">
              <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-1 z-10">Competencias Asignadas</h3>
              <ScrollArea className="flex-grow border rounded-md p-3 bg-muted/30 min-h-[200px]">
                {assignedInDialog.length > 0 ? (
                  assignedInDialog.map(comp => <CompetencyItem key={comp.id} competency={comp} type="assigned" />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay competencias asignadas a este classroom.</p>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaving || loadingTeacherComps || !!error}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
