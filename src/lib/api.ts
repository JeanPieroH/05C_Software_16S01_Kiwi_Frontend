
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
  Character,
  StoreCharacterData,
  QuizSubmissionSummary,
  StudentQuizAttempt,
  QuestionAttempt,
  SaveFeedbackPayload,
  QuizForTaking,
  StudentQuizSubmissionPayload,
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
  'student1': { id: 'student1', name: 'Ana', lastName: 'García', email: 'ana.garcia@example.com', role: 'STUDENT', cel_phone: '555-0101', emotion: 'Concentrada', registration_date: '2023-01-10T10:00:00Z', coin_earned: 150, coin_available: 75 },
  'student2': { id: 'student2', name: 'Luis', lastName: 'Martinez', email: 'luis.martinez@example.com', role: 'STUDENT', cel_phone: '555-0102', emotion: 'Curioso', registration_date: '2023-01-11T10:00:00Z', coin_earned: 200, coin_available: 120 },
  'student3': { id: 'student3', name: 'Sofia', lastName: 'Rodriguez', email: 'sofia.rodriguez@example.com', role: 'STUDENT', cel_phone: null, emotion: 'Entusiasmada', registration_date: '2023-01-12T10:00:00Z', coin_earned: 80, coin_available: 30 },
  'student4': { id: 'student4', name: 'Carlos', lastName: 'Hernandez', email: 'carlos.h@example.com', role: 'STUDENT', cel_phone: '555-0104', emotion: 'Motivado', registration_date: '2023-01-13T10:00:00Z', coin_earned: 120, coin_available: 100 },
  'student5': { id: 'student5', name: 'Laura', lastName: 'Lopez', email: 'laura.lopez@example.com', role: 'STUDENT', cel_phone: '555-0105', emotion: 'Alegre', registration_date: '2023-01-14T10:00:00Z', coin_earned: 50, coin_available: 50 },
  'teacher2': { id: 'teacher2', name: 'Maria', lastName: 'Gonzales', email: 'maria.gonzales@example.com', role: 'TEACHER', cel_phone: '555-0201', registration_date: '2023-01-15T10:00:00Z' },
};

const mockClassroomTeachers: Record<string, User[]> = {
    'c1': [mockUsers['1']],
    'c2': [mockUsers['1'], mockUsers['teacher2']],
    'c3': [mockUsers['teacher2']],
};

