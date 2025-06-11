
import type { LoginCredentials, RegisterPayload, User, AuthResponse, UserRole, AddPeopleResponse } from '@/types/auth';
import type {
  Classroom,
  Competency,
  Quiz,
  NewQuizPayload,
  Question,
  GenerateQuizFromDocumentPayload,
  GenerateQuizFromTextPayload,
  TypeQuestion,
  StudentResult,
  // Student type might be replaced by User if User covers all student fields
} from '@/types/entities';

// Mock data
const mockUsers: Record<string, User> = {
  '1': {
    id: '1',
    name: 'Cristhian',
    lastName: 'Paz',
    email: 'teacher@gmail.com',
    role: 'TEACHER',
    cel_phone: null,
    registration_date: '2025-06-11T09:49:45.783000Z',
  },
  '2': {
    id: '2',
    name: 'Alex',
    lastName: 'Student',
    email: 'student@gmail.com',
    role: 'STUDENT',
    cel_phone: '123-456-7890',
    registration_date: '2025-07-01T10:00:00.000Z',
    emotion: 'Feliz',
    coin_earned: 100,
    coin_available: 50,
  },
  'student1': { id: 'student1', name: 'Ana', lastName: 'García', email: 'ana.garcia@example.com', role: 'STUDENT', cel_phone: '555-0101', emotion: 'Concentrada', registration_date: '2023-01-10T10:00:00Z' },
  'student2': { id: 'student2', name: 'Luis', lastName: 'Martinez', email: 'luis.martinez@example.com', role: 'STUDENT', cel_phone: '555-0102', emotion: 'Curioso', registration_date: '2023-01-11T10:00:00Z' },
  'student3': { id: 'student3', name: 'Sofia', lastName: 'Rodriguez', email: 'sofia.rodriguez@example.com', role: 'STUDENT', cel_phone: null, emotion: 'Entusiasmada', registration_date: '2023-01-12T10:00:00Z' },
  'student4': { id: 'student4', name: 'Carlos', lastName: 'Hernandez', email: 'carlos.h@example.com', role: 'STUDENT', cel_phone: '555-0104', emotion: null, registration_date: '2023-01-13T10:00:00Z' },
  'student5': { id: 'student5', name: 'Laura', lastName: 'Lopez', email: 'laura.lopez@example.com', role: 'STUDENT', cel_phone: '555-0105', emotion: 'Alegre', registration_date: '2023-01-14T10:00:00Z' },
  'teacher2': { id: 'teacher2', name: 'Maria', lastName: 'Gonzales', email: 'maria.gonzales@example.com', role: 'TEACHER', cel_phone: '555-0201', registration_date: '2023-01-15T10:00:00Z' },
};

const mockClassroomTeachers: Record<string, User[]> = {
    'c1': [mockUsers['1']],
    'c2': [mockUsers['1'], mockUsers['teacher2']],
    'c3': [mockUsers['teacher2']],
};

const mockClassroomStudents: Record<string, User[]> = {
    'c1': [mockUsers['student1'], mockUsers['student2'], mockUsers['student3']],
    'c2': [mockUsers['student4'], mockUsers['student5']],
    'c3': [mockUsers['student1'], mockUsers['student2'], mockUsers['student3'], mockUsers['student4'], mockUsers['student5']],
};


const mockTeacherClassrooms: Record<string, Omit<Classroom, 'quiz' | 'competences'>[]> = {
  '1': [
    { id: 'c1', name: 'Salon de prueba', description: 'Clase de prueba' },
    { id: 'c2', name: 'Matematica', description: 'Salon de prueba de Matematicas' },
    { id: 'c3', name: 'Comunicacion', description: 'Salon de prueba de Comunicacion' },
  ],
  'teacher2': [
    { id: 'c2-maria', name: 'Matematica Avanzada', description: 'Clase avanzada de Matematicas impartida por Maria' },
    { id: 'c3-maria', name: 'Taller de Escritura Creativa', description: 'Taller para desarrollar habilidades de escritura' },
  ]
};

