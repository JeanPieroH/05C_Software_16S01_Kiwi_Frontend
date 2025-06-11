
"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { XCircle, UserPlus, Users, Briefcase, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPeopleToClassroom } from '@/lib/api';
import type { UserRole, AddPeopleResponse } from '@/types/auth';

interface AddPeopleDialogProps {
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPeopleAdded: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddPeopleDialog({ classroomId, open, onOpenChange, onPeopleAdded }: AddPeopleDialogProps) {
  const { toast } = useToast();
  const [currentEmailInput, setCurrentEmailInput] = useState('');
  const [emailsToAdd, setEmailsToAdd] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setCurrentEmailInput('');
      setEmailsToAdd([]);
      setSelectedRole('STUDENT');
      setIsLoading(false);
      setInputError(null);
    }
  }, [open]);

  const handleAddEmail = () => {
    const email = currentEmailInput.trim();
    if (!email) return;

    if (!emailRegex.test(email)) {
      setInputError("Por favor, introduce un correo válido.");
      return;
    }
    if (emailsToAdd.includes(email)) {
      setInputError("Este correo ya ha sido añadido a la lista.");
      return;
    }

    setEmailsToAdd([...emailsToAdd, email]);
    setCurrentEmailInput('');
    setInputError(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailsToAdd(emailsToAdd.filter(email => email !== emailToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = async () => {
    if (emailsToAdd.length === 0) {
      toast({
        title: "No hay correos",
        description: "Por favor, añade al menos un correo electrónico.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedRole) {
        toast({
            title: "Rol no seleccionado",
            description: "Por favor, selecciona un rol para las personas a agregar.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    try {
      const response: AddPeopleResponse = await addPeopleToClassroom(classroomId, emailsToAdd, selectedRole);
      if (response.success) {
        toast({
          title: "Éxito",
          description: response.message || `${response.added.length} persona(s) agregada(s) correctamente.`,
        });
        if (response.failed && response.failed.length > 0) {
          toast({
            title: "Algunas advertencias",
            description: `${response.failed.length} correo(s) no pudieron ser agregados o ya existían. Detalles: ${response.failed.map(f => `${f.email} (${f.reason})`).join(', ')}`,
            variant: "default",
            duration: 7000,
          });
        }
        onPeopleAdded();
        onOpenChange(false);
      } else {
        toast({
          title: "Error al Agregar",
          description: response.message || "No se pudieron agregar algunas o todas las personas.",
          variant: "destructive",
        });
         if (response.failed && response.failed.length > 0) {
          toast({
            title: "Detalles del Error",
            description: `Fallos: ${response.failed.map(f => `${f.email} (${f.reason})`).join(', ')}`,
            variant: "destructive",
            duration: 7000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error de Red",
        description: "Ocurrió un error al intentar agregar personas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UserPlus className="mr-2 h-6 w-6 text-primary" />
            Añadir Personas al Classroom
          </DialogTitle>
          <DialogDescription>
            Ingresa los correos electrónicos de las personas que deseas añadir y asígnales un rol.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-input" className="flex items-center">
                <Users className="mr-2 h-4 w-4 opacity-70"/>
                Correos Electrónicos
            </Label>
            <div className="flex gap-2">
                <Input
                id="email-input"
                placeholder="ejemplo@dominio.com"
                value={currentEmailInput}
                onChange={(e) => {
                    setCurrentEmailInput(e.target.value);
                    if (inputError) setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleAddEmail} // Add email on blur if input is not empty
                className={inputError ? "border-destructive" : ""}
                />
                <Button onClick={handleAddEmail} variant="outline" size="sm" className="shrink-0">Añadir</Button>
            </div>
            {inputError && <p className="text-xs text-destructive flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>{inputError}</p>}
            {emailsToAdd.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-[40px]">
                {emailsToAdd.map((email) => (
                  <Badge key={email} variant="secondary" className="text-sm py-1">
                    {email}
                    <button
                      type="button"
                      className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-1 focus:ring-ring focus:ring-offset-1"
                      onClick={() => handleRemoveEmail(email)}
                      aria-label={`Remover ${email}`}
                    >
                      <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          { /*
          <div className="space-y-2">
            <Label htmlFor="role-select" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4 opacity-70"/>
                Asignar Rol
            </Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Estudiante</SelectItem>
                <SelectItem value="TEACHER">Docente</SelectItem>
              </SelectContent>
            </Select>
          </div>*/
      }
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || emailsToAdd.length === 0}>
            {isLoading ? "Agregando..." : "Agregar Personas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