const mockClassroomStudents: Record<string, User[]> = {
    'c1': [mockUsers['student1'], mockUsers['student2'], mockUsers['student3'], mockUsers['2']], // Alex Student in c1
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

const mockStudentClassroomEnrollments: Record<string, string[]> = {
  'student1': ['c1', 'c3'],
  'student2': ['c1', 'c3'],
  'student3': ['c1', 'c3'],
  'student4': ['c2', 'c3'],
  'student5': ['c2', 'c3'],
  '2': ['c1'], // Alex Student
};

const mockClassroomDetailsData: Record<string, Classroom> = {
  'c1': {
    id: 'c1',
    name: "Salon de prueba",
    description: "Clase de prueba. En este curso introductorio, exploraremos los fundamentos de la materia, sentando las bases para conceptos más avanzados. Participa activamente y no dudes en preguntar.",
    quiz: [
      {
        id: 'q1',
        classroom_id: 'c1',
        title: "Quiz de Bienvenida",
        instruction: "Completa este quiz para empezar y familiarizarte con la plataforma. Cubre los temas básicos de la primera semana.",
        total_points: 20,
        start_time: "2025-06-15T09:00:00Z",
        end_time: "2025-06-16T23:59:00Z",
        created_at: "2025-06-10T18:49:18.757Z",
        updated_at: "2025-06-10T18:49:18.757Z",
        questions: [
            { id: 'q1-ques1', statement: "Pregunta 1 de bienvenida (texto)", answer_correct: "Respuesta correcta 1", points: 10, answer_base: { type: "base_text" }, competences_id: ['comp1-c1'] },
            { id: 'q1-ques2', statement: "Pregunta 2 de bienvenida (opción múltiple)", answer_correct: "Opción A", points: 10, answer_base: { type: "base_multiple_option", options: ["Opción A", "Opción B", "Opción C"] }, competences_id: ['comp1-c1'] }
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
      { id: 'comp-general-1', name: 'Resolución de problemas General', description: 'Aplicación lógica y estructurada' },
      { id: 'comp1-c1', name: 'Pensamiento Crítico (Clase 1)', description: 'Análisis y evaluación de información para C1' }
    ]
  },
  'c2': {
    id: 'c2',
    name: "Matematica",
    description: "Salon de prueba de Matematicas. Exploraremos álgebra, geometría y cálculo, desarrollando habilidades analíticas y de resolución de problemas complejos.",
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
       { id: 'comp-general-2', name: 'Pensamiento Crítico General', description: 'Análisis y evaluación de información' },
       { id: 'comp2-c2', name: 'Geometría Espacial (Clase 2)', description: 'Competencia de geometría para C2' },
    ]
  },
  'c3': {
    id: 'c3',
    name: "Comunicacion",
    description: "Salon de prueba de Comunicacion. Enfocado en mejorar habilidades de escritura, expresión oral y comprensión lectora efectiva.",
    quiz: [],
    competences: [
      { id: 'comp1-c3', name: 'Oratoria (Clase 3)', description: 'Habilidad de hablar en público para C3' }
    ]
  },
   'c2-maria': {
    id: 'c2-maria',
    name: "Matematica Avanzada",
    description: "Clase avanzada de Matematicas impartida por Maria, cubriendo temas de cálculo integral y diferencial, y sus aplicaciones.",
    quiz: [],
    competences: [
       { id: 'comp-general-3', name: 'Planificación Estratégica', description: 'Definición de objetivos y planes de acción.' },
    ]
  },
  'c3-maria': {
    id: 'c3-maria',
    name: "Taller de Escritura Creativa",
    description: "Taller para desarrollar habilidades de escritura, explorando géneros como la narrativa corta, poesía y ensayo.",
    quiz: [],
    competences: [
      { id: 'comp1-c3-maria', name: 'Narrativa Corta', description: 'Creación de historias breves.' }
    ]
  }
};

const mockTeacherGeneralCompetencies: Record<string, Competency[]> = {
  '1': [ // Cristhian Paz
    { id: 'comp-general-1', name: 'Resolución de problemas General', description: 'Aplicación lógica y estructurada' },
    { id: 'comp1-c1', name: 'Pensamiento Crítico (Clase 1)', description: 'Análisis y evaluación de información para C1' }, // Simulating it was also a general one
    { id: 'comp-unique-cris-1', name: 'Análisis de Datos', description: 'Interpretación y modelado de datos.' },
    { id: 'comp-unique-cris-2', name: 'Programación Python', description: 'Desarrollo de aplicaciones con Python.' },
  ],
  'teacher2': [ // Maria Gonzales
     { id: 'comp-general-3', name: 'Planificación Estratégica', description: 'Definición de objetivos y planes de acción.' },
     { id: 'comp2-c2', name: 'Geometría Espacial (Clase 2)', description: 'Competencia de geometría para C2' }, // Simulating
     { id: 'comp-unique-maria-1', name: 'Liderazgo de Equipos', description: 'Gestión y motivación de equipos de trabajo.' },
     { id: 'comp-unique-maria-2', name: 'Comunicación Efectiva', description: 'Transmisión clara de ideas.' },
  ]
};


const mockStudentCurrentCharacter: Record<string, Character> = {
  'student1': {
    id: "35a36131-5548-4378-96ca-c5cb909c7450",
    name: "Donkey",
    modelUrl: "https://models.readyplayer.me/664b6c735a83699a96e14614.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
    price: 11.51,
    type: "ANIMAL",
  },
   '2': { // Alex Student
    id: "c2aebc34-d5b8-4411-908a-293e644c3c79",
    name: "Fox",
    modelUrl: "https://models.readyplayer.me/6580480d07effc09bc1922a0.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
    price: 11.82,
    type: "ANIMAL",
  },
};

const mockStoreCharacters: StoreCharacterData = {
  ANIMAL: [
    {
      id: "35a36131-5548-4378-96ca-c5cb909c7450",
      name: "Donkey",
      modelUrl: "https://models.readyplayer.me/664b6c735a83699a96e14614.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 11.51,
      type: "ANIMAL",
    },
    {
      id: "c2aebc34-d5b8-4411-908a-293e644c3c79",
      name: "Fox",
      modelUrl: "https://models.readyplayer.me/6580480d07effc09bc1922a0.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 11.82,
      type: "ANIMAL",
    },
    {
      id: "d3aebc34-d5b8-4411-908a-293e644c3c80",
      name: "Stag",
      modelUrl: "https://models.readyplayer.me/6597dd76f5394a27bb015910.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 15.00,
      type: "ANIMAL",
    }
  ],
  HUMAN: [
    {
      id: "58a998f1-a706-4870-b288-fe34b007846a",
      name: "Business Man",
      modelUrl: "https://models.readyplayer.me/658048c707effc09bc19240d.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 5.82,
      type: "HUMAN",
    },
    {
      id: "829f34b4-a538-40d3-82bf-1f571d73bcdd",
      name: "Sci-Fi Female",
      modelUrl: "https://models.readyplayer.me/6597df98e534914107588a99.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 14.23,
      type: "HUMAN",
    },
    {
      id: "939f34b4-a538-40d3-82bf-1f571d73bcdf",
      name: "Casual Male",
      modelUrl: "https://models.readyplayer.me/6597e075f5394a27bb0164ae.glb?morphTargets=ARKit,Oculus%20Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureAtlas=1024&lod=0",
      price: 10.00,
      type: "HUMAN",
    }
  ],
};

const mockQuizSubmissionsList: Record<string, QuizSubmissionSummary[]> = {
  'q1': [ // Submissions for "Quiz de Bienvenida"
    { student_id: 'student1', student_name: 'Ana', student_last_name: 'García', points_obtained: 18, submission_date: '2025-06-15T10:00:00Z' },
    { student_id: 'student2', student_name: 'Luis', student_last_name: 'Martinez', points_obtained: 15, submission_date: '2025-06-15T11:00:00Z' },
    { student_id: '2', student_name: 'Alex', student_last_name: 'Student', points_obtained: 20, submission_date: '2025-06-15T09:30:00Z' },
  ],
  'q2': [ // Submissions for "Quiz Intermedio: Unidad 1"
    { student_id: 'student1', student_name: 'Ana', student_last_name: 'García', points_obtained: 22, submission_date: '2025-06-20T12:00:00Z' },
    // No submission for Alex Student for q2 yet
  ],
   'q3': [ // Submissions for "Prueba de Álgebra Básica" in classroom c2
    { student_id: 'student4', student_name: 'Carlos', student_last_name: 'Hernandez', points_obtained: 25, submission_date: '2025-07-01T10:00:00Z' },
    // student5 has not submitted q3 yet
  ],
};

const mockStudentQuizAttemptsData: Record<string, StudentQuizAttempt> = {
  'q1_student1': { // Attempt of Ana García for Quiz de Bienvenida
    id: 'attempt-q1-s1',
    title: "Quiz de Bienvenida",
    instruction: "Completa este quiz para empezar y familiarizarte con la plataforma...",
    start_time: "2025-06-15T09:00:00Z",
    end_time: "2025-06-16T23:59:00Z",
    created_at: "2025-06-15T10:00:00Z", // Submission time
    updated_at: "2025-06-15T10:00:00Z",
    feedback_automated: "Buen trabajo completando el quiz de bienvenida.",
    feedback_teacher: null,
    points_obtained: 18,
    quiz_id: 'q1',
    student_id: 'student1',
    questions: [
      {
        ...(mockClassroomDetailsData['c1'].quiz![0].questions![0] as QuestionAttempt), // Pregunta 1
        id: 'q1-ques1',
        feedback_automated: "Respuesta parcialmente correcta.",
        feedback_teacher: null,
        points_obtained: 8,
        answer_submitted: { type: "submitted_text", answer_written: "Respuesta de Ana" },
      },
      {
        ...(mockClassroomDetailsData['c1'].quiz![0].questions![1] as QuestionAttempt), // Pregunta 2
        id: 'q1-ques2',
        feedback_automated: "¡Correcto!",
        feedback_teacher: "Bien hecho en esta.",
        points_obtained: 10,
        answer_submitted: { type: "submitted_multiple_option", option_select: "Opción A" },
      }
    ]
  },
  'q1_2': { // Attempt of Alex Student for Quiz de Bienvenida
    id: 'attempt-q1-s2', // s2 refers to Alex Student (user id '2')
    title: "Quiz de Bienvenida",
    instruction: "Completa este quiz para empezar y familiarizarte con la plataforma...",
    start_time: "2025-06-15T09:00:00Z",
    end_time: "2025-06-16T23:59:00Z",
    created_at: "2025-06-15T09:30:00Z", // Submission time
    updated_at: "2025-06-15T09:30:00Z",
    feedback_automated: "¡Excelente! Puntuación perfecta.",
    feedback_teacher: "Muy buen inicio, Alex.",
    points_obtained: 20,
    quiz_id: 'q1',
    student_id: '2',
    questions: [
      {
        ...(mockClassroomDetailsData['c1'].quiz![0].questions![0] as QuestionAttempt),
        id: 'q1-ques1',
        feedback_automated: "Correcto.",
        feedback_teacher: null,
        points_obtained: 10,
        answer_submitted: { type: "submitted_text", answer_written: "Respuesta correcta 1" },
      },
      {
        ...(mockClassroomDetailsData['c1'].quiz![0].questions![1] as QuestionAttempt),
        id: 'q1-ques2',
        feedback_automated: "¡Correcto!",
        feedback_teacher: null,
        points_obtained: 10,
        answer_submitted: { type: "submitted_multiple_option", option_select: "Opción A" },
      }
    ]
  },
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
    coin_earned: payload.role === 'STUDENT' ? 0 : undefined,
    coin_available: payload.role === 'STUDENT' ? 0 : undefined,
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
    return {...mockUsers[userId]}; // Return a copy
  }

  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<Pick<User, 'name' | 'lastName' | 'cel_phone'>>): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (mockUsers[userId]) {
    mockUsers[userId] = { ...mockUsers[userId], ...data };
    return { ...mockUsers[userId] };
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

  mockClassroomDetailsData[newClassroom.id] = {
    ...newClassroom,
    quiz: [],
    competences: [],
  };
  mockClassroomTeachers[newClassroom.id] = [mockUsers[userId]];
  mockClassroomStudents[newClassroom.id] = [];


  return { ...newClassroom };
};

export const updateTeacherClassroom = async (classroomId: string, classroomData: { name: string; description: string }): Promise<Omit<Classroom, 'quiz' | 'competences'>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (mockClassroomDetailsData[classroomId]) {
    mockClassroomDetailsData[classroomId] = {
      ...mockClassroomDetailsData[classroomId],
      name: classroomData.name,
      description: classroomData.description,
    };
  } else {
    throw new Error("Classroom not found in details data for update.");
  }

  let updatedClassroomSummary: Omit<Classroom, 'quiz' | 'competences'> | null = null;
  for (const teacherId in mockTeacherClassrooms) {
    const classroomIndex = mockTeacherClassrooms[teacherId].findIndex(c => c.id === classroomId);
    if (classroomIndex !== -1) {
      mockTeacherClassrooms[teacherId][classroomIndex] = {
        ...mockTeacherClassrooms[teacherId][classroomIndex],
        name: classroomData.name,
        description: classroomData.description,
      };
      updatedClassroomSummary = { ...mockTeacherClassrooms[teacherId][classroomIndex] };
      break;
    }
  }

  if (updatedClassroomSummary) {
    return updatedClassroomSummary;
  } else {
    throw new Error("Classroom not found in any teacher's list for update.");
  }
};