const mockClassroomDetailsData: Record<string, Classroom> = {
  'c1': {
    id: 'c1',
    name: "Salon de prueba",
    description: "Clase de prueba",
    quiz: [
      {
        id: 'q1',
        classroom_id: 'c1',
        title: "Quiz de Bienvenida",
        instruction: "Completa este quiz para empezar y familiarizarte con la plataforma. Cubre los temas básicos de la primera semana.",
        total_points: 10,
        start_time: "2025-06-15T09:00:00Z",
        end_time: "2025-06-16T23:59:00Z",
        created_at: "2025-06-10T18:49:18.757Z",
        updated_at: "2025-06-10T18:49:18.757Z",
        questions: [
            { id: 'q1-ques1', statement: "Pregunta 1 de bienvenida", answer_correct: "Respuesta correcta 1", points: 5, answer_base: { type: "base_text" }, competences_id: ['comp1-c1'] },
            { id: 'q1-ques2', statement: "Pregunta 2 de bienvenida", answer_correct: "Opción A", points: 5, answer_base: { type: "base_multiple_option", options: ["Opción A", "Opción B"] }, competences_id: ['comp1-c1'] }
        ]
      },
      {
        id: 'q2',
        classroom_id: 'c1',
        title: "Quiz Intermedio: Unidad 1",
        instruction: "Este quiz evalúa tu comprensión de los conceptos clave presentados en la Unidad 1. Asegúrate de repasar el material antes de comenzar.",
        total_points: 25,
        start_time: "2025-06-20T10:00:00Z",
        end_time: "2025-06-22T23:59:00Z",
        created_at: "2025-06-11T10:00:00Z",
        updated_at: "2025-06-11T10:00:00Z",
        questions: []
      }
    ],
    competences: [
      { id: 'comp1-c1', name: 'Resolución de problemas (Clase 1)', description: 'Aplicación lógica y estructurada específica para C1' },
      { id: 'comp2-c1', name: 'Pensamiento Crítico (Clase 1)', description: 'Análisis y evaluación de información para C1' }
    ]
  },
  'c2': {
    id: 'c2',
    name: "Matematica",
    description: "Salon de prueba de Matematicas. Exploraremos álgebra, geometría y cálculo.",
    quiz: [
      {
        id: 'q3',
        classroom_id: 'c2',
        title: "Prueba de Álgebra Básica",
        instruction: "Demuestra tus habilidades fundamentales en álgebra resolviendo estos problemas.",
        total_points: 30,
        start_time: "2025-07-01T09:00:00Z",
        end_time: "2025-07-03T23:59:00Z",
        created_at: "2025-06-20T10:00:00Z",
        updated_at: "2025-06-20T10:00:00Z",
        questions: []
      },
    ],
    competences: [
       { id: 'comp1-c2', name: 'Álgebra Avanzada (Clase 2)', description: 'Competencia de álgebra para C2' },
       { id: 'comp2-c2', name: 'Geometría Espacial (Clase 2)', description: 'Competencia de geometría para C2' },
    ]
  },
  'c3': {
    id: 'c3',
    name: "Comunicacion",
    description: "Salon de prueba de Comunicacion. Enfocado en mejorar habilidades de escritura y oratoria.",
    quiz: [],
    competences: [
      { id: 'comp1-c3', name: 'Oratoria (Clase 3)', description: 'Habilidad de hablar en público para C3' }
    ]
  },
   'c2-maria': {
    id: 'c2-maria',
    name: "Matematica Avanzada",
    description: "Clase avanzada de Matematicas impartida por Maria",
    quiz: [],
    competences: [
       { id: 'comp1-c2-maria', name: 'Cálculo Vectorial', description: 'Competencia de cálculo para esta clase' },
    ]
  },
  'c3-maria': {
    id: 'c3-maria',
    name: "Taller de Escritura Creativa",
    description: "Taller para desarrollar habilidades de escritura",
    quiz: [],
    competences: [
      { id: 'comp1-c3-maria', name: 'Narrativa Corta', description: 'Creación de historias breves.' }
    ]
  }
};

