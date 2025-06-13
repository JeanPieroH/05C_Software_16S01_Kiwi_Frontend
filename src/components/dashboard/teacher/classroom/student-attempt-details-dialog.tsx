
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { StudentQuizAttempt, QuestionAttempt, SaveFeedbackPayload } from '@/types/entities';
import { fetchStudentQuizAttemptDetails, saveTeacherFeedback } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, MessageSquare, CheckCircle2, XCircle, Edit3, Save, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added import
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StudentAttemptDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  studentId: string;
  studentName: string;
  quizTotalPoints: number;
  onFeedbackSaved?: () => void;
}

export default function StudentAttemptDetailsDialog({
  open,
  onOpenChange,
  quizId,
  studentId,
  studentName,
  quizTotalPoints,
  onFeedbackSaved,
}: StudentAttemptDetailsDialogProps) {
  const { toast } = useToast();
  const [attemptDetails, setAttemptDetails] = useState<StudentQuizAttempt | null>(null);
  const [teacherFeedbackGeneral, setTeacherFeedbackGeneral] = useState('');
  const [teacherFeedbackQuestions, setTeacherFeedbackQuestions] = useState<Record<string | number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttemptDetails = useCallback(async () => {
    if (!open || !quizId || !studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStudentQuizAttemptDetails(quizId, studentId);
      if (data) {
        setAttemptDetails(data);
        setTeacherFeedbackGeneral(data.feedback_teacher || '');
        const qFeedback: Record<string | number, string> = {};
        data.questions.forEach(q => {
          if (q.id) { // Ensure q.id is defined
            qFeedback[q.id] = q.feedback_teacher || '';
          }
        });
        setTeacherFeedbackQuestions(qFeedback);
      } else {
        setError("No se encontraron los detalles de la entrega.");
      }
    } catch (err) {
      console.error("Error fetching attempt details:", err);
      setError("Error al cargar los detalles de la entrega.");
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
      setTeacherFeedbackGeneral('');
      setTeacherFeedbackQuestions({});
      setIsLoading(true);
      setIsSaving(false);
      setError(null);
    }
  }, [open, loadAttemptDetails]);

  const handleSaveFeedback = async () => {
    if (!attemptDetails) return;
    setIsSaving(true);
    const payload: SaveFeedbackPayload = {
      quiz_id: quizId,
      student_id: studentId,
      general_feedback: teacherFeedbackGeneral.trim() || null,
      question_feedbacks: Object.entries(teacherFeedbackQuestions).map(([questionId, feedbackText]) => ({
        question_id: questionId, // Assuming questionId is string or can be converted
        feedback_text: feedbackText.trim() || null,
      })),
    };

    try {
      const response = await saveTeacherFeedback(payload);
      if (response.success) {
        toast({ title: "Retroalimentación Guardada", description: response.message });
        if (onFeedbackSaved) onFeedbackSaved();
        onOpenChange(false); // Close dialog on success
      } else {
        toast({ title: "Error al Guardar", description: response.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error de Red", description: "No se pudo guardar la retroalimentación.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
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
        {/* Encabezado */}
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary flex items-center">
            <Edit3 className="mr-2 h-6 w-6" />
            Revisión de Entrega: {studentName}
          </DialogTitle>
          {attemptDetails && <DialogDescription>Quiz: {attemptDetails.title}</DialogDescription>}
        </DialogHeader>
  
        {/* Contenido Scrollable */}
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
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
                Cerrar
              </Button>
            </div>
          )}
  
          {!isLoading && !error && attemptDetails && (
            <div className="space-y-6 py-4">
              {/* Información general del Quiz */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Información General del Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong className="font-medium">Instrucciones:</strong> {attemptDetails.instruction}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><strong className="font-medium">Inicio:</strong> {formatDate(attemptDetails.start_time)}</p>
                    <p><strong className="font-medium">Fin:</strong> {formatDate(attemptDetails.end_time)}</p>
                  </div>
                  <Badge>
                    Puntos Obtenidos por {studentName}: {attemptDetails.points_obtained} / {quizTotalPoints}
                  </Badge>
                  {attemptDetails.feedback_automated && (
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-md">
                      <p className="text-sm font-semibold text-blue-700 mb-1">Retroalimentación Automática (General):</p>
                      <p className="text-sm text-blue-600">{attemptDetails.feedback_automated}</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="generalFeedback" className="font-semibold flex items-center mb-1">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                      Retroalimentación del Docente (General):
                    </Label>
                    <Textarea
                      id="generalFeedback"
                      value={teacherFeedbackGeneral}
                      onChange={(e) => setTeacherFeedbackGeneral(e.target.value)}
                      placeholder="Escribe aquí tu retroalimentación general para el estudiante..."
                      rows={3}
                      className="bg-background"
                    />
                  </div>
                </CardContent>
              </Card>
  
              <Separator />
              <h3 className="text-xl font-semibold text-primary">Respuestas del Estudiante:</h3>
  
              {attemptDetails.questions.map((q, index) => (
                <Card key={q.id || `q-${index}`} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Pregunta {index + 1}:</span>
                      <Badge variant="secondary">
                        {q.points_obtained} / {q.points} Puntos
                      </Badge>
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
                        <Label className="font-medium text-sm">Respuesta del Estudiante:</Label>
                        <p className="text-sm p-2 bg-card border rounded-md">
                          {q.answer_submitted.answer_written || (
                            <span className="italic text-muted-foreground">No respondida</span>
                          )}
                        </p>
                      </div>
                    )}
  
                    {q.answer_submitted.type === "submitted_multiple_option" && q.answer_base.options && (
                      <div>
                        <Label className="font-medium text-sm">Opciones y Selección del Estudiante:</Label>
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
                                id={`q${q.id}-opt${optIndex}`}
                                checked={opt === q.answer_submitted.option_select}
                                disabled
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`q${q.id}-opt${optIndex}`}
                                className={`flex-1 ${opt === q.answer_correct ? 'text-green-700 font-medium' : ''} 
                                            ${opt === q.answer_submitted.option_select && opt !== q.answer_correct ? 'text-red-600' : ''}`}
                              >
                                {opt}
                              </label>
                              {opt === q.answer_correct && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                              {opt === q.answer_submitted.option_select && opt !== q.answer_correct && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          ))}
                          {!q.answer_base.options.includes(q.answer_submitted.option_select || "") &&
                            q.answer_submitted.option_select && (
                              <p className="text-xs text-red-500 italic">
                                La opción seleccionada por el estudiante no está entre las opciones válidas actuales.
                              </p>
                            )}
                          {(q.answer_submitted.option_select === undefined || q.answer_submitted.option_select === "") && (
                            <p className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md">
                              El estudiante no seleccionó una opción.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
  
                    {q.feedback_automated && (
                      <div className="p-2 border-l-2 border-blue-400 bg-blue-50 rounded-r-md text-xs">
                        <p className="font-semibold text-blue-600 mb-0.5">Retro. Automática:</p>
                        <p className="text-blue-500">{q.feedback_automated}</p>
                      </div>
                    )}
                    <div>
                      <Label
                        htmlFor={`qFeedback-${q.id || index}`}
                        className="font-medium text-sm flex items-center mb-1"
                      >
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        Retro. Docente (Pregunta):
                      </Label>
                      <Textarea
                        id={`qFeedback-${q.id || index}`}
                        value={q.id ? teacherFeedbackQuestions[q.id] || '' : ''}
                        onChange={(e) => {
                          if (q.id) {
                            setTeacherFeedbackQuestions((prev) => ({
                              ...prev,
                              [q.id!]: e.target.value,
                            }));
                          }
                        }}
                        placeholder="Retroalimentación específica para esta pregunta..."
                        rows={2}
                        className="text-sm bg-background"
                        disabled={!q.id}
                      />
                      {!q.id && (
                        <p className="text-xs text-red-500">
                          No se puede dar feedback: ID de pregunta faltante.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
  
        {/* Footer abajo gracias a grid */}
        <DialogFooter className="pt-4 border-t bg-background py-4 px-6 -mx-6">
          <div className="w-full flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveFeedback} disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Retroalimentación
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );}