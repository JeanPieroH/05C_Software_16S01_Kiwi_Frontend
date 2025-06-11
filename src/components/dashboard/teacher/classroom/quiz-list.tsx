
"use client";

import type { Quiz } from "@/types/entities";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit3, Eye, FileText, ListChecks, Target as TargetIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateQuizDialog from './create-quiz-dialog';

interface QuizListProps {
  quizzes: Quiz[];
  classroomId: string; 
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return `${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Fecha inválida";
  }
};

const getQuizStatus = (startTime?: string, endTime?: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  if (!startTime || !endTime) return { text: "No programado", variant: "outline" };
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return { text: "Programado", variant: "secondary" };
  if (now > end) return { text: "Finalizado", variant: "destructive" };
  return { text: "En curso", variant: "default" };
};


export default function QuizList({ quizzes, classroomId }: QuizListProps) {
  
  // In a real app, this function would likely trigger a state update in the parent
  // component (ClassroomDetailsPage) to re-fetch or update the quizzes list.
  const handleQuizCreated = (newQuiz: Quiz) => {
    console.log("New quiz created, needs refresh in parent component:", newQuiz);
    // For example, if ClassroomDetailsPage passed down a function to refresh quizzes:
    // refreshQuizzesList(); 
    alert(`Nuevo quiz "${newQuiz.title}" creado. Refresca la página para ver los cambios (simulación).`);
  };

  if (quizzes.length === 0) {
    return (
      <Card className="shadow-md text-center">
        <CardHeader>
          <CardTitle>No hay quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <FileText className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">Este classroom aún no tiene quizzes asignados.</p>
          <CreateQuizDialog classroomId={classroomId} onQuizCreated={handleQuizCreated}>
            <Button className="mt-4">
              <ListChecks className="mr-2 h-5 w-5" /> Crear primer Quiz
            </Button>
          </CreateQuizDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <CreateQuizDialog classroomId={classroomId} onQuizCreated={handleQuizCreated}>
          <Button>
              <ListChecks className="mr-2 h-5 w-5" /> Crear Nuevo Quiz
          </Button>
        </CreateQuizDialog>
      </div>
      {quizzes.map((quiz) => {
        const status = getQuizStatus(quiz.start_time, quiz.end_time);
        return (
          <Card key={quiz.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-foreground">{quiz.title}</CardTitle>
                <Badge variant={status.variant}>{status.text}</Badge>
              </div>
              <CardDescription className="flex items-center pt-1">
                <TargetIcon className="h-4 w-4 mr-2 text-accent" />
                Puntos totales: {quiz.total_points}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">{quiz.instruction}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2 text-accent" />
                  <span className="font-medium">Inicio:</span>&nbsp;{formatDate(quiz.start_time)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-accent" />
                   <span className="font-medium">Fin:</span>&nbsp;{formatDate(quiz.end_time)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm">
                <Edit3 className="mr-1 h-4 w-4" /> Editar Quiz
              </Button>
              <Button size="sm" variant="secondary">
                <Eye className="mr-1 h-4 w-4" /> Ver Entregas
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

    