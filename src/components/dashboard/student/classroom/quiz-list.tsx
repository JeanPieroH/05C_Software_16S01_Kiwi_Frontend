
"use client";

import type { Quiz } from "@/types/entities";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlayCircle, Target as TargetIcon, Clock, FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentQuizListProps {
  quizzes: Quiz[];
  onStartQuiz: (quizId: string) => void;
  onViewAttempt: (quizId: string) => void;
  currentUserId: string;
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

const getQuizCardStatus = (startTime?: string, endTime?: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline"; isActive: boolean; hasEnded: boolean; isUpcoming: boolean } => {
  if (!startTime || !endTime) return { text: "No programado", variant: "outline", isActive: false, hasEnded: false, isUpcoming: true };
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return { text: "Programado", variant: "secondary", isActive: false, hasEnded: false, isUpcoming: true };
  if (now > end) return { text: "Finalizado", variant: "destructive", isActive: false, hasEnded: true, isUpcoming: false };
  return { text: "En curso", variant: "default", isActive: true, hasEnded: false, isUpcoming: false };
};


export default function StudentQuizList({ quizzes, onStartQuiz, onViewAttempt, currentUserId }: StudentQuizListProps) {
  
  if (quizzes.length === 0) {
    return (
      <Card className="shadow-md text-center">
        <CardHeader>
          <CardTitle>No hay quizzes disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <FileText className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">Este classroom aún no tiene quizzes asignados o activos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const cardStatus = getQuizCardStatus(quiz.start_time, quiz.end_time);
        
        const now = new Date();
        // Treat null/undefined start_time as  very future (quiz not started yet)
        const quizStartTime = quiz.start_time ? new Date(quiz.start_time) : new Date(now.getTime() + 86400000 * 365); 
        // Treat null/undefined end_time as very past (quiz has ended, useful if API omits end_time for old quizzes)
        const quizEndTime = quiz.end_time ? new Date(quiz.end_time) : new Date(0); 

        const pointsObtained = quiz.student_attempt_summary?.points_obtained;

        const isQuizCurrentlyActive = quizStartTime <= now && quizEndTime > now;
        const hasQuizExpired = quizEndTime < now;

        // Q: student's points_obtained is 0 (or not attempted)
        const studentHasNotAttemptedOrScoredZero = pointsObtained == null || pointsObtained === 0;
        // ~Q: student's points_obtained is different from 0
        const studentHasAttemptedAndScoredNonZero = pointsObtained != null && pointsObtained !== 0;
        
        // Condition for "Iniciar Quiz" : P (end_time > now -> !hasQuizExpired) AND Q (studentHasNotAttemptedOrScoredZero) AND quiz is active
        const showIniciarQuiz = isQuizCurrentlyActive && studentHasNotAttemptedOrScoredZero;
        
        // Condition for "Ver Entrega": ~P (end_time < now -> hasQuizExpired) OR ~Q (studentHasAttemptedAndScoredNonZero)
        const showVerEntrega = hasQuizExpired || studentHasAttemptedAndScoredNonZero;

        return (
          <Card key={quiz.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-foreground">{quiz.title}</CardTitle>
                <Badge variant={cardStatus.variant}>{cardStatus.text}</Badge>
              </div>
              <CardDescription className="flex items-center pt-1">
                <TargetIcon className="h-4 w-4 mr-2 text-accent" />
                Puntos totales: {quiz.total_points || 0}
                {(quiz.student_attempt_summary && pointsObtained != null) && (
                  <span className="ml-2 text-xs text-primary font-medium">(Obtuviste: {pointsObtained} pts)</span>
                )}
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
               {showIniciarQuiz ? (
                <Button
                  size="sm"
                  onClick={() => onStartQuiz(quiz.id)}
                  >
                 <PlayCircle className="mr-1 h-4 w-4" />
                 Iniciar Quiz
                 </Button>
                 ) : showVerEntrega ? (
                 <Button
                  size="sm"
                  variant="default"
                  onClick={() => onViewAttempt(quiz.id)}
                 >
                  <Eye className="mr-1 h-4 w-4" />
                  Ver Entrega
                  </Button>
                  ) : (
                 <Button size="sm" disabled>
                 {cardStatus.isUpcoming ? "Quiz no disponible aún" :
                 "No disponible"}
                 </Button>
                 )}
             </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