export const fetchTeacherCompetencies = async (userId: string): Promise<Competency[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const competencies = mockTeacherGeneralCompetencies[userId] || [];
  return competencies.map(c => ({ ...c }));
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
  return { ...newCompetency };
};

export const updateTeacherCompetency = async (competencyId: string, competencyData: { name: string; description: string }): Promise<Competency> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let updatedCompetency: Competency | null = null;

  for (const userId in mockTeacherGeneralCompetencies) {
    const competencyIndex = mockTeacherGeneralCompetencies[userId].findIndex(c => c.id === competencyId);
    if (competencyIndex !== -1) {
      mockTeacherGeneralCompetencies[userId][competencyIndex] = {
        ...mockTeacherGeneralCompetencies[userId][competencyIndex],
        name: competencyData.name,
        description: competencyData.description,
      };
      updatedCompetency = { ...mockTeacherGeneralCompetencies[userId][competencyIndex] };
      for (const classroomId_ in mockClassroomDetailsData) {
        const classroom = mockClassroomDetailsData[classroomId_];
        if (classroom.competences) {
            const classCompIndex = classroom.competences.findIndex(c => c.id === competencyId);
            if (classCompIndex !== -1) {
                classroom.competences[classCompIndex] = {
                    ...classroom.competences[classCompIndex],
                    name: competencyData.name,
                    description: competencyData.description,
                };
            }
        }
      }
      break;
    }
  }

  if (updatedCompetency) {
    return updatedCompetency;
  } else {
    throw new Error("Competency not found for update.");
  }
};


