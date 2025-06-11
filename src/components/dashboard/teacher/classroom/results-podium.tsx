
"use client";

import type { StudentResult } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Star } from "lucide-react"; // Or other suitable icons

interface ResultsPodiumProps {
  topStudents: StudentResult[]; // Expects sorted array, top 3
}

const getInitials = (name?: string, lastName?: string) => {
  if (!name) return "??";
  return `${name.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

export default function ResultsPodium({ topStudents }: ResultsPodiumProps) {
  if (!topStudents || topStudents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="mx-auto h-16 w-16 opacity-50 mb-4" />
        Aún no hay suficientes datos para mostrar el podio.
      </div>
    );
  }

  const firstPlace = topStudents.find(s => s.ranking === 1);
  const secondPlace = topStudents.find(s => s.ranking === 2);
  const thirdPlace = topStudents.find(s => s.ranking === 3);

  // If students share ranks, pick the first one found for podium display simplicity
  // A more complex app might handle ties explicitly (e.g., multiple people on one step)

  const podiumSpots = [
    { student: secondPlace, rank: 2, icon: <Award className="h-8 w-8 text-slate-400" />, color: "bg-slate-100 dark:bg-slate-700", height: "h-48" },
    { student: firstPlace, rank: 1, icon: <Trophy className="h-10 w-10 text-yellow-400" />, color: "bg-yellow-50 dark:bg-yellow-800/30", height: "h-60" },
    { student: thirdPlace, rank: 3, icon: <Star className="h-8 w-8 text-orange-400" />, color: "bg-orange-50 dark:bg-orange-800/30", height: "h-40" },
  ];

  return (
    <div className="flex justify-around items-end gap-4 py-8 px-2 md:px-6 rounded-lg bg-card border shadow-lg">
      {podiumSpots.map((spot, index) => (
        <div key={index} className={`flex flex-col items-center w-1/3 md:w-1/4 lg:w-1/5 transform transition-all duration-300 ease-out hover:scale-105`}>
          {spot.student ? (
            <>
              <div className="mb-2">{spot.icon}</div>
              <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 border-2 border-primary">
                <AvatarImage 
                  src={`https://placehold.co/80x80.png?text=${getInitials(spot.student.student.name, spot.student.student.last_name)}`} 
                  alt={`${spot.student.student.name} ${spot.student.student.last_name}`}
                  data-ai-hint="person student" 
                />
                <AvatarFallback>{getInitials(spot.student.student.name, spot.student.student.last_name)}</AvatarFallback>
              </Avatar>
              <Card className={`w-full text-center shadow-md ${spot.color} ${spot.rank === 1 ? 'border-2 border-yellow-400' : ''}`}>
                <CardHeader className="p-2 md:p-3">
                  <CardTitle className="text-sm md:text-base font-semibold truncate">
                    {spot.student.student.name} {spot.student.student.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <p className="text-xs md:text-sm text-muted-foreground">Puntos: {spot.student.obtained_points}</p>
                  <p className="text-lg md:text-xl font-bold text-primary">#{spot.student.ranking}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className={`flex flex-col items-center justify-center text-muted-foreground p-4 border border-dashed rounded-lg ${spot.height} w-full`}>
              <span className="text-2xl font-bold">#{spot.rank}</span>
              <span className="text-sm mt-1">Lugar Vacante</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
