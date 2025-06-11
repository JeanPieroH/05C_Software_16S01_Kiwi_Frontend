
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
import { Mail, User as UserIcon, Phone, CalendarDays, Briefcase, Edit, Save, XCircle } from "lucide-react";

interface ProfileSectionProps {
  user: User;
}

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  cel_phone: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSection({ user }: ProfileSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      lastName: user.lastName,
      cel_phone: user.cel_phone || "",
    },
  });

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Profile data to save:", data);
    // Here you would typically call an API to update the user profile
    // For now, we'll just simulate a successful save
    toast({
      title: "Perfil Actualizado",
      description: "Tus cambios han sido guardados (simulación).",
    });
    setIsEditing(false);
    // Potentially update the user prop if the parent component needs to know
    // For now, we assume the API call would refresh data or the 'user' prop is updated elsewhere
  };

  const handleEditToggle = () => {
    if (isEditing) {
      form.reset({
        name: user.name,
        lastName: user.lastName,
        cel_phone: user.cel_phone || "",
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
          <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name, user.lastName)}`} alt={`${user.name} ${user.lastName}`} data-ai-hint="profile person" />
          <AvatarFallback>{getInitials(user.name, user.lastName)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-headline">{user.name} {user.lastName}</CardTitle>
        <CardDescription className="text-lg capitalize text-muted-foreground">{formatRole(user.role)}</CardDescription>
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
                      <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{user.name}</p>
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
                      <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{user.lastName}</p>
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
              <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center text-muted-foreground">{user.email} (No editable)</p>
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
                    <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center">{user.cel_phone || "No especificado"}</p>
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
                    {user.registration_date ? new Date(user.registration_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center text-foreground/80">
                     <Briefcase className="h-5 w-5 mr-2 text-primary" /> Rol
                  </Label>
                  <p className="text-lg font-medium p-2 bg-muted/30 rounded-md min-h-[40px] flex items-center text-muted-foreground">{formatRole(user.role)}</p>
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleEditToggle}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
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