export const fetchClassroomDetails = async (classroomId: string, studentId?: string, studentRole?: UserRole): Promise<Classroom | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const classroom = mockClassroomDetailsData[classroomId];
  if (classroom) {
    const classroomCopy = JSON.parse(JSON.stringify(classroom)); // Deep copy

    if (studentRole === 'STUDENT' && studentId && classroomCopy.quiz) {
      classroomCopy.quiz.forEach((q: Quiz) => {
        const submission = mockQuizSubmissionsList[q.id]?.find(sub => sub.student_id === studentId);
        if (submission) {
          q.student_attempt_summary = {
            points_obtained: submission.points_obtained,
            submission_date: submission.submission_date,
          };
        }
      });
    }
    return classroomCopy;
  }
  return null;
};

export const updateClassroomCompetencies = async (classroomId: string, competenceIds: string[]): Promise<Classroom | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const classroom = mockClassroomDetailsData[classroomId];
  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const allCompetenciesAvailable: Competency[] = Object.values(mockTeacherGeneralCompetencies).flat();
  
  const newAssignedCompetencies = competenceIds
    .map(id => allCompetenciesAvailable.find(c => c.id === id))
    .filter(Boolean) as Competency[];

  classroom.competences = newAssignedCompetencies.map(c => ({...c}));

  return { ...classroom, competences: classroom.competences?.map(c => ({...c})) };
};


