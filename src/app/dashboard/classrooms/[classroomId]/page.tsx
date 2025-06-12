
"use client";

import { useEffect, useState, useCallback, useMemo,useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@/types/auth';
import { fetchClassroomDetails, fetchGeneralResults, fetchCompetencyResults, fetchClassroomTeachers, fetchClassroomStudents, fetchUserProfile } from '@/lib/api';
import type { Classroom, Competency, StudentResult, Quiz } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Users, BarChart3, Info, School, ListFilter, Loader2, UserPlus, BookCopy, Edit, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeacherQuizList from '@/components/dashboard/teacher/classroom/quiz-list';
import StudentQuizList from '@/components/dashboard/student/classroom/quiz-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultsPodium from '@/components/dashboard/teacher/classroom/results-podium';
import ResultsTable from '@/components/dashboard/teacher/classroom/results-table';
import UserDisplayCard from '@/components/dashboard/teacher/classroom/user-display-card';
import AddPeopleDialog from '@/components/dashboard/teacher/classroom/add-people-dialog';
import AssignCompetenciesDialog from '@/components/dashboard/teacher/classroom/assign-competencies-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import QuizSubmissionsSection from '@/components/dashboard/teacher/classroom/quiz-submissions-section';
import StudentViewAttemptDialog from '@/components/dashboard/student/classroom/student-view-attempt-dialog';
import StartQuizDialog from '@/components/dashboard/student/classroom/start-quiz-dialog';


export default function ClassroomDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  const [isAssignCompetenciesDialogOpen, setIsAssignCompetenciesDialogOpen] = useState(false);
  
  // For Teacher: Viewing submissions of a quiz
  const [selectedQuizForSubmissions, setSelectedQuizForSubmissions] = useState<Quiz | null>(null);
  
  // For Student: Viewing their own attempt
  const [isStudentViewAttemptDialogOpen, setIsStudentViewAttemptDialogOpen] = useState(false);
  const [selectedQuizIdForStudentView, setSelectedQuizIdForStudentView] = useState<string | null>(null);
  
  // For Student: Starting a quiz
  const [isStartQuizDialogOpen, setIsStartQuizDialogOpen] = useState(false);
  const [selectedQuizIdForTaking, setSelectedQuizIdForTaking] = useState<string | null>(null);

  const hasFetchedPeopleRef = useRef(false);
  const hasFetchedResultsRef = useRef(false);


  const loadInitialData = useCallback(async () => {
    if(!classroomId) return;
    setLoading(true);
    setError(null);
    try {
      // Pass current user's ID and role to fetchClassroomDetails
      // This allows the API mock to augment quiz data with student_attempt_summary if user is a student
      const user = await fetchUserProfile();
      if (!user) {
        toast({ title: "Error de Autenticación", description: "No se pudo verificar el usuario.", variant: "destructive" });
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const data = await fetchClassroomDetails(classroomId, user.id, user.role);
      if (data) {
        setClassroomDetails(data);
        setClassroomCompetenciesForFilter(data.competences || []);
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
  }, [classroomId, toast, router]);

  const handleFetchPeople = useCallback(async () => {
    if (!classroomId) return;
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
      setPeopleError("No se pudieron cargar las personas del classroom.");
      console.error('Error fetching people:', err);
    } finally {
      setPeopleLoading(false);
    }
  }, [classroomId]);

  const handleFetchResults = useCallback(
    async (filter: string) => {
      if (!classroomId) return;
      setResultsLoading(true);
      setResultsError(null);
      try {
        let data: StudentResult[] = [];
        if (filter === 'general') {
          data = await fetchGeneralResults(classroomId);
        } else {
          data = await fetchCompetencyResults(classroomId, filter);
        }
        setResultsData(data);
      } catch (err) {
        setResultsError("No se pudieron cargar los resultados.");
        console.error('Error fetching results:', err);
      } finally {
        setResultsLoading(false);
      }
    },
    [classroomId]
  );


  useEffect(() => {
    // Reset fetch flags if tab changes to ensure fresh data load for that tab
    if (activeTab === 'people') hasFetchedPeopleRef.current = false;
    if (activeTab === 'results') hasFetchedResultsRef.current = false;
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'people' && classroomId && !hasFetchedPeopleRef.current && !peopleLoading) {
      hasFetchedPeopleRef.current = true;
      handleFetchPeople();
    }
  }, [activeTab, classroomId, peopleLoading, handleFetchPeople]);

  useEffect(() => {
    if (
      classroomId &&
      classroomDetails && 
      activeTab === 'results' &&
      !hasFetchedResultsRef.current && !resultsLoading
    ) {
      hasFetchedResultsRef.current = true;
      handleFetchResults(selectedResultsFilter);
    }
  }, [selectedResultsFilter, classroomId, classroomDetails, activeTab, resultsLoading, handleFetchResults]);


  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 


  const handlePeopleAdded = useCallback(() => {
    toast({ title: "Lista Actualizada", description: "Refrescando lista de personas..."});
    handleFetchPeople(); 
  }, [handleFetchPeople, toast]);
  
  const handleAssignmentsSaved = useCallback((updatedClassroom: Classroom) => {
    setClassroomDetails(updatedClassroom); 
    setClassroomCompetenciesForFilter(updatedClassroom.competences || []);
    toast({ title: "Competencias Guardadas", description: "Las competencias del classroom han sido actualizadas." });
  }, [toast]);

  const handleQuizCreated = useCallback(() => {
    toast({ title: "Quiz Creado", description: `El quiz ha sido creado. Refrescando datos...` });
    loadInitialData(); 
  }, [loadInitialData, toast]);

  const handleViewSubmissions = useCallback((quizToView: Quiz) => {
    setSelectedQuizForSubmissions(quizToView);
  }, []);

  const handleCloseSubmissions = useCallback(() => {
    setSelectedQuizForSubmissions(null);
  }, []);

  const handleStartQuiz = useCallback((quizId: string) => {
    setSelectedQuizIdForTaking(quizId);
    setIsStartQuizDialogOpen(true);
  }, []);

  const handleViewStudentAttempt = useCallback((quizId: string) => {
    if (currentUser && currentUser.role === 'STUDENT') {
      setSelectedQuizIdForStudentView(quizId);
      setIsStudentViewAttemptDialogOpen(true);
    }
  }, [currentUser]);

  const handleQuizAttemptSubmitted = useCallback(() => {
    toast({ title: "Entrega Registrada", description: "Tu quiz ha sido enviado. Refrescando datos..." });
    loadInitialData(); // Re-fetch classroom details to update quiz list with attempt summary
  }, [loadInitialData, toast]);


  if (loading && !classroomDetails && !currentUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-16 w-full" />
            </div>
            <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <Skeleton className="h-10 w-full mb-4 mt-6" />
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

  if (!currentUser || !classroomDetails) {
    return (
      <div className="text-center py-10">
        <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-4">Classroom no encontrado o usuario no autenticado.</p>
         <Button onClick={() => router.push('/dashboard/classrooms')}> <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Classrooms </Button>
      </div>
    );
  }
  
  const isTeacher = currentUser.role === 'TEACHER';

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/dashboard/classrooms')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Classrooms
      </Button>

      <div >
        <h2 className="text-3xl font-headline text-primary mb-3">{classroomDetails.name}</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2 text-accent"/>
                Descripción del Classroom
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">{classroomDetails.description}</p>
          </div>
          {isTeacher && (
            <div className="mb-8 p-6 bg-card rounded-lg shadow-lg border">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-foreground flex items-center">
                        <BookCopy className="h-5 w-5 mr-2 text-accent"/>
                        Competencias Asignadas
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => setIsAssignCompetenciesDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Asignar Competencias
                    </Button>
                </div>
                {classroomDetails.competences && classroomDetails.competences.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 rounded-md">
                    {classroomDetails.competences.map(comp => (
                    <div key={comp.id} className="p-3 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-semibold text-foreground">{comp.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{comp.description}</p>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-sm text-muted-foreground italic p-3 border border-dashed rounded-lg bg-muted/50 text-center">
                    No hay competencias asignadas a este classroom.
                </p>
                )}
            </div>
          )}
          {!isTeacher && classroomDetails.competences && classroomDetails.competences.length > 0 && (
             <div className="mb-8 p-6 bg-card rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                    <BookCopy className="h-5 w-5 mr-2 text-accent"/>
                    Competencias del Classroom
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 rounded-md">
                    {classroomDetails.competences.map(comp => (
                    <div key={comp.id} className="p-3 border rounded-lg bg-background shadow-sm">
                        <p className="font-semibold text-foreground">{comp.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{comp.description}</p>
                    </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>


      <Tabs defaultValue="quizzes" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
          <TabsTrigger value="quizzes"><FileText className="mr-2 h-4 w-4"/>Quizzes</TabsTrigger>
          <TabsTrigger value="results"><BarChart3 className="mr-2 h-4 w-4"/>Resultados</TabsTrigger>
          <TabsTrigger value="people"><Users className="mr-2 h-4 w-4"/>Personas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quizzes">
          {isTeacher ? (
            selectedQuizForSubmissions ? (
              <QuizSubmissionsSection
                  quiz={selectedQuizForSubmissions}
                  onClose={handleCloseSubmissions}
              />
            ) : (
              <TeacherQuizList
                quizzes={classroomDetails.quiz || []}
                classroomId={classroomId}
                onQuizCreated={handleQuizCreated}
                onViewSubmissions={handleViewSubmissions}
              />
            )
          ) : ( 
            <StudentQuizList
              quizzes={classroomDetails.quiz || []}
              onStartQuiz={handleStartQuiz}
              onViewAttempt={handleViewStudentAttempt}
              currentUserId={currentUser.id}
            />
          )}
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
                    <Select value={selectedResultsFilter} onValueChange={setSelectedResultsFilter} disabled={resultsLoading}>
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
                {isTeacher && (
                    <Button variant="outline" onClick={() => setIsAddPeopleDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Añadir Personas
                    </Button>
                )}
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

      {isTeacher && (
        <>
            <AddPeopleDialog
                classroomId={classroomId}
                open={isAddPeopleDialogOpen}
                onOpenChange={setIsAddPeopleDialogOpen}
                onPeopleAdded={handlePeopleAdded}
            />
            {classroomDetails && (
                <AssignCompetenciesDialog
                    classroomId={classroomId}
                    teacherId={currentUser.id} 
                    initiallyAssignedCompetencies={classroomDetails.competences || []}
                    open={isAssignCompetenciesDialogOpen}
                    onOpenChange={setIsAssignCompetenciesDialogOpen}
                    onAssignmentsSaved={handleAssignmentsSaved}
                />
            )}
        </>
      )}
      {!isTeacher && selectedQuizIdForStudentView && currentUser && (
        <StudentViewAttemptDialog
          open={isStudentViewAttemptDialogOpen}
          onOpenChange={setIsStudentViewAttemptDialogOpen}
          quizId={selectedQuizIdForStudentView}
          studentId={currentUser.id}
          studentName={`${currentUser.name} ${currentUser.lastName}`}
          quizTotalPoints={classroomDetails.quiz?.find(q => q.id === selectedQuizIdForStudentView)?.total_points || 0}
        />
      )}
      {!isTeacher && selectedQuizIdForTaking && currentUser && (
        <StartQuizDialog
          open={isStartQuizDialogOpen}
          onOpenChange={setIsStartQuizDialogOpen}
          quizId={selectedQuizIdForTaking}
          studentId={currentUser.id}
          onQuizAttemptSubmitted={handleQuizAttemptSubmitted}
        />
      )}
    </div>
  );
}

