
"use client";

import { useState } from "react";
import type { User } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from '@/lib/api';
import { Mail, User as UserIcon, Phone, CalendarDays, Briefcase, Edit, Save, XCircle, Coins, Award, Smile } from "lucide-react";

interface StudentProfileSectionProps {
  user: User;
}

const studentProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  cel_phone: z.string().optional().nullable(),
  // email, registration_date, role are not editable by student
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

export default function StudentProfileSection({ user }: StudentProfileSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  // To reflect updates immediately if API were real, we might need another state for user data
  // For this mock, we'll assume the `user` prop would be updated by a parent after a real API call
  const [currentUser, setCurrentUser] = useState(user);


  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: currentUser.name,
      lastName: currentUser.lastName,
      cel_phone: currentUser.cel_phone || "",
    },
  });

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const onSubmit = async (data: StudentProfileFormValues) => {
    try {
      const updatedUser = await updateUserProfile(currentUser.id, data);
      if (updatedUser) {
        setCurrentUser(updatedUser); // Update local state to reflect changes
        toast({
          title: "Perfil Actualizado",
          description: "Tus cambios han sido guardados.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil.",
          variant: "destructive",
        });
      }
    } catch (error) {
        toast({
          title: "Error de Red",
          description: "Ocurrió un error al intentar actualizar el perfil.",
          variant: "destructive",
        });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to current user data when cancelling edit
      form.reset({
        name: currentUser.name,
        lastName: currentUser.lastName,
        cel_phone: currentUser.cel_phone || "",
      });
    }
    setIsEditing(!isEditing);
  };
  
  const formatRole = (role: string) => {
    if (role === 'TEACHER') return 'Profesor(a)';
    if (role === 'STUDENT') return 'Estudiante';
    return role.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <Card className="shadow-lg w-full max-w-2xl mx-auto">
      <CardHeader className="items-center text-center border-b pb-6">
        <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary ring-offset-2 ring-offset-background">
          <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.name, currentUser.lastName)}`} alt={`${currentUser.name} ${currentUser.lastName}`} data-ai-hint="student avatar" />
          <AvatarFallback>{getInitials(currentUser.name, currentUser.lastName)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-headline">{currentUser.name} {currentUser.lastName}</CardTitle>
        <CardDescription className="text-lg capitalize text-muted-foreground">{formatRole(currentUser.role)}</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <UserIcon className="h-5 w-5 mr-2 text-primary" /> Nombre
                    </FormLabel>
                    {isEditing ? (
                      <FormControl>
                        <Input {...field} className="text-base"/>
                      </FormControl>
                    ) : (
                      <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{currentUser.name}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <UserIcon className="h-5 w-5 mr-2 text-primary" /> Apellido
                    </FormLabel>
                    {isEditing ? (
                      <FormControl>
                        <Input {...field} className="text-base"/>
                      </FormControl>
                    ) : (
                      <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{currentUser.lastName}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-foreground/80">
                <Mail className="h-5 w-5 mr-2 text-primary" /> Email
              </Label>
              <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center text-muted-foreground">{currentUser.email} (No editable)</p>
            </div>

            <FormField
              control={form.control}
              name="cel_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-foreground/80">
                    <Phone className="h-5 w-5 mr-2 text-primary" /> Celular
                  </FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ej: 987654321" className="text-base"/>
                    </FormControl>
                  ) : (
                    <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{currentUser.cel_phone || "No especificado"}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center text-foreground/80">
                    <CalendarDays className="h-5 w-5 mr-2 text-primary" /> Fecha de Registro
                  </Label>
                  <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center text-muted-foreground">
                    {currentUser.registration_date ? new Date(currentUser.registration_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center text-foreground/80">
                     <Briefcase className="h-5 w-5 mr-2 text-primary" /> Rol
                  </Label>
                  <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center text-muted-foreground">{formatRole(currentUser.role)}</p>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-1 p-3 bg-accent/10 rounded-lg text-center">
                  <Coins className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                  <Label className="text-xs text-muted-foreground">Monedas Disponibles</Label>
                  <p className="text-2xl font-semibold text-yellow-600">{currentUser.coin_available ?? 0}</p>
                </div>
                <div className="space-y-1 p-3 bg-accent/10 rounded-lg text-center">
                  <Award className="h-6 w-6 mx-auto text-amber-600 mb-1" />
                  <Label className="text-xs text-muted-foreground">Puntos Totales</Label>
                  <p className="text-2xl font-semibold text-amber-700">{currentUser.coin_earned ?? 0}</p>
                </div>
                 <div className="space-y-1 p-3 bg-accent/10 rounded-lg text-center">
                  <Smile className="h-6 w-6 mx-auto text-sky-500 mb-1" />
                  <Label className="text-xs text-muted-foreground">Estado de Ánimo</Label>
                  <p className="text-lg font-medium text-sky-600">{currentUser.emotion || "No definido"}</p>
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleEditToggle}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleEditToggle}>
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
