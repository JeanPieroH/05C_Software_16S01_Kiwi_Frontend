
"use client";

import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useForm, useFieldArray, FormProvider,useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitleComponent } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, CalendarIcon, Check, ChevronsUpDown, XCircle, UploadCloud, FileText as FileTextIcon, Settings2, ChevronDown, AlertTriangle, Wand2 } from 'lucide-react';
import { createQuiz, fetchClassroomCompetenciesForQuiz, generateQuizFromDocument, generateQuizFromText } from '@/lib/api';
import type { NewQuizPayload, Question as QuestionType, Competency, AnswerBase, Quiz, GenerateQuizFromDocumentPayload, GenerateQuizFromTextPayload, TypeQuestion } from '@/types/entities';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CardHeader } from '@/components/ui/card';

interface CreateQuizDialogProps {
  classroomId: string;
  onQuizCreated: (newQuiz: Quiz) => void;
  children: React.ReactNode;
}

const questionSchema = z.object({
  statement: z.string().min(1, "El enunciado es requerido."),
  points: z.coerce.number().min(0, "Los puntos no pueden ser negativos.").max(100, "Máximo 100 puntos por pregunta."),
  answer_correct: z.string().optional(),
  answer_base: z.object({
    type: z.enum(["base_text", "base_multiple_option"]),
    options: z.array(z.string().max(200, "Cada opción no debe exceder los 200 caracteres.")).optional(),
  }).refine(data => {
    if (data.type === "base_multiple_option") {
      const validOptions = data.options?.filter(opt => opt && opt.trim() !== "") || [];
      return validOptions.length >= 2;
    }
    return true;
  }, {
    message: "Opción múltiple debe tener al menos 2 opciones válidas.",
    path: ["options"],
  }),
  competences_id: z.array(z.string()),
}).refine(data => {
  if (data.answer_base.type === "base_multiple_option") {
    if (!data.answer_correct || data.answer_correct.trim() === "") {
        return false;
    }
    const validOptions = data.answer_base.options?.filter(opt => opt && opt.trim() !== "") || [];
    return validOptions.includes(data.answer_correct);
  }
  return true;
}, {
  message: "Para opción múltiple: debe haber al menos 2 opciones válidas, la respuesta correcta debe ser seleccionada y ser una de las opciones válidas.",
  path: ["answer_correct"],
});


const createQuizFormSchema = z.object({
  title: z.string().min(1, "El título es requerido.").max(100, "El título no debe exceder los 100 caracteres."),
  instruction: z.string().min(1, "Las instrucciones son requeridas.").max(500, "Las instrucciones no deben exceder los 500 caracteres."),
  start_time: z.date({ required_error: "La fecha de inicio es requerida." }),
  end_time: z.date({ required_error: "La fecha de fin es requerida." }),
  questions: z.array(questionSchema).min(1, "Debe haber al menos una pregunta.").max(50, "No se pueden agregar más de 50 preguntas."),
}).refine(data => data.end_time > data.start_time, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio.",
  path: ["end_time"],
});

type CreateQuizFormValues = z.infer<typeof createQuizFormSchema>;

const defaultQuestionValues: QuestionType = {
  statement: "",
  points: 0,
  answer_correct: undefined as any,
  answer_base: { type: "base_text", options: [] },
  competences_id: [],
};

const aiTypeQuestionSchema = z.object({
  textuales: z.boolean().default(false),
  inferenciales: z.boolean().default(true),
  criticas: z.boolean().default(false),
});

const aiBaseSchema = z.object({
  num_question: z.coerce.number().min(1, "Mínimo 1 pregunta.").max(20, "Máximo 20 preguntas."),
  point_max: z.coerce.number().min(1, "Mínimo 1 punto.").max(100, "Máximo 100 puntos."),
  type_question: aiTypeQuestionSchema,
});

