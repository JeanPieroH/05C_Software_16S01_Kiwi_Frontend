
"use client";

import type { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Smile, UserCircle } from 'lucide-react';

interface UserDisplayCardProps {
  user: User;
}

const getInitials = (name?: string, lastName?: string) => {
  if (!name) return "??";
  return `${name.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

const formatRole = (role: UserRole) => {
  if (role === 'TEACHER') return 'Docente';
  if (role === 'STUDENT') return 'Estudiante';
  return role;
};

export default function UserDisplayCard({ user }: UserDisplayCardProps) {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary/50">
            <AvatarImage 
                src={`https://placehold.co/64x64.png?text=${getInitials(user.name, user.lastName)}`} 
                alt={`${user.name} ${user.lastName}`}
                data-ai-hint="person profile"
            />
            <AvatarFallback>{getInitials(user.name, user.lastName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{user.name} {user.lastName}</h3>
                    <Badge variant={user.role === 'TEACHER' ? "secondary" : "outline"} className="text-xs">
                        {user.role === 'TEACHER' ? <UserCircle className="mr-1 h-3 w-3" /> : <Smile className="mr-1 h-3 w-3" />}
                        {formatRole(user.role)}
                    </Badge>
                </div>
                {user.role === 'STUDENT' && user.emotion && (
                    <Badge variant="default" className="text-xs bg-accent/30 text-accent-foreground border-accent">
                        <Smile className="mr-1 h-3 w-3 text-accent" /> {user.emotion}
                    </Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center">
              <Mail className="mr-2 h-4 w-4 opacity-70" /> {user.email}
            </p>
            {user.cel_phone && (
              <p className="text-sm text-muted-foreground flex items-center">
                <Phone className="mr-2 h-4 w-4 opacity-70" /> {user.cel_phone}
              </p>
            )}
            {!user.cel_phone && (
                 <p className="text-sm text-muted-foreground italic flex items-center">
                    <Phone className="mr-2 h-4 w-4 opacity-30" /> Sin teléfono registrado
                </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