const mockTeacherGeneralCompetencies: Record<string, Competency[]> = {
  '1': [
    { id: 'comp-general-1', name: 'Resolución de problemas General', description: 'Aplicación lógica y estructurada' },
    { id: 'comp-general-2', name: 'Pensamiento Crítico General', description: 'Análisis y evaluación de información' },
  ],
  'teacher2': [
     { id: 'comp-general-3', name: 'Planificación Estratégica', description: 'Definición de objetivos y planes de acción.' },
  ]
};

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kiwi_token');
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kiwi_token', token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kiwi_token');
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const foundUser = Object.values(mockUsers).find(
    (user) => user.email === credentials.email && credentials.password === '123' // Simplified password check
  );

  if (foundUser) {
    const mockToken = `fake-jwt-token-for-${foundUser.id}`;
    setToken(mockToken);
    return {
      success: true,
      message: 'Login successful',
      token: mockToken,
      user: foundUser,
    };
  }

  return {
    success: false,
    message: 'Invalid email or password',
  };
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  if (!payload.email || !payload.password || !payload.name || !payload.lastName || !payload.role) {
    return {
      success: false,
      message: 'All fields are required',
    };
  }

  const existingUser = Object.values(mockUsers).find(user => user.email === payload.email);
  if (existingUser) {
    return { success: false, message: "Ya existe un usuario con este correo electrónico." };
  }


  const newUserId = `user-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    name: payload.name,
    lastName: payload.lastName,
    email: payload.email,
    role: payload.role,
    cel_phone: payload.cel_phone || null,
    registration_date: new Date().toISOString(),
  };
  mockUsers[newUserId] = newUser;

  return {
    success: true,
    message: 'Registration successful. Please log in.',
    user: newUser,
  };
};

export const logoutUser = (): void => {
  removeToken();
};

export const fetchUserProfile = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) {
    return null;
  }

  const userId = token.split('-for-')[1];
  if (userId && mockUsers[userId]) {
    return mockUsers[userId];
  }

  return null;
};

export const fetchTeacherClassrooms = async (userId: string): Promise<Omit<Classroom, 'quiz' | 'competences'>[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const classrooms = mockTeacherClassrooms[userId] || [];
  return classrooms.map(c => ({...c})); // Return copies
};

export const createTeacherClassroom = async (userId: string, classroomData: { name: string; description: string }): Promise<Omit<Classroom, 'quiz' | 'competences'>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!mockTeacherClassrooms[userId]) {
    mockTeacherClassrooms[userId] = [];
  }
  const newClassroom: Omit<Classroom, 'quiz' | 'competences'> = {
    id: `classroom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...classroomData,
  };
  mockTeacherClassrooms[userId].push(newClassroom);

  // Also add a basic entry to mockClassroomDetailsData so it can be loaded later
  mockClassroomDetailsData[newClassroom.id] = {
    ...newClassroom,
    quiz: [],
    competences: [],
  };
  mockClassroomTeachers[newClassroom.id] = [mockUsers[userId]];
  mockClassroomStudents[newClassroom.id] = [];


  return { ...newClassroom }; // Return a copy
};


export const fetchTeacherCompetencies = async (userId: string): Promise<Competency[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const competencies = mockTeacherGeneralCompetencies[userId] || [];
  return competencies.map(c => ({ ...c })); // Return copies
};

