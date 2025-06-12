
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateTeacherCompetency } from '@/lib/api';
import type { Competency } from '@/types/entities';
import { Target, Edit3 } from 'lucide-react';

interface EditCompetencyDialogProps {
  competency: Competency | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetencyUpdated: (updatedCompetency: Competency) => void;
}

const competencySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100, "El nombre no debe exceder los 100 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no debe exceder los 500 caracteres."),
});

type CompetencyFormValues = z.infer<typeof competencySchema>;

export default function EditCompetencyDialog({ competency, open, onOpenChange, onCompetencyUpdated }: EditCompetencyDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open && competency) {
      form.reset({
        name: competency.name,
        description: competency.description,
      });
    }
    if (!open) {
      // Reset form if dialog closes or if no competency was loaded initially
      form.reset({ name: "", description: "" });
      setIsLoading(false);
    }
  }, [open, competency, form]);

  async function onSubmit(data: CompetencyFormValues) {
    if (!competency) {
      toast({ title: "Error", description: "No hay competencia seleccionada para editar.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const updatedCompetency = await updateTeacherCompetency(competency.id, data);
      toast({
        title: "Competencia Actualizada",
        description: `La competencia "${updatedCompetency.name}" ha sido actualizada exitosamente.`,
      });
      onCompetencyUpdated(updatedCompetency);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update competency", error);
      toast({
        title: "Error al Actualizar Competencia",
        description: (error instanceof Error ? error.message : "Ocurrió un error inesperado."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!competency && open) {
    // This case should ideally not happen if dialog is opened correctly
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Error</DialogTitle>
                    <DialogDescription>No se ha proporcionado información de la competencia para editar.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit3 className="mr-2 h-5 w-5 text-primary" />
            Editar Competencia
          </DialogTitle>
          <DialogDescription>
            Modifica el nombre y la descripción de la competencia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Competencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pensamiento Crítico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe brevemente la competencia..." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
