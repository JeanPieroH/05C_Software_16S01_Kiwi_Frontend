
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@/types/auth';
import { fetchClassroomDetails, fetchGeneralResults, fetchCompetencyResults, fetchClassroomTeachers, fetchClassroomStudents } from '@/lib/api';
import type { Classroom, Competency, StudentResult } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Users, BarChart3, Info, School, ListFilter, Loader2, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import QuizList from '@/components/dashboard/teacher/classroom/quiz-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultsPodium from '@/components/dashboard/teacher/classroom/results-podium';
import ResultsTable from '@/components/dashboard/teacher/classroom/results-table';
import UserDisplayCard from '@/components/dashboard/teacher/classroom/user-display-card';
import AddPeopleDialog from '@/components/dashboard/teacher/classroom/add-people-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function ClassroomDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { toast } = useToast();

  const [classroomDetails, setClassroomDetails] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Results Tab
  const [selectedResultsFilter, setSelectedResultsFilter] = useState<string>("general");
  const [resultsData, setResultsData] = useState<StudentResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [classroomCompetenciesForFilter, setClassroomCompetenciesForFilter] = useState<Competency[]>([]);

  // State for People Tab
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("quizzes");
  const [isAddPeopleDialogOpen, setIsAddPeopleDialogOpen] = useState(false);


  useEffect(() => {
    if (classroomId) {
      async function loadInitialData() {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchClassroomDetails(classroomId);
          if (data) {
            setClassroomDetails(data);
            setClassroomCompetenciesForFilter(data.competences || []);
            // Fetch general results by default for the results tab
            handleFetchResults("general", data.competences || []);
            // Fetch people data if the people tab might be active or for pre-loading
            if (activeTab === "people") {
                 handleFetchPeople();
            }
          } else {
            setError("No se pudieron cargar los detalles del classroom.");
          }
        } catch (err) {
          setError("Error al cargar los detalles del classroom. Intente de nuevo.");
          console.error(err);
          toast({ title: "Error de Carga", description: "No se pudieron cargar los detalles del classroom.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, toast]);

 useEffect(() => {
    if (classroomId && classroomDetails) {
        handleFetchResults(selectedResultsFilter, classroomDetails.competences || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResultsFilter, classroomId, classroomDetails]);

  useEffect(() => {
    if (activeTab === 'people' && classroomId && (teachers.length === 0 && students.length === 0 && !peopleLoading)) { 
      handleFetchPeople();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, classroomId]);


  const handleFetchResults = async (filter: string, competencies: Competency[]) => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      let data: StudentResult[];
      if (filter === "general") {
        data = await fetchGeneralResults(classroomId);
      } else {
        const selectedCompetency = competencies.find(c => c.id === filter);
        if (!selectedCompetency) throw new Error("Competencia seleccionada no válida");
        data = await fetchCompetencyResults(classroomId, filter);
      }
      setResultsData(data);
    } catch (err) {
      console.error("Error fetching results:", err);
      const errorMessage = (err instanceof Error) ? err.message : "Ocurrió un error desconocido.";
      setResultsError(`Error al cargar resultados: ${errorMessage}`);
      toast({ title: "Error de Resultados", description: `No se pudieron cargar los resultados: ${errorMessage}`, variant: "destructive" });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleFetchPeople = async () => {
    if(peopleLoading) return; // Prevent multiple simultaneous fetches
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      const [fetchedTeachers, fetchedStudents] = await Promise.all([
        fetchClassroomTeachers(classroomId),
        fetchClassroomStudents(classroomId)
      ]);
      setTeachers(fetchedTeachers);
      setStudents(fetchedStudents);
    } catch (err) {
      console.error("Error fetching people:", err);
      const errorMessage = (err instanceof Error) ? err.message : "Ocurrió un error desconocido.";
      setPeopleError(`Error al cargar personas: ${errorMessage}`);
      toast({ title: "Error al Cargar Personas", description: `No se pudieron cargar los docentes y estudiantes: ${errorMessage}`, variant: "destructive" });
    } finally {
      setPeopleLoading(false);
    }
  };

  const handlePeopleAdded = () => {
    toast({ title: "Lista Actualizada", description: "Refrescando lista de personas..."});
    handleFetchPeople(); // Re-fetch people to update the lists
  };

  if (loading && !classroomDetails) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <Card>
          <CardHeader> <Skeleton className="h-6 w-1/3" /> </CardHeader>
          <CardContent className="space-y-4"> {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-20 w-full" /> ))} </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => router.push('/dashboard/classrooms')}> <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Classrooms </Button>
      </div>
    );
  }

  if (!classroomDetails) {
    return (
      <div className="text-center py-10">
        <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-4">Classroom no encontrado.</p>
         <Button onClick={() => router.push('/dashboard/classrooms')}> <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Classrooms </Button>
      </div>
    );
  }

  const handleQuizCreated = (newQuiz: any) => {
    toast({ title: "Quiz Creado", description: `El quiz "${newQuiz.title}" ha sido creado. Refrescando datos...` });
    async function reloadClassroomData() {
        try {
            const data = await fetchClassroomDetails(classroomId); 
            if (data) {
                setClassroomDetails(data);
                setClassroomCompetenciesForFilter(data.competences || []);
            }
        } catch (err) {
            toast({ title: "Error", description: "No se pudieron recargar los datos del classroom.", variant: "destructive" });
        }
    }
    reloadClassroomData();
  };


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/dashboard/classrooms')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Classrooms
      </Button>

      <div className="mb-6">
        <h2 className="text-3xl font-headline text-primary">{classroomDetails.name}</h2>
        <p className="text-lg text-muted-foreground mt-1">{classroomDetails.description}</p>
      </div>

      <Tabs defaultValue="quizzes" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
          <TabsTrigger value="quizzes"><FileText className="mr-2 h-4 w-4"/>Quizzes</TabsTrigger>
          <TabsTrigger value="results"><BarChart3 className="mr-2 h-4 w-4"/>Resultados</TabsTrigger>
          <TabsTrigger value="people"><Users className="mr-2 h-4 w-4"/>Personas</TabsTrigger>
        </TabsList>
        <TabsContent value="quizzes">
          <QuizList quizzes={classroomDetails.quiz || []} classroomId={classroomId} onQuizCreated={handleQuizCreated}/>
        </TabsContent>
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Resultados del Classroom</CardTitle>
                    <CardDescription>Filtra para ver el ranking general o por competencia.</CardDescription>
                </div>
                <div className="w-full sm:w-auto min-w-[200px] sm:min-w-[250px]">
                    <Select value={selectedResultsFilter} onValueChange={setSelectedResultsFilter}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center"> <ListFilter className="h-4 w-4 mr-2 opacity-70" /> <SelectValue placeholder="Filtrar resultados..." /> </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">Resultado General</SelectItem>
                            {classroomCompetenciesForFilter.map(comp => ( <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem> ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resultsLoading && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4"> <Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="text-muted-foreground">Cargando resultados...</p> </div>
              )}
              {!resultsLoading && resultsError && (
                <div className="text-center py-10 text-destructive"> <Info className="mx-auto h-10 w-10 mb-3" /> <p>{resultsError}</p> </div>
              )}
              {!resultsLoading && !resultsError && (
                <> <ResultsPodium topStudents={resultsData.slice(0, 3)} /> <ResultsTable results={resultsData} /> </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="people">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personas en el Classroom</CardTitle>
                  <CardDescription>Docentes y estudiantes inscritos en este classroom.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsAddPeopleDialogOpen(true)}> 
                    <UserPlus className="mr-2 h-4 w-4" /> Añadir Personas 
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {peopleLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4 mb-2" /> 
                    {[...Array(1)].map((_, i) => <Skeleton key={`teacher-skel-${i}`} className="h-20 w-full" />)}
                    <Skeleton className="h-px w-full my-4" /> 
                    <Skeleton className="h-8 w-1/4 mb-2" /> 
                    {[...Array(2)].map((_, i) => <Skeleton key={`student-skel-${i}`} className="h-20 w-full" />)}
                </div>
              )}
              {!peopleLoading && peopleError && (
                <div className="text-center py-10 text-destructive"> <Info className="mx-auto h-10 w-10 mb-3" /> <p>{peopleError}</p> </div>
              )}
              {!peopleLoading && !peopleError && (
                <>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Docentes ({teachers.length})</h3>
                    {teachers.length > 0 ? (
                      teachers.map(user => <UserDisplayCard key={user.id} user={user} />)
                    ) : (
                      <p className="text-muted-foreground">No hay docentes asignados a este classroom.</p>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Estudiantes ({students.length})</h3>
                    {students.length > 0 ? (
                      students.map(user => <UserDisplayCard key={user.id} user={user} />)
                    ) : (
                      <p className="text-muted-foreground">No hay estudiantes inscritos en este classroom.</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddPeopleDialog
        classroomId={classroomId}
        open={isAddPeopleDialogOpen}
        onOpenChange={setIsAddPeopleDialogOpen}
        onPeopleAdded={handlePeopleAdded}
      />
    </div>
  );
}
