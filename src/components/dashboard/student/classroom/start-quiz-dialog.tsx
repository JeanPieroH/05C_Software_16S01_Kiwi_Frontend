
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { QuizForTaking, Question, StudentQuizSubmissionPayload, StudentSubmittedAnswerPayload } from '@/types/entities';
import { fetchQuizForTaking, submitStudentQuizAttempt } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, PlayCircle, Send, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format, differenceInSeconds, intervalToDuration } from 'date-fns';
import { es } from 'date-fns/locale';

interface StartQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  studentId: string;
  onQuizAttemptSubmitted: () => void; // To refresh classroom data after submission
}

// Schema for a single answer in the form
const answerSchema = z.object({
  questionId: z.string(),
  answerValue: z.string().optional(), // For text or selected radio option
});

// Schema for the overall form
const quizAttemptFormSchema = z.object({
  answers: z.array(answerSchema),
});

type QuizAttemptFormValues = z.infer<typeof quizAttemptFormSchema>;

export default function StartQuizDialog({
  open,
  onOpenChange,
  quizId,
  studentId,
  onQuizAttemptSubmitted,
}: StartQuizDialogProps) {
  const { toast } = useToast();
  const [quizDetails, setQuizDetails] = useState<QuizForTaking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const formSubmittedRef = useRef(false); // To prevent multiple submissions

  const form = useForm<QuizAttemptFormValues>({
    resolver: zodResolver(quizAttemptFormSchema),
    defaultValues: {
      answers: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const loadQuizDetails = useCallback(async () => {
    if (!open || !quizId) return;
    setIsLoading(true);
    setError(null);
    formSubmittedRef.current = false;
    try {
      const data = await fetchQuizForTaking(quizId);
      if (data) {
        setQuizDetails(data);
        // Initialize form fields based on fetched questions
        const initialAnswers = (data.questions || []).map(q => ({
          questionId: q.id!.toString(), // Assuming question ID is always present and can be string
          answerValue: q.answer_base.type === "base_multiple_option" ? undefined : "", // Default for radio / text
        }));
        replace(initialAnswers); // Use replace to set the field array
      } else {
        setError("No se pudieron cargar los detalles del quiz para iniciar.");
      }
    } catch (err) {
      console.error("Error fetching quiz for taking:", err);
      setError("Error al cargar el quiz.");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, open, replace]);

  useEffect(() => {
    if (open) {
      loadQuizDetails();
    } else {
      // Reset state when dialog closes
      setQuizDetails(null);
      setIsLoading(true);
      setIsSubmitting(false);
      setError(null);
      setTimeLeft(null);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      form.reset({ answers: [] });
    }
  }, [open, loadQuizDetails, form]);

  const handleSubmitAttempt = useCallback(async (data: QuizAttemptFormValues) => {
    if (!quizDetails || !studentId || formSubmittedRef.current) return;

    setIsSubmitting(true);
    formSubmittedRef.current = true; // Mark as submitted
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const submissionPayload: StudentQuizSubmissionPayload = {
      quiz_id: quizDetails.id,
      student_id: studentId,
      is_present: true, // Assuming student is present if they submit
      questions: data.answers.map(ans => {
        const questionDetail = quizDetails.questions?.find(q => q.id!.toString() === ans.questionId);
        return {
          question_id: ans.questionId,
          answer_submitted: {
            type: questionDetail?.answer_base.type === "base_multiple_option" ? "submitted_multiple_option" : "submitted_text",
            ...(questionDetail?.answer_base.type === "base_multiple_option"
              ? { option_select: ans.answerValue }
              : { answer_written: ans.answerValue }),
          },
        };
      }),
    };

    try {
      const response = await submitStudentQuizAttempt(submissionPayload);
      if (response.success) {
        toast({
          title: "Quiz Enviado",
          description: `Tu entrega ha sido registrada. Puntos obtenidos: ${response.points_obtained ?? 'Calculando...'}`,
        });
        onQuizAttemptSubmitted();
        onOpenChange(false);
      } else {
        toast({ title: "Error al Enviar", description: response.message, variant: "destructive" });
        formSubmittedRef.current = false; // Allow resubmission on error
      }
    } catch (err) {
      toast({ title: "Error de Red", description: "No se pudo enviar tu entrega.", variant: "destructive" });
      formSubmittedRef.current = false; // Allow resubmission on error
    } finally {
      setIsSubmitting(false);
    }
  }, [quizDetails, studentId, toast, onOpenChange, onQuizAttemptSubmitted]);


  // Countdown Timer Logic
  useEffect(() => {
    if (quizDetails?.end_time && open && !formSubmittedRef.current) {
      const endTime = new Date(quizDetails.end_time);

      const updateTimer = () => {
        const now = new Date();
        const secondsRemaining = differenceInSeconds(endTime, now);

        if (secondsRemaining <= 0) {
          setTimeLeft(intervalToDuration({ start: 0, end: 0 }));
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          // Auto-submit if not already submitted
          if (!formSubmittedRef.current) {
            toast({ title: "Tiempo Terminado", description: "Enviando tu quiz automáticamente...", variant: "default" });
            form.handleSubmit(handleSubmitAttempt)();
          }
        } else {
          setTimeLeft(intervalToDuration({ start: 0, end: secondsRemaining * 1000 }));
        }
      };

      updateTimer(); // Initial call
      timerIntervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [quizDetails, open, form, handleSubmitAttempt, toast]);


  const formatTime = (duration: Duration | null): string => {
    if (!duration) return "00:00:00";
    const { days, hours, minutes, seconds } = duration;
    const totalHours = (days || 0) * 24 + (hours || 0);
    return `${String(totalHours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:${String(seconds || 0).padStart(2, '0')}`;
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPPp", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen && !formSubmittedRef.current && quizDetails) { // If closing manually before submission
             // Optionally, ask for confirmation before closing if quiz started
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl h-[90vh] grid grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary flex items-center">
            <PlayCircle className="mr-2 h-6 w-6" />
            {quizDetails?.title || "Cargando Quiz..."}
          </DialogTitle>
          {quizDetails && <DialogDescription>{quizDetails.instruction}</DialogDescription>}
        </DialogHeader>

        <div className="overflow-y-auto pr-4 -mr-2">
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Cargando detalles del quiz...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
              <AlertTriangle className="h-10 w-10 mb-3" />
              <p className="text-center">{error}</p>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">Cerrar</Button>
            </div>
          )}

          {!isLoading && !error && quizDetails && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitAttempt)} className="space-y-6 py-4">
                <Card className="bg-muted/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Información y Tiempo</CardTitle>
                        {timeLeft && (
                            <div className="text-lg font-semibold text-destructive flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                Tiempo Restante: {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Inicia:</strong> {formatDate(quizDetails.start_time)}</p>
                    <p><strong>Termina:</strong> {formatDate(quizDetails.end_time)}</p>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold text-primary mt-4">Preguntas:</h3>
                
                {fields.map((item, index) => {
                  const questionDetail = quizDetails.questions?.find(q => q.id!.toString() === item.questionId);
                  if (!questionDetail) return null;

                  return (
                    <Card key={item.id} className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>Pregunta {index + 1}:</span>
                          <span className="text-sm text-muted-foreground">{questionDetail.points} Puntos</span>
                        </CardTitle>
                        <p className="text-sm text-foreground pt-1">{questionDetail.statement}</p>
                      </CardHeader>
                      <CardContent>
                        <Controller
                          control={form.control}
                          name={`answers.${index}.answerValue`}
                          defaultValue={questionDetail.answer_base.type === 'base_multiple_option' ? undefined : ""}
                          render={({ field }) => (
                            <FormItem>
                              {questionDetail.answer_base.type === 'base_text' && (
                                <>
                                  <FormLabel htmlFor={`q-${item.questionId}-text`} className="sr-only">Tu respuesta</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      id={`q-${item.questionId}-text`}
                                      placeholder="Escribe tu respuesta aquí..."
                                      {...field}
                                      value={field.value || ""}
                                      className="bg-background"
                                    />
                                  </FormControl>
                                </>
                              )}
                              {questionDetail.answer_base.type === 'base_multiple_option' && questionDetail.answer_base.options && (
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="space-y-2"
                                  >
                                    {questionDetail.answer_base.options.map((opt, optIndex) => (
                                      <FormItem key={optIndex} className="flex items-center space-x-3 space-y-0 p-2 border rounded-md hover:bg-muted/50">
                                        <FormControl>
                                          <RadioGroupItem value={opt} id={`q-${item.questionId}-opt-${optIndex}`} />
                                        </FormControl>
                                        <FormLabel htmlFor={`q-${item.questionId}-opt-${optIndex}`} className="font-normal cursor-pointer flex-1">
                                          {opt}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
                
                <DialogFooter className="pt-4 border-t bg-background py-4 px-6 -mx-6 sticky bottom-0 z-10">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Enviar Quiz
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

