
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createTeacherClassroom } from '@/lib/api';
import type { Classroom } from '@/types/entities';
import { School } from 'lucide-react';

interface CreateClassroomDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomCreated: (newClassroom: Omit<Classroom, 'quiz' | 'competences'>) => void;
}

const classroomSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100, "El nombre no debe exceder los 100 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no debe exceder los 500 caracteres."),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;

export default function CreateClassroomDialog({ userId, open, onOpenChange, onClassroomCreated }: CreateClassroomDialogProps) {
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
    if (!open) {
      form.reset();
      setIsLoading(false);
    }
  }, [open, form]);

  async function onSubmit(data: ClassroomFormValues) {
    setIsLoading(true);
    try {
      const newClassroom = await createTeacherClassroom(userId, data);
      toast({
        title: "Classroom Creado",
        description: `El classroom "${newClassroom.name}" ha sido creado exitosamente.`,
      });
      onClassroomCreated(newClassroom);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create classroom", error);
      toast({
        title: "Error al Crear Classroom",
        description: (error instanceof Error ? error.message : "Ocurrió un error inesperado."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <School className="mr-2 h-6 w-6 text-primary" />
            Crear Nuevo Classroom
          </DialogTitle>
          <DialogDescription>
            Ingresa el nombre y la descripción para tu nuevo classroom.
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
                {isLoading ? "Creando..." : "Crear Classroom"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
