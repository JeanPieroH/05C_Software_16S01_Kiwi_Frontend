
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { Quiz, QuizSubmissionSummary } from "@/types/entities";
import { fetchQuizSubmissions } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, UserCheck, AlertTriangle, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import StudentAttemptDetailsDialog from './student-attempt-details-dialog'; // Import the new dialog

interface QuizSubmissionsSectionProps {
  quiz: Quiz;
  onClose: () => void;
  // onSelectStudent: (quizId: string, studentId: string, studentName: string) => void; // To be replaced by dialog logic
}

export default function QuizSubmissionsSection({ quiz, onClose }: QuizSubmissionsSectionProps) {
  const [submissions, setSubmissions] = useState<QuizSubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAttemptDetailsDialogOpen, setIsAttemptDetailsDialogOpen] = useState(false);
  const [selectedStudentIdForDetails, setSelectedStudentIdForDetails] = useState<string | null>(null);
  const [selectedStudentNameForDetails, setSelectedStudentNameForDetails] = useState<string | null>(null);


  const loadSubmissions = useCallback(async () => {
    if (!quiz?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizSubmissions(quiz.id);
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("No se pudieron cargar las entregas. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [quiz?.id]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleViewStudentAttempt = (studentId: string, studentName: string, studentLastName: string) => {
    setSelectedStudentIdForDetails(studentId);
    setSelectedStudentNameForDetails(`${studentName} ${studentLastName}`);
    setIsAttemptDetailsDialogOpen(true);
  };

  if (!quiz) return null;

  return (
    <>
      <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cerrar Vista de Entregas
          </Button>
    
    <Card className="mt-6 shadow-lg border-primary/30">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-primary flex items-center">
              <UserCheck className="mr-3 h-7 w-7" />
              Entregas para: {quiz.title}
            </CardTitle>
            <CardDescription>Lista de estudiantes que han realizado este quiz.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando entregas...</p>
          </div>
        )}
        {!loading && error && (
          <div className="text-center py-10 text-destructive">
            <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 opacity-50 mb-3" />
            <p>Aún no hay entregas para este quiz.</p>
          </div>
        )}
        {!loading && !error && submissions.length > 0 && (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="text-right">Puntos Obtenidos</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.student_id}>
                    <TableCell className="font-medium">{sub.student_name} {sub.student_last_name}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{sub.points_obtained} / {quiz.total_points || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewStudentAttempt(sub.student_id, sub.student_name, sub.student_last_name)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      {selectedStudentIdForDetails && selectedStudentNameForDetails && quiz && (
        <StudentAttemptDetailsDialog
          open={isAttemptDetailsDialogOpen}
          onOpenChange={setIsAttemptDetailsDialogOpen}
          quizId={quiz.id}
          studentId={selectedStudentIdForDetails}
          studentName={selectedStudentNameForDetails}
          quizTotalPoints={quiz.total_points || 0}
          onFeedbackSaved={() => {
            // Optionally, re-fetch submissions list if feedback might change overall scores displayed here
            // loadSubmissions(); 
          }}
        />
      )}
    </Card>
    </>
  );
}