const aiFormPdfSchema = aiBaseSchema;
const aiFormTextSchema = aiBaseSchema.extend({
  text: z.string().min(10, "El texto debe tener al menos 10 caracteres.").max(5000, "El texto no debe exceder los 5000 caracteres."),
});

type AiFormPdfValues = z.infer<typeof aiFormPdfSchema>;
type AiFormTextValues = z.infer<typeof aiFormTextSchema>;

export default function CreateQuizDialog({ classroomId, onQuizCreated, children }: CreateQuizDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [classroomCompetencies, setClassroomCompetencies] = useState<Competency[]>([]);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);
  const prevIsOpenRef = useRef(isOpen);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogTitle, setAlertDialogTitleContent] = useState("");
  const [alertDialogDescription, setAlertDialogDescription] = useState("");
  const [onAlertDialogConfirm, setOnAlertDialogConfirm] = useState<(() => void) | null>(null);

  const form = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: "",
      instruction: "",
      start_time: undefined,
      end_time: undefined,
      questions: [JSON.parse(JSON.stringify(defaultQuestionValues))],
    },
  });
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const aiFormPdf = useForm<AiFormPdfValues>({
    resolver: zodResolver(aiFormPdfSchema),
    defaultValues: {
      num_question: 5,
      point_max: 20,
      type_question: { textuales: false, inferenciales: true, criticas: false },
    },
  });

  const aiFormText = useForm<AiFormTextValues>({
    resolver: zodResolver(aiFormTextSchema),
    defaultValues: {
      text: "",
      num_question: 5,
      point_max: 20,
      type_question: { textuales: false, inferenciales: true, criticas: false },
    },
  });

 useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setIsLoadingCompetencies(true);
      fetchClassroomCompetenciesForQuiz(classroomId)
        .then(setClassroomCompetencies)
        .catch(err => {
          console.error("Failed to fetch classroom competencies", err);
          toast({ title: "Error", description: "No se pudieron cargar las competencias del classroom.", variant: "destructive" });
        })
        .finally(() => setIsLoadingCompetencies(false));

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        form.reset({
          title: "",
          instruction: "",
          start_time: undefined,
          end_time: undefined,
          questions: [JSON.parse(JSON.stringify(defaultQuestionValues))],
        });
        aiFormPdf.reset();
        aiFormText.reset();
        setSelectedPdfFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }, 0);
    }
    prevIsOpenRef.current = isOpen;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, classroomId, form, aiFormPdf, aiFormText, toast]);


  const onSubmit = async (data: CreateQuizFormValues) => {
    const payload: NewQuizPayload = {
      classroom_id: classroomId,
      title: data.title,
      instruction: data.instruction,
      start_time: data.start_time.toISOString(),
      end_time: data.end_time.toISOString(),
      questions: data.questions.map(q => ({
        ...q,
        answer_correct: q.answer_base.type === "base_text" ? (q.answer_correct || "") : q.answer_correct!,
        answer_base: {
            type: q.answer_base.type,
            options: q.answer_base.type === 'base_multiple_option' ? (q.answer_base.options || []) : undefined,
        },
      })),
    };

    try {
      const newQuiz = await createQuiz(payload);
      toast({
        title: "Quiz Creado",
        description: `El quiz "${newQuiz.title}" ha sido creado exitosamente.`,
      });
      onQuizCreated(newQuiz);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create quiz", error);
      toast({
        title: "Error al Crear Quiz",
        description: (error as Error).message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

 const handleAnswerTypeChange = (questionIndex: number, type: "base_text" | "base_multiple_option") => {
    if (type === "base_text") {
      form.setValue(`questions.${questionIndex}.answer_base.options`, []);
      form.setValue(`questions.${questionIndex}.answer_correct`, "");
    } else { // base_multiple_option
      const currentOptions = form.getValues(`questions.${questionIndex}.answer_base.options`);
      if (!currentOptions || currentOptions.length < 2) {
        form.setValue(`questions.${questionIndex}.answer_base.options`, ["Opcion 1" ,"Opcion 2"]);
      }
      form.setValue(`questions.${questionIndex}.answer_correct`, "Opcion 1");
    }
    form.trigger(`questions.${questionIndex}.answer_correct`);
    form.trigger(`questions.${questionIndex}.answer_base.options`);
  };


  const transformAiQuestionsToFormQuestions = (aiQuestions: Partial<QuestionType>[]): QuestionType[] => {
    return aiQuestions.map((q, idx) => ({
        id: `ai-gen-${Date.now()}-${idx}`,
        statement: q.statement || "Pregunta generada por IA",
        points: q.points || 0,
        answer_correct: q.answer_base?.type === "base_multiple_option"
                            ? (q.answer_base.options?.includes(q.answer_correct || "") ? q.answer_correct : undefined as any)
                            : (q.answer_correct || ""),
        answer_base: q.answer_base || { type: "base_text" },
        competences_id: q.competences_id || [],
    }));
  };

  const handleAiGenerateSubmit = async (
    aiData: AiFormPdfValues | AiFormTextValues,
    generationMode: "add" | "replace",
    source: "pdf" | "text"
  ) => {
    setAlertDialogOpen(false);
    let generatedQuizPartial: Partial<Quiz>;

    try {
        toast({ title: "Generando Quiz con IA...", description: "Esto puede tomar unos momentos."});
        if (source === "pdf") {
            if (!selectedPdfFile) {
                toast({ title: "Error", description: "Por favor, selecciona un archivo PDF.", variant: "destructive" });
                return;
            }
            const payload: GenerateQuizFromDocumentPayload = {
                classroom_id: classroomId,
                num_question: aiData.num_question,
                point_max: aiData.point_max,
                competences: classroomCompetencies,
                type_question: aiData.type_question as TypeQuestion,
            };
            generatedQuizPartial = await generateQuizFromDocument(payload, selectedPdfFile);
        } else {
            const payload: GenerateQuizFromTextPayload = {
                classroom_id: classroomId,
                num_question: aiData.num_question,
                point_max: aiData.point_max,
                text: (aiData as AiFormTextValues).text,
                competences: classroomCompetencies,
                type_question: aiData.type_question as TypeQuestion,
            };
            generatedQuizPartial = await generateQuizFromText(payload);
        }

        const newQuestions = transformAiQuestionsToFormQuestions(generatedQuizPartial.questions || []);

        if (generationMode === "add") {
            newQuestions.forEach(q => appendQuestion(q));
            toast({ title: "Preguntas Añadidas", description: "Nuevas preguntas generadas por IA han sido añadidas al editor." });
        } else {
            if (generatedQuizPartial.title) form.setValue("title", generatedQuizPartial.title);
            if (generatedQuizPartial.instruction) form.setValue("instruction", generatedQuizPartial.instruction);
            if (generatedQuizPartial.start_time) form.setValue("start_time", new Date(generatedQuizPartial.start_time));
            if (generatedQuizPartial.end_time) form.setValue("end_time", new Date(generatedQuizPartial.end_time));
            form.setValue("questions", newQuestions.length > 0 ? newQuestions : [JSON.parse(JSON.stringify(defaultQuestionValues))]);
            toast({ title: "Quiz Reemplazado", description: "El quiz ha sido reemplazado con el contenido generado por IA." });
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        toast({ title: "Error de Generación IA", description: (error as Error).message || "No se pudo generar el quiz.", variant: "destructive" });
    }
  };

  const openConfirmationDialog = (mode: "add" | "replace", source: "pdf" | "text") => {
    const currentAiForm = source === "pdf" ? aiFormPdf : aiFormText;

    currentAiForm.trigger().then(isValid => {
        if (isValid) {
            if (source === "pdf" && !selectedPdfFile) {
                toast({ title: "Archivo Requerido", description: "Por favor, selecciona un archivo PDF para continuar.", variant: "destructive" });
                aiFormPdf.setError("root", { type: "manual", message: "Archivo PDF es requerido." });
                return;
            }

            const data = currentAiForm.getValues();
            setAlertDialogTitleContent(mode === "add" ? "Confirmar Añadir Preguntas" : "Confirmar Reemplazar Quiz");
            setAlertDialogDescription(
              mode === "add"
                ? "Esta acción generará y añadirá nuevas preguntas al quiz actual. ¿Deseas continuar?"
                : "Esta acción generará un nuevo quiz y reemplazará todo el contenido actual del editor. ¿Deseas continuar?"
            );
            setOnAlertDialogConfirm(() => () => handleAiGenerateSubmit(data, mode, source));
            setAlertDialogOpen(true);
        } else {
            toast({ title: "Campos Inválidos", description: "Por favor, corrige los errores en el formulario de generación IA.", variant: "destructive" });
        }
    });
  };

  const OptionsArray = ({ questionIndex }: { questionIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `questions.${questionIndex}.answer_base.options`
    });
    const currentAnswerCorrect = useWatch({
      control: form.control,
      name: `questions.${questionIndex}.answer_correct`,
    });
    
    const currentOptions = useWatch({
      control: form.control,
      name: `questions.${questionIndex}.answer_base.options`,
    }) || [];

    const handleRemoveOption = (optionIndex: number) => {
        const removedOptionValue = currentOptions[optionIndex];
        remove(optionIndex);
        if (removedOptionValue === currentAnswerCorrect) {
            form.setValue(`questions.${questionIndex}.answer_correct`, undefined as any);
        }
        form.trigger(`questions.${questionIndex}.answer_correct`);
    };

    const validSelectOptions = currentOptions.filter(opt => opt && opt.trim() !== "");

    return (
      <div className="space-y-2 pl-4 mt-2">
        {fields.map((item, optionIndex) => (
          <div key={item.id} className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name={`questions.${questionIndex}.answer_base.options.${optionIndex}`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                        {...field}
                        placeholder={`Opción ${optionIndex + 1}`}
                        onChange={(e) => {
                            field.onChange(e);
                            {/*form.trigger(`questions.${questionIndex}.answer_correct`);*/}
                        }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.length > 2 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(optionIndex)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => { append(" "); form.trigger(`questions.${questionIndex}.answer_correct`); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Opción
        </Button>
         {currentOptions && currentOptions.length >= 0 && (
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.answer_correct`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Respuesta Correcta (Opción Múltiple)</FormLabel>
                <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.trigger(`questions.${questionIndex}.answer_correct`);
                      }}
                      value={field.value || ""}
                    >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la respuesta correcta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validSelectOptions.length > 0 ? (
                        validSelectOptions.map((opt, idx) => (
                            <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                        ))
                    ) : (
                         <div className="p-2 text-sm text-muted-foreground text-center">Añade opciones válidas.</div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 text-2xl text-primary">
              <Wand2 className="h-6 w-6" />
              <span>Creación de Quiz asistida por Inteligencia Artificial</span>
            </div>
          </DialogTitle>
          <DialogDescription>Utiliza la IA para generar preguntas o crea tu quiz manualmente.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto pr-1 -mr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <div className="flex flex-col space-y-4 pr-2 md:border-r">
              <h3 className="text-lg font-semibold text-primary">¡Crea Quizzes con IA!</h3>
              <p className="text-sm text-muted-foreground">Genera exámenes fácilmente de dos maneras:</p>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li><strong>Desde un Documento:</strong> Sube un PDF. Nuestra IA lo analizará y creará las preguntas. Luego, puedes revisar y ajustar.</li>
                <li><strong>Desde Texto Ingresado:</strong> Pega o escribe tu propio texto. La IA lo usará para generar las preguntas. Igual, puedes editar y personalizar después.</li>
              </ol>

              <Tabs defaultValue="from-pdf" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="from-pdf"><UploadCloud className="mr-2 h-4 w-4"/>Desde PDF</TabsTrigger>
                  <TabsTrigger value="from-text"><FileTextIcon className="mr-2 h-4 w-4"/>Desde Texto</TabsTrigger>
                </TabsList>

                <TabsContent value="from-pdf" className="p-4 border rounded-md mt-2 bg-card space-y-4">
                  <FormProvider {...aiFormPdf}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                      <h4 className="text-md font-medium">Sube PDF, Crea Quiz con IA</h4>
                      <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                        <li>Sube tu PDF.</li>
                        <li>La IA genera el quiz.</li>
                        <li>Revisa y edita.</li>
                        <li>¡Así de rápido!</li>
                      </ol>
                      <p className="text-xs text-muted-foreground">
                        Puedes solo añadir preguntas si seleccionas "Generar y Añadir"
                        o reemplazar todo el quiz si seleccionas "Generar y Reemplazar".
                      </p>

                      <FormItem>
                        <FormLabel>Archivo PDF</FormLabel>
                        <FormControl>
                          <div
                            className={cn(
                              "flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/70 bg-muted/30 hover:bg-muted/50",
                              aiFormPdf.formState.errors.root && "border-destructive"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const file = e.dataTransfer.files[0];
                                    if (file.type === "application/pdf") {
                                        setSelectedPdfFile(file);
                                        aiFormPdf.clearErrors("root");
                                    } else {
                                        toast({ title: "Tipo de archivo no válido", description: "Por favor, sube solo archivos PDF.", variant: "destructive"});
                                    }
                                }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <div className="text-center">
                              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                              {selectedPdfFile ? (
                                  <p className="text-sm text-foreground">{selectedPdfFile.name}</p>
                              ) : (
                                  <p className="text-sm text-muted-foreground">
                                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                  </p>
                              )}
                              <p className="text-xs text-muted-foreground">Solo PDF (MAX. 5MB)</p>
                            </div>
                            <Input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    if (file && file.type === "application/pdf") {
                                        if (file.size > 5 * 1024 * 1024) {
                                            toast({ title: "Archivo demasiado grande", description: "El PDF no debe exceder los 5MB.", variant: "destructive"});
                                            setSelectedPdfFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                            return;
                                        }
                                        setSelectedPdfFile(file);
                                        aiFormPdf.clearErrors("root");
                                    } else if (file) {
                                        toast({ title: "Tipo de archivo no válido", description: "Por favor, sube solo archivos PDF.", variant: "destructive"});
                                        setSelectedPdfFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    } else {
                                        setSelectedPdfFile(null);
                                    }
                                }}
                            />
                          </div>
                        </FormControl>
                         {aiFormPdf.formState.errors.root?.message && <FormMessage>{aiFormPdf.formState.errors.root.message}</FormMessage>}
                         {selectedPdfFile === null && aiFormPdf.formState.isSubmitted && !aiFormPdf.formState.errors.root && <FormMessage>Por favor, selecciona un archivo PDF.</FormMessage>}
                      </FormItem>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={aiFormPdf.control}
                          name="num_question"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº Preguntas</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="5" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={aiFormPdf.control}
                          name="point_max"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puntos Máx Totales</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="20" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormItem>
                        <FormLabel>Tipos de Pregunta</FormLabel>
                        <div className="flex items-center space-x-4">
                          {(["textuales", "inferenciales", "criticas"] as const).map((typeName) => (
                            <FormField
                              key={typeName}
                              control={aiFormPdf.control}
                              name={`type_question.${typeName}`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                  <FormLabel className="text-sm font-normal capitalize">{typeName.replace('criticas', 'críticas')}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        {(aiFormPdf.formState.errors.type_question as any)?.root?.message && <FormMessage>{(aiFormPdf.formState.errors.type_question as any)?.root?.message}</FormMessage>}
                      </FormItem>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" className="w-full">
                            <Settings2 className="mr-2 h-4 w-4" /> Generar con IA <ChevronDown className="ml-auto h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                          <DropdownMenuItem onClick={() => openConfirmationDialog("add", "pdf")}>
                            Generar y Añadir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openConfirmationDialog("replace", "pdf")}>
                            Generar y Reemplazar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </form>
                  </FormProvider>
                </TabsContent>

                <TabsContent value="from-text" className="p-4 border rounded-md mt-2 bg-card space-y-4">
                   <FormProvider {...aiFormText}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                      <h4 className="text-md font-medium">Escribe Texto, Crea Quiz con IA</h4>
                       <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                        <li>Pega o escribe tu contenido en el área de texto.</li>
                        <li>La IA genera el quiz.</li>
                        <li>Revisa y edita.</li>
                        <li>¡Así de fácil!</li>
                      </ol>
                      <p className="text-xs text-muted-foreground">
                        Puedes solo añadir preguntas si seleccionas "Generar y Añadir"
                        o reemplazar todo el quiz si seleccionas "Generar y Reemplazar".
                      </p>

                      <FormField
                        control={aiFormText.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contenido de Texto</FormLabel>
                            <FormControl><Textarea placeholder="Pega o escribe aquí el contenido para generar el quiz..." {...field} rows={6}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={aiFormText.control}
                          name="num_question"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº Preguntas</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="5" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={aiFormText.control}
                          name="point_max"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puntos Máx Totales</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="20" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormItem>
                        <FormLabel>Tipos de Pregunta</FormLabel>
                        <div className="flex items-center space-x-4">
                          {(["textuales", "inferenciales", "criticas"] as const).map((typeName) => (
                            <FormField
                              key={typeName}
                              control={aiFormText.control}
                              name={`type_question.${typeName}`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                  <FormLabel className="text-sm font-normal capitalize">{typeName.replace('criticas', 'críticas')}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                         {(aiFormText.formState.errors.type_question as any)?.root?.message && <FormMessage>{(aiFormText.formState.errors.type_question as any)?.root?.message}</FormMessage>}
                      </FormItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" className="w-full">
                            <Settings2 className="mr-2 h-4 w-4" /> Generar con IA <ChevronDown className="ml-auto h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                           <DropdownMenuItem onClick={() => openConfirmationDialog("add", "text")}>
                            Generar y Añadir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openConfirmationDialog("replace", "text")}>
                            Generar y Reemplazar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </form>
                  </FormProvider>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex flex-col space-y-4 md:pl-2">
              <h3 className="text-lg font-semibold text-primary">Editor de Quiz Manual</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Quiz</FormLabel>
                        <FormControl><Input placeholder="Ej: Quiz de Matemáticas Básicas" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instruction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrucciones</FormLabel>
                        <FormControl><Textarea placeholder="Describe las instrucciones para el quiz..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha y Hora de Inicio</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn( "w-full justify-start text-left font-normal", !field.value && "text-muted-foreground" )}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>
                                          {field.value ? format(field.value, "PPP HH:mm") : "Elige una fecha y hora"}
                                        </span>
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </div>
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                  <div className="p-3 border-t border-border">
                                    <Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = field.value ? new Date(field.value) : new Date();
                                        newDate.setHours(hours, minutes, 0, 0);
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha y Hora de Fin</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn( "w-full justify-start text-left font-normal", !field.value && "text-muted-foreground" )}>
                                       <div className="flex items-center justify-between w-full">
                                        <span>
                                          {field.value ? format(field.value, "PPP HH:mm") : "Elige una fecha y hora"}
                                        </span>
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </div>
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                  <div className="p-3 border-t border-border">
                                    <Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = field.value ? new Date(field.value) : new Date();
                                        newDate.setHours(hours, minutes, 0, 0);
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                      />
                  </div>
                  <Separator />
                  <h4 className="text-md font-semibold">Preguntas</h4>
                  {questionFields.map((question, index) => {
                    return (
                    <div key={question.id} className="p-4 border rounded-md space-y-3 bg-card">
                      <div className="flex justify-between items-center">
                          <Label className="text-base">Pregunta {index + 1}</Label>
                          {questionFields.length > 1 && ( <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="text-destructive hover:bg-destructive/10"> <Trash2 className="h-4 w-4" /> </Button> )}
                      </div>
                      <FormField
  control={form.control}
  name={`questions.${index}.answer_base.type`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tipo de Respuesta</FormLabel>
      <Select
        onValueChange={(value: "base_text" | "base_multiple_option") => {
          field.onChange(value);
          handleAnswerTypeChange(index, value);
        }}
        value={field.value} // ✅ importante: usar field.value, no form.watch(...)
      >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de respuesta" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="base_text">Texto Libre</SelectItem>
            <SelectItem value="base_multiple_option">Opción Múltiple</SelectItem>
          </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>                                 
                        <FormField
                          control={form.control}
                          name={`questions.${index}.competences_id`}
                          render={({ field }) => {
                            const { id: formItemId, formDescriptionId, formMessageId, error } = useFormField();
                            return (
                            <FormItem>
                              <FormLabel>Competencias Asociadas</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value?.length && "text-muted-foreground"
                                    )}
                                    id={formItemId}
                                    aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
                                    aria-invalid={!!error}
                                  >
                                    <span className="flex items-center justify-between w-full">
                                      <span className="truncate">
                                        {(field.value || []).length > 0
                                          ? `${field.value.length} competencia(s) seleccionada(s)`
                                          : "Seleccionar competencias..."}
                                      </span>
                                      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                    </span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar competencia..." />
                                    <CommandList>
                                      <CommandEmpty>{isLoadingCompetencies ? "Cargando..." : "No se encontraron competencias."}</CommandEmpty>
                                      <CommandGroup>
                                        {classroomCompetencies.map((competency) => (
                                          <CommandItem
                                            key={competency.id}
                                            value={competency.name}
                                            onSelect={() => {
                                              const currentSelection = field.value || [];
                                              const newSelection = currentSelection.includes(competency.id)
                                                ? currentSelection.filter(id => id !== competency.id)
                                                : [...currentSelection, competency.id];
                                              field.onChange(newSelection);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                (field.value || []).includes(competency.id) ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {competency.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {(field.value || []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(field.value || []).map((competencyId) => {
                                    const comp = classroomCompetencies.find(c => c.id === competencyId);
                                    return comp ? (
                                      <Badge key={competencyId} variant="secondary" className="flex items-center">
                                        {comp.name}
                                        <button
                                          type="button"
                                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                          onClick={() => field.onChange((field.value || []).filter(id => id !== competencyId))}
                                        >
                                          <XCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                         }}
                        />
                      <FormField control={form.control} name={`questions.${index}.statement`} render={({ field }) => ( <FormItem> <FormLabel>Enunciado</FormLabel> <FormControl><Textarea placeholder="Escribe el enunciado de la pregunta..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`questions.${index}.points`} render={({ field }) => ( <FormItem> <FormLabel>Puntos</FormLabel> <FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                      </div>
                      {form.watch(`questions.${index}.answer_base.type`) === 'base_multiple_option' ? ( <OptionsArray questionIndex={index} /> ) : ( <FormField control={form.control} name={`questions.${index}.answer_correct`} render={({ field }) => ( <FormItem> <FormLabel>Respuesta Correcta (Texto Libre)</FormLabel> <FormControl><Textarea placeholder="Escribe la respuesta correcta..." {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )}/> )}
                      
                        
                    </div>
                  );
                  })}
                  <Button type="button" variant="outline" onClick={() => appendQuestion(JSON.parse(JSON.stringify(defaultQuestionValues)))}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Pregunta
                  </Button>

                  <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background py-4 px-6 -mx-6 z-10">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Creando Quiz..." : "Crear Quiz"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        </ScrollArea>
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitleComponent>{alertDialogTitle}</AlertDialogTitleComponent>
                <AlertDialogDescription>{alertDialogDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onAlertDialogConfirm || undefined}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