export const createTeacherCompetency = async (userId: string, competencyData: Omit<Competency, 'id'>): Promise<Competency> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!mockTeacherGeneralCompetencies[userId]) {
    mockTeacherGeneralCompetencies[userId] = [];
  }
  const newCompetency: Competency = {
    id: `comp-gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...competencyData,
  };
  mockTeacherGeneralCompetencies[userId].push(newCompetency);
  return { ...newCompetency }; // Return a copy
};


export const fetchClassroomDetails = async (classroomId: string): Promise<Classroom | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const classroom = mockClassroomDetailsData[classroomId];
  if (classroom) {
    return {
        ...classroom,
        quiz: classroom.quiz?.map(q => ({...q, questions: q.questions?.map(ques => ({...ques}))})),
        competences: classroom.competences?.map(c => ({...c}))
    };
  }
  return null;
};

export const fetchClassroomCompetenciesForQuiz = async (classroomId: string): Promise<Competency[]> => {
  const classroom = mockClassroomDetailsData[classroomId];
  if (classroom && classroom.competences) {
    return classroom.competences.map(c => ({...c}));
  }
  return [];
};


export const createQuiz = async (payload: NewQuizPayload): Promise<Quiz> => {
  console.log("API: Creating quiz with payload:", JSON.stringify(payload, null, 2));

  const classroom = mockClassroomDetailsData[payload.classroom_id];
  if (!classroom) {
    throw new Error("Classroom not found for creating quiz");
  }

  const newQuizId = `q${Date.now()}`;
  const newQuiz: Quiz = {
    id: newQuizId,
    classroom_id: payload.classroom_id,
    title: payload.title,
    instruction: payload.instruction,
    start_time: payload.start_time,
    end_time: payload.end_time,
    questions: payload.questions.map((q, index) => ({
      id: `ques-${newQuizId}-${index}`,
      ...q,
      points: Number(q.points) || 0,
    })),
    total_points: payload.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!classroom.quiz) {
    classroom.quiz = [];
  }
  classroom.quiz.push(newQuiz);

  return { ...newQuiz };
};

export const generateQuizFromDocument = async (payload: GenerateQuizFromDocumentPayload, file: File): Promise<Partial<Quiz>> => {
  console.log("API: Generating quiz from document:", payload, "File:", file.name);
  await new Promise(resolve => setTimeout(resolve, 1500));

  const generatedQuestions: Question[] = [];
  for (let i = 0; i < payload.num_question; i++) {
    generatedQuestions.push({
      id: `ai-doc-q-${Date.now()}-${i}`,
      statement: `Pregunta ${i + 1} generada desde PDF (${file.name.substring(0,10)}...). Competencias: ${payload.competences.slice(0,1).map(c=>c.name).join(', ')}`,
      points: Math.floor(payload.point_max / payload.num_question),
      answer_correct: `Respuesta correcta generada por IA para pregunta ${i + 1}`,
      answer_base: { type: "base_text" },
      competences_id: payload.competences.length > 0 ? [payload.competences[0].id] : [],
    });
  }
  if (payload.num_question > 1 && payload.type_question.inferenciales) {
    const multiChoiceIndex = Math.min(1, generatedQuestions.length -1); // ensure index is valid
    if (multiChoiceIndex >= 0 && generatedQuestions[multiChoiceIndex]) {
        generatedQuestions[multiChoiceIndex] = {
        ...generatedQuestions[multiChoiceIndex],
        id: generatedQuestions[multiChoiceIndex].id || `ai-doc-q-multi-${Date.now()}`,
        statement: `Pregunta múltiple generada desde PDF (${file.name.substring(0,10)}...)`,
        answer_base: { type: "base_multiple_option", options: ["Opción IA 1", "Opción IA 2", "Opción IA 3"] },
        answer_correct: "Opción IA 2",
        };
    }
  }


  return {
    title: `Quiz Generado desde: ${file.name}`,
    instruction: `Este quiz fue generado automáticamente a partir del documento ${file.name}. Por favor, revísalo y ajusta según sea necesario.`,
    questions: generatedQuestions,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const generateQuizFromText = async (payload: GenerateQuizFromTextPayload): Promise<Partial<Quiz>> => {
  console.log("API: Generating quiz from text:", payload);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const generatedQuestions: Question[] = [];
  for (let i = 0; i < payload.num_question; i++) {
    generatedQuestions.push({
      id: `ai-text-q-${Date.now()}-${i}`,
      statement: `Pregunta ${i + 1} generada desde texto (${payload.text.substring(0,20)}...). Competencias: ${payload.competences.slice(0,1).map(c=>c.name).join(', ')}`,
      points: Math.floor(payload.point_max / payload.num_question),
      answer_correct: `Respuesta IA para pregunta de texto ${i + 1}`,
      answer_base: { type: "base_text" },
      competences_id: payload.competences.length > 0 ? [payload.competences[0].id] : [],
    });
  }
  if (payload.num_question > 1 && payload.type_question.inferenciales) {
     const multiChoiceIndex = Math.min(1, generatedQuestions.length -1); // ensure index is valid
     if (multiChoiceIndex >= 0 && generatedQuestions[multiChoiceIndex]) {
        generatedQuestions[multiChoiceIndex] = {
            ...generatedQuestions[multiChoiceIndex],
            id: generatedQuestions[multiChoiceIndex].id ||`ai-text-q-infer-${Date.now()}`,
            statement: `Pregunta inferencial generada desde texto.`,
            points: Math.floor(payload.point_max / payload.num_question), // Asegúrate de que los puntos se distribuyan
            answer_base: { type: "base_multiple_option", options: ["Inferencia A", "Inferencia B", "Inferencia C"] },
            answer_correct: "Inferencia B",
            competences_id: payload.competences.length > 0 ? [payload.competences[0].id] : [],
        };
     }
  }


  return {
    title: `Quiz Generado desde Texto`,
    instruction: `Este quiz fue generado automáticamente a partir del texto proporcionado. Por favor, revísalo.`,
    questions: generatedQuestions.slice(0, payload.num_question),
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};


// Mock functions for results
const allStudentResults: StudentResult[] = [
  { ranking: 1, obtained_points: 95, student: mockUsers['student1'] as User },
  { ranking: 2, obtained_points: 88, student: mockUsers['student2'] as User },
  { ranking: 3, obtained_points: 85, student: mockUsers['student3'] as User },
  { ranking: 4, obtained_points: 72, student: mockUsers['student4'] as User },
  { ranking: 5, obtained_points: 60, student: mockUsers['student5'] as User },
];

export const fetchGeneralResults = async (classroomId: string): Promise<StudentResult[]> => {
  console.log(`API: Fetching general results for classroom ${classroomId}`);
  await new Promise(resolve => setTimeout(resolve, 700));
   // Ensure classroom students exist
  const classroomStudents = mockClassroomStudents[classroomId] || [];
  if (classroomStudents.length === 0) return [];

  // Generate results for students in this classroom
  return classroomStudents.map((student, index) => ({
    ranking: index + 1,
    obtained_points: Math.floor(Math.random() * 70) + 30, // Random points between 30-100
    student: student,
  })).sort((a,b) => b.obtained_points - a.obtained_points)
     .map((sr, idx) => ({...sr, ranking: idx + 1}));
};

export const fetchCompetencyResults = async (classroomId: string, competencyId: string): Promise<StudentResult[]> => {
  console.log(`API: Fetching results for classroom ${classroomId}, competency ${competencyId}`);
  await new Promise(resolve => setTimeout(resolve, 700));
  const competencyFactor = competencyId.charCodeAt(competencyId.length - 1) % 10;

  const classroomStudents = mockClassroomStudents[classroomId] || [];
  if (classroomStudents.length === 0) return [];
  
  return classroomStudents.map((student, index) => ({
    student: student,
    obtained_points: Math.max(0, Math.min(100, (Math.floor(Math.random() * 50) + 20) - competencyFactor * 3 + Math.floor(Math.random() * 15) - 7)),
    ranking: 0 // placeholder, will be set after sorting
  })).sort((a, b) => b.obtained_points - a.obtained_points)
     .map((sr, index) => ({ ...sr, ranking: index + 1 }));
};

// Functions for "Personas" tab
export const fetchClassroomTeachers = async (classroomId: string): Promise<User[]> => {
    console.log(`API: Fetching teachers for classroom ${classroomId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return (mockClassroomTeachers[classroomId] || []).map(u => ({...u}));
};

export const fetchClassroomStudents = async (classroomId: string): Promise<User[]> => {
    console.log(`API: Fetching students for classroom ${classroomId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return (mockClassroomStudents[classroomId] || []).map(u => ({...u}));
};

export const addPeopleToClassroom = async (classroomId: string, emails: string[], role: UserRole): Promise<AddPeopleResponse> => {
  console.log(`API: Adding people to classroom ${classroomId}`, { emails, role });
  await new Promise(resolve => setTimeout(resolve, 800));

  const added: User[] = [];
  const failed: { email: string; reason: string }[] = [];

  if (!mockClassroomTeachers[classroomId]) mockClassroomTeachers[classroomId] = [];
  if (!mockClassroomStudents[classroomId]) mockClassroomStudents[classroomId] = [];

  for (const email of emails) {
    let user = Object.values(mockUsers).find(u => u.email === email);

    if (user) {
      // User exists, check if already in the correct list for this classroom
      if (role === 'TEACHER') {
        if (mockClassroomTeachers[classroomId].some(t => t.id === user!.id)) {
          failed.push({ email, reason: 'Usuario ya es docente en este classroom.' });
          continue;
        }
        user.role = 'TEACHER'; // Ensure role is updated if they were a student before
        mockUsers[user.id] = { ...user, role: 'TEACHER' }; // Update global mockUsers
        mockClassroomTeachers[classroomId].push(user);
         // If they were a student, remove them from student list of this classroom
        mockClassroomStudents[classroomId] = mockClassroomStudents[classroomId].filter(s => s.id !== user!.id);
      } else { // STUDENT
        if (mockClassroomStudents[classroomId].some(s => s.id === user!.id)) {
          failed.push({ email, reason: 'Usuario ya es estudiante en este classroom.' });
          continue;
        }
        user.role = 'STUDENT'; // Ensure role
        mockUsers[user.id] = { ...user, role: 'STUDENT' }; // Update global mockUsers
        mockClassroomStudents[classroomId].push(user);
         // If they were a teacher, remove them from teacher list of this classroom
        mockClassroomTeachers[classroomId] = mockClassroomTeachers[classroomId].filter(t => t.id !== user!.id);
      }
      added.push(user);
    } else {
      // User does not exist, create a new one
      const newUserId = `new-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newUser: User = {
        id: newUserId,
        name: email.split('@')[0], // Basic name from email
        lastName: 'Invitado',
        email: email,
        role: role,
        cel_phone: null,
        registration_date: new Date().toISOString(),
      };
      mockUsers[newUserId] = newUser;
      if (role === 'TEACHER') {
        mockClassroomTeachers[classroomId].push(newUser);
      } else {
        mockClassroomStudents[classroomId].push(newUser);
      }
      added.push(newUser);
    }
  }

  if (added.length > 0) {
    return { success: true, message: 'Personas agregadas exitosamente.', added, failed };
  } else if (failed.length > 0 && added.length === 0) {
    return { success: false, message: 'No se pudieron agregar las personas.', added, failed };
  } else {
     return { success: false, message: 'No se proporcionaron correos para agregar.', added, failed };
  }
};

