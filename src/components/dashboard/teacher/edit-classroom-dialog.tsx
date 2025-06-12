
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
import { updateTeacherClassroom } from '@/lib/api';
import type { Classroom } from '@/types/entities';
import { School, Edit3 } from 'lucide-react';

interface EditClassroomDialogProps {
  classroom: Omit<Classroom, 'quiz' | 'competences'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomUpdated: (updatedClassroom: Omit<Classroom, 'quiz' | 'competences'>) => void;
}

const classroomSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100, "El nombre no debe exceder los 100 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no debe exceder los 500 caracteres."),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;

export default function EditClassroomDialog({ classroom, open, onOpenChange, onClassroomUpdated }: EditClassroomDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open && classroom) {
      form.reset({
        name: classroom.name,
        description: classroom.description || "",
      });
    }
    if (!open) {
      form.reset({ name: "", description: "" }); // Clear form on close if no classroom was loaded
      setIsLoading(false);
    }
  }, [open, classroom, form]);

  async function onSubmit(data: ClassroomFormValues) {
    if (!classroom) {
      toast({ title: "Error", description: "No hay classroom seleccionado para editar.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const updatedClassroom = await updateTeacherClassroom(classroom.id, data);
      toast({
        title: "Classroom Actualizado",
        description: `El classroom "${updatedClassroom.name}" ha sido actualizado exitosamente.`,
      });
      onClassroomUpdated(updatedClassroom);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update classroom", error);
      toast({
        title: "Error al Actualizar Classroom",
        description: (error instanceof Error ? error.message : "Ocurrió un error inesperado."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!classroom && open) {
    // This case should ideally not happen if dialog is opened correctly, but good for safety
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Error</DialogTitle>
                    <DialogDescription>No se ha proporcionado información del classroom para editar.</DialogDescription>
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
            Editar Classroom
          </DialogTitle>
          <DialogDescription>
            Modifica el nombre y la descripción de tu classroom.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Classroom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Matemáticas 101" {...field} />
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
                    <Textarea placeholder="Describe brevemente el classroom..." {...field} rows={4}/>
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