export const fetchClassroomCompetenciesForQuiz = async (classroomId: string): Promise<Competency[]> => {
  const classroom = mockClassroomDetailsData[classroomId];
  if (classroom && classroom.competences) {
    return classroom.competences.map(c => ({...c}));
  }
  return [];
};

export const fetchStudentClassrooms = async (studentId: string): Promise<Omit<Classroom, 'quiz' | 'competences'>[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const enrolledClassroomIds = mockStudentClassroomEnrollments[studentId] || [];
  return enrolledClassroomIds
    .map(classroomId => {
      const detailedClassroom = mockClassroomDetailsData[classroomId];
      if (detailedClassroom) {
        return {
          id: detailedClassroom.id,
          name: detailedClassroom.name,
          description: detailedClassroom.description || "Sin descripción",
        };
      }
      for (const teacherId in mockTeacherClassrooms) {
        const classroomSummary = mockTeacherClassrooms[teacherId].find(c => c.id === classroomId);
        if (classroomSummary) {
          return { ...classroomSummary };
        }
      }
      return null;
    })
    .filter(classroom => !!classroom) as Omit<Classroom, 'quiz' | 'competences'>[];
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
      ...q,
      id: q.id || `ques-${newQuizId}-${index}`,
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
    const multiChoiceIndex = Math.min(1, generatedQuestions.length -1); 
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
     const multiChoiceIndex = Math.min(1, generatedQuestions.length -1); 
     if (multiChoiceIndex >= 0 && generatedQuestions[multiChoiceIndex]) {
        generatedQuestions[multiChoiceIndex] = {
            ...generatedQuestions[multiChoiceIndex],
            id: generatedQuestions[multiChoiceIndex].id ||`ai-text-q-infer-${Date.now()}`,
            statement: `Pregunta inferencial generada desde texto.`,
            points: Math.floor(payload.point_max / payload.num_question), 
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
  const classroomStudents = mockClassroomStudents[classroomId] || [];
  if (classroomStudents.length === 0) return [];

  return classroomStudents.map((student, index) => ({
    ranking: index + 1,
    obtained_points: Math.floor(Math.random() * 70) + 30, 
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
    ranking: 0 
  })).sort((a, b) => b.obtained_points - a.obtained_points)
     .map((sr, index) => ({ ...sr, ranking: index + 1 }));
};

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
      if (role === 'TEACHER') {
        if (mockClassroomTeachers[classroomId].some(t => t.id === user!.id)) {
          failed.push({ email, reason: 'Usuario ya es docente en este classroom.' });
          continue;
        }
        user.role = 'TEACHER'; 
        mockUsers[user.id] = { ...user, role: 'TEACHER' }; 
        mockClassroomTeachers[classroomId].push(user);
        mockClassroomStudents[classroomId] = mockClassroomStudents[classroomId].filter(s => s.id !== user!.id);
      } else { // STUDENT
        if (mockClassroomStudents[classroomId].some(s => s.id === user!.id)) {
          failed.push({ email, reason: 'Usuario ya es estudiante en este classroom.' });
          continue;
        }
        user.role = 'STUDENT'; 
        mockUsers[user.id] = { ...user, role: 'STUDENT' }; 
        mockClassroomStudents[classroomId].push(user);
        mockClassroomTeachers[classroomId] = mockClassroomTeachers[classroomId].filter(t => t.id !== user!.id);
      }
      added.push(user);
    } else {
      const newUserId = `new-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newUser: User = {
        id: newUserId,
        name: email.split('@')[0], 
        lastName: 'Invitado',
        email: email,
        role: role,
        cel_phone: null,
        registration_date: new Date().toISOString(),
        coin_earned: role === 'STUDENT' ? 0 : undefined,
        coin_available: role === 'STUDENT' ? 0 : undefined,
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

export const fetchStudentCurrentCharacter = async (studentId: string): Promise<Character | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStudentCurrentCharacter[studentId] ? { ...mockStudentCurrentCharacter[studentId] } : null;
};

export const fetchStoreCharacters = async (): Promise<StoreCharacterData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const copiedStore: StoreCharacterData = {};
  for (const type in mockStoreCharacters) {
    copiedStore[type as keyof StoreCharacterData] = mockStoreCharacters[type as keyof StoreCharacterData]!.map(char => ({ ...char }));
  }
  return copiedStore;
};

export const purchaseCharacter = async (studentId: string, characterId: string, price: number): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  const student = mockUsers[studentId];
  if (!student || student.role !== 'STUDENT') {
    return { success: false, message: "Estudiante no encontrado." };
  }

  if ((student.coin_available || 0) < price) {
    return { success: false, message: "Monedas insuficientes." };
  }

  let characterToPurchase: Character | null = null;
  for (const type in mockStoreCharacters) {
    const found = mockStoreCharacters[type as keyof StoreCharacterData]!.find(char => char.id === characterId);
    if (found) {
      characterToPurchase = found;
      break;
    }
  }

  if (!characterToPurchase) {
    return { success: false, message: "Personaje no encontrado en la tienda." };
  }

  student.coin_available = (student.coin_available || 0) - price;
  mockStudentCurrentCharacter[studentId] = { ...characterToPurchase };
  mockUsers[studentId] = { ...student };


  return { success: true, message: `¡Has comprado ${characterToPurchase.name}!`, updatedUser: { ...student } };
};

export const fetchQuizSubmissions = async (quizId: string): Promise<QuizSubmissionSummary[]> => {
  console.log(`API: Fetching submissions for quiz ${quizId}`);
  await new Promise(resolve => setTimeout(resolve, 600));
  return (mockQuizSubmissionsList[quizId] || []).map(s => ({...s}));
};

export const fetchStudentQuizAttemptDetails = async (quizId: string, studentId: string): Promise<StudentQuizAttempt | null> => {
  console.log(`API: Fetching attempt details for quiz ${quizId}, student ${studentId}`);
  await new Promise(resolve => setTimeout(resolve, 800));
  const attemptKey = `${quizId}_${studentId}`;
  const attempt = mockStudentQuizAttemptsData[attemptKey];
  if (attempt) {
    return JSON.parse(JSON.stringify(attempt));
  }
  const quizSubmissions = mockQuizSubmissionsList[quizId] || [];
  const studentSubmission = quizSubmissions.find(sub => sub.student_id === studentId);
  const quizDetails = Object.values(mockClassroomDetailsData).flatMap(c => c.quiz || []).find(q => q.id === quizId);

  if (studentSubmission && quizDetails) {
      console.warn(`No detailed mock attempt found for ${attemptKey}, creating a basic one.`);
      const basicAttempt: StudentQuizAttempt = {
          id: `fallback-attempt-${quizId}-${studentId}`,
          title: quizDetails.title,
          instruction: quizDetails.instruction,
          start_time: quizDetails.start_time || new Date().toISOString(),
          end_time: quizDetails.end_time || new Date().toISOString(),
          created_at: studentSubmission.submission_date || new Date().toISOString(),
          updated_at: studentSubmission.submission_date || new Date().toISOString(),
          feedback_automated: "No hay retroalimentación automatizada detallada para esta entrega.",
          feedback_teacher: null,
          points_obtained: studentSubmission.points_obtained,
          quiz_id: quizId,
          student_id: studentId,
          questions: (quizDetails.questions || []).map(q => ({
              ...(q as QuestionAttempt), 
              id: q.id || `q-fallback-${Math.random()}`,
              feedback_automated: "Sin retroalimentación automática para esta pregunta.",
              feedback_teacher: null,
              points_obtained: 0, 
              answer_submitted: { type: "submitted_text", answer_written: "[No se encontró la respuesta enviada]" },
          })),
      };
      mockStudentQuizAttemptsData[attemptKey] = basicAttempt; 
      return JSON.parse(JSON.stringify(basicAttempt));
  }

  return null;
};

export const saveTeacherFeedback = async (payload: SaveFeedbackPayload): Promise<{ success: boolean; message: string }> => {
  console.log("API: Saving teacher feedback:", payload);
  await new Promise(resolve => setTimeout(resolve, 700));

  const attemptKey = `${payload.quiz_id}_${payload.student_id}`;
  const attempt = mockStudentQuizAttemptsData[attemptKey];

  if (!attempt) {
    return { success: false, message: "No se encontró la entrega del estudiante." };
  }

  attempt.feedback_teacher = payload.general_feedback;
  attempt.updated_at = new Date().toISOString();

  payload.question_feedbacks.forEach(qf => {
    const questionAttempt = attempt.questions.find(q => q.id === qf.question_id);
    if (questionAttempt) {
      questionAttempt.feedback_teacher = qf.feedback_text;
    }
  });
  
  mockStudentQuizAttemptsData[attemptKey] = attempt;

  return { success: true, message: "Retroalimentación guardada exitosamente." };
};

export const fetchQuizForTaking = async (quizId: string): Promise<QuizForTaking | null> => {
  console.log(`API: Fetching quiz for taking: ${quizId}`);
  await new Promise(resolve => setTimeout(resolve, 400));

  // Find the full quiz details from any classroom (simplification for mock)
  let fullQuiz: Quiz | undefined;
  for (const classroomId in mockClassroomDetailsData) {
    fullQuiz = mockClassroomDetailsData[classroomId].quiz?.find(q => q.id === quizId);
    if (fullQuiz) break;
  }

  if (!fullQuiz) {
    console.error(`Quiz with ID ${quizId} not found in mockClassroomDetailsData.`);
    return null;
  }

  // Transform to QuizForTaking: remove correct answers
  const quizForTaking: QuizForTaking = {
    id: fullQuiz.id,
    title: fullQuiz.title,
    instruction: fullQuiz.instruction,
    start_time: fullQuiz.start_time,
    end_time: fullQuiz.end_time,
    created_at: fullQuiz.created_at,
    updated_at: fullQuiz.updated_at,
    questions: (fullQuiz.questions || []).map(q => ({
      id: q.id,
      statement: q.statement,
      points: q.points,
      answer_base: q.answer_base, // Keep options for multiple choice
      competences_id: q.competences_id,
      // Omit answer_correct
    })),
  };
  return JSON.parse(JSON.stringify(quizForTaking)); // Return a deep copy
};

export const submitStudentQuizAttempt = async (payload: StudentQuizSubmissionPayload): Promise<{ success: boolean; message: string; points_obtained?: number }> => {
  console.log("API: Submitting student quiz attempt:", JSON.stringify(payload, null, 2));
  await new Promise(resolve => setTimeout(resolve, 800));

  // Find the original quiz to get correct answers for grading
  let originalQuiz: Quiz | undefined;
  let originalClassroomId: string | undefined;

  for (const classroomId in mockClassroomDetailsData) {
    originalQuiz = mockClassroomDetailsData[classroomId].quiz?.find(q => q.id === payload.quiz_id);
    if (originalQuiz) {
      originalClassroomId = classroomId;
      break;
    }
  }

  if (!originalQuiz || !originalClassroomId) {
    return { success: false, message: "Quiz original no encontrado para calificar." };
  }

  let totalPointsObtained = 0;
  const gradedQuestionAttempts: QuestionAttempt[] = [];

  for (const submittedQ of payload.questions) {
    const originalQuestion = originalQuiz.questions?.find(oq => oq.id === submittedQ.question_id);
    if (!originalQuestion) {
      console.warn(`Original question with ID ${submittedQ.question_id} not found for grading.`);
      gradedQuestionAttempts.push({
        id: submittedQ.question_id,
        statement: "Pregunta no encontrada",
        answer_correct: "N/A",
        points: 0,
        answer_base: { type: "base_text" },
        competences_id: [],
        feedback_automated: "Error: Pregunta original no encontrada.",
        feedback_teacher: null,
        points_obtained: 0,
        answer_submitted: submittedQ.answer_submitted,
      });
      continue;
    }

    let questionPoints = 0;
    let autoFeedback = "";

    if (originalQuestion.answer_base.type === "base_text") {
      if (submittedQ.answer_submitted.answer_written?.trim().toLowerCase() === originalQuestion.answer_correct.trim().toLowerCase()) {
        questionPoints = originalQuestion.points;
        autoFeedback = "¡Correcto!";
      } else {
        autoFeedback = `Incorrecto. La respuesta esperada era: "${originalQuestion.answer_correct}"`;
      }
    } else if (originalQuestion.answer_base.type === "base_multiple_option") {
      if (submittedQ.answer_submitted.option_select === originalQuestion.answer_correct) {
        questionPoints = originalQuestion.points;
        autoFeedback = "¡Correcto!";
      } else {
        autoFeedback = `Incorrecto. La opción correcta era: "${originalQuestion.answer_correct}"`;
      }
    }
    totalPointsObtained += questionPoints;

    gradedQuestionAttempts.push({
      ...originalQuestion, // Spread original question data
      id: originalQuestion.id,
      feedback_automated: autoFeedback,
      feedback_teacher: null, // Teacher feedback to be added later
      points_obtained: questionPoints,
      answer_submitted: submittedQ.answer_submitted,
    });
  }

  const attemptKey = `${payload.quiz_id}_${payload.student_id}`;
  mockStudentQuizAttemptsData[attemptKey] = {
    id: attemptKey,
    title: originalQuiz.title,
    instruction: originalQuiz.instruction,
    start_time: originalQuiz.start_time!,
    end_time: originalQuiz.end_time!,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    feedback_automated: `Has obtenido ${totalPointsObtained} de ${originalQuiz.total_points || 0} puntos.`,
    feedback_teacher: null,
    points_obtained: totalPointsObtained,
    questions: gradedQuestionAttempts,
    quiz_id: payload.quiz_id,
    student_id: payload.student_id,
  };

  // Update student_attempt_summary in the main classroom quiz list
  const classroomForUpdate = mockClassroomDetailsData[originalClassroomId];
  const quizIndexInClassroom = classroomForUpdate.quiz?.findIndex(q => q.id === payload.quiz_id);
  if (quizIndexInClassroom !== undefined && quizIndexInClassroom !== -1 && classroomForUpdate.quiz) {
    classroomForUpdate.quiz[quizIndexInClassroom].student_attempt_summary = {
      points_obtained: totalPointsObtained,
      submission_date: new Date().toISOString(),
    };
  }

  // Update student's overall coins (example: earn 1 coin per point)
  const studentUser = mockUsers[payload.student_id];
  if (studentUser && studentUser.role === 'STUDENT') {
    studentUser.coin_earned = (studentUser.coin_earned || 0) + totalPointsObtained;
    studentUser.coin_available = (studentUser.coin_available || 0) + totalPointsObtained; // For simplicity, earned = available increase
    // Potentially update emotion based on score - simple example
    if (totalPointsObtained > (originalQuiz.total_points || 0) * 0.8) {
      studentUser.emotion = "¡Genial!";
    } else if (totalPointsObtained < (originalQuiz.total_points || 0) * 0.4) {
      studentUser.emotion = "Puede mejorar";
    }
  }

  return { success: true, message: "Quiz enviado exitosamente.", points_obtained: totalPointsObtained };
};
