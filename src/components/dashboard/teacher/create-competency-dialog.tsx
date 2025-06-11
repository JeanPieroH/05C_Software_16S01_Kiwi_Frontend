
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
import { createTeacherCompetency } from '@/lib/api';
import type { Competency } from '@/types/entities';
import { Target } from 'lucide-react';

interface CreateCompetencyDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetencyCreated: (newCompetency: Competency) => void;
}

const competencySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100, "El nombre no debe exceder los 100 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no debe exceder los 500 caracteres."),
});

type CompetencyFormValues = z.infer<typeof competencySchema>;

export default function CreateCompetencyDialog({ userId, open, onOpenChange, onCompetencyCreated }: CreateCompetencyDialogProps) {
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
    if (!open) {
      form.reset();
      setIsLoading(false);
    }
  }, [open, form]);

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);
    try {
      const newCompetency = await createTeacherCompetency(userId, data);
      toast({
        title: "Competencia Creada",
        description: `La competencia "${newCompetency.name}" ha sido creada exitosamente.`,
      });
      onCompetencyCreated(newCompetency);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create competency", error);
      toast({
        title: "Error al Crear Competencia",
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
            <Target className="mr-2 h-6 w-6 text-primary" />
            Añadir Nueva Competencia
          </DialogTitle>
          <DialogDescription>
            Define el nombre y la descripción para la nueva competencia.
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
                {isLoading ? "Creando..." : "Crear Competencia"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
