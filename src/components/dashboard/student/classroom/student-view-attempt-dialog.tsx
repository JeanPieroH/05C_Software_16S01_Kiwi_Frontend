
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { StudentQuizAttempt, QuestionAttempt } from '@/types/entities';
import { fetchStudentQuizAttemptDetails } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertTriangle, MessageSquare, CheckCircle2, XCircle, Info, BookOpenText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';


interface StudentViewAttemptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  studentId: string;
  studentName: string; // For display purposes
  quizTotalPoints: number;
}

export default function StudentViewAttemptDialog({
  open,
  onOpenChange,
  quizId,
  studentId,
  studentName,
  quizTotalPoints,
}: StudentViewAttemptDialogProps) {
  const [attemptDetails, setAttemptDetails] = useState<StudentQuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttemptDetails = useCallback(async () => {
    if (!open || !quizId || !studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStudentQuizAttemptDetails(quizId, studentId);
      if (data) {
        setAttemptDetails(data);
      } else {
        setError("No se encontraron los detalles de tu entrega.");
      }
    } catch (err) {
      console.error("Error fetching student attempt details:", err);
      setError("Error al cargar los detalles de tu entrega.");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, studentId, open]);

  useEffect(() => {
    if (open) {
      loadAttemptDetails();
    } else {
      // Reset state when dialog closes
      setAttemptDetails(null);
      setIsLoading(true);
      setError(null);
    }
  }, [open, loadAttemptDetails]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPPpp", { locale: es });
    } catch {
      return dateString; // fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] grid grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary flex items-center">
            <BookOpenText className="mr-2 h-6 w-6" />
            Detalle de tu Entrega: {attemptDetails?.title || "Cargando..."}
          </DialogTitle>
          <DialogDescription>Revisa tus respuestas y la retroalimentación.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-4 -mr-2">
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && error && (
            <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
              <AlertTriangle className="h-10 w-10 mb-3" />
              <p className="text-center">{error}</p>
            </div>
          )}

          {!isLoading && !error && attemptDetails && (
            <div className="space-y-6 py-4">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><strong className="font-medium">Instrucciones:</strong> {attemptDetails.instruction}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><strong className="font-medium">Inicio Programado:</strong> {formatDate(attemptDetails.start_time)}</p>
                    <p><strong className="font-medium">Fin Programado:</strong> {formatDate(attemptDetails.end_time)}</p>
                  </div>
                   <p><strong className="font-medium">Entregado el:</strong> {formatDate(attemptDetails.created_at)}</p>
                  <Badge variant="default">
                    Puntuación Obtenida: {attemptDetails.points_obtained} / {quizTotalPoints}
                  </Badge>
                  
                  {attemptDetails.feedback_automated && (
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-md mt-2">
                      <p className="text-sm font-semibold text-blue-700 mb-1">Retroalimentación Automática (General):</p>
                      <p className="text-sm text-blue-600">{attemptDetails.feedback_automated}</p>
                    </div>
                  )}
                  {attemptDetails.feedback_teacher && (
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-md mt-2">
                      <p className="text-sm font-semibold text-green-700 mb-1">Retroalimentación del Docente (General):</p>
                      <p className="text-sm text-green-600">{attemptDetails.feedback_teacher}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />
              <h3 className="text-xl font-semibold text-primary">Tus Respuestas:</h3>

              {attemptDetails.questions.map((q, index) => (
                <Card key={q.id || `q-${index}`} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Pregunta {index + 1}:</span>
                      <Badge variant="secondary">{q.points_obtained} / {q.points} Puntos</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">{q.statement}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="font-medium text-sm">Respuesta Correcta:</Label>
                      <p className="text-sm p-2 bg-green-50 border border-green-200 rounded-md text-green-700">
                        {q.answer_correct}
                      </p>
                    </div>

                    {q.answer_submitted.type === "submitted_text" && (
                      <div>
                        <Label className="font-medium text-sm">Tu Respuesta:</Label>
                        <p className="text-sm p-2 bg-card border rounded-md">
                          {q.answer_submitted.answer_written || <span className="italic text-muted-foreground">No respondida</span>}
                        </p>
                      </div>
                    )}

                    {q.answer_submitted.type === "submitted_multiple_option" && q.answer_base.options && (
                      <div>
                        <Label className="font-medium text-sm">Opciones y Tu Selección:</Label>
                        <div className="space-y-1.5 mt-1">
                          {q.answer_base.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center space-x-2 p-2 border rounded-md text-sm 
                                ${opt === q.answer_correct ? 'bg-green-50 border-green-300' : 'bg-card'}
                                ${opt === q.answer_submitted.option_select && opt !== q.answer_correct ? 'border-red-300' : ''}
                              `}
                            >
                              <Checkbox
                                id={`view-q${q.id}-opt${optIndex}`}
                                checked={opt === q.answer_submitted.option_select}
                                disabled
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`view-q${q.id}-opt${optIndex}`}
                                className={`flex-1 ${opt === q.answer_correct ? 'text-green-700 font-medium' : ''} 
                                            ${opt === q.answer_submitted.option_select && opt !== q.answer_correct ? 'text-red-600' : ''}`}
                              >
                                {opt}
                              </label>
                              {opt === q.answer_correct && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                              {opt === q.answer_submitted.option_select && opt !== q.answer_correct && <XCircle className="h-4 w-4 text-red-500" />}
                            </div>
                          ))}
                          {!q.answer_base.options.includes(q.answer_submitted.option_select || "") && q.answer_submitted.option_select && (
                            <p className="text-xs text-red-500 italic">Tu opción seleccionada no está entre las opciones válidas.</p>
                          )}
                           {(q.answer_submitted.option_select === undefined || q.answer_submitted.option_select === "") && (
                            <p className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md">
                              No seleccionaste una opción.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {q.feedback_automated && (
                      <div className="p-2 border-l-2 border-blue-400 bg-blue-50 rounded-r-md text-xs mt-2">
                        <p className="font-semibold text-blue-600 mb-0.5 flex items-center"><Info className="h-3 w-3 mr-1"/>Retro. Automática:</p>
                        <p className="text-blue-500">{q.feedback_automated}</p>
                      </div>
                    )}
                    {q.feedback_teacher && (
                      <div className="p-2 border-l-2 border-green-400 bg-green-50 rounded-r-md text-xs mt-2">
                        <p className="font-semibold text-green-600 mb-0.5 flex items-center"><MessageSquare className="h-3 w-3 mr-1"/>Retro. Docente:</p>
                        <p className="text-green-500">{q.feedback_teacher}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t bg-background py-4 px-6 -mx-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
