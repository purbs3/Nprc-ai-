export interface Testimonial {
  quote: string;
  author: string;
  title: string;
  imageUrl: string;
}

export interface AppSettings {
  appName: string;
  contactEmail: string;
  whatsappNumber: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: 'user' | 'clinician';
  username: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrls?: string[];
  images?: { mimeType: string; data: string; }[];
  timestamp: string;
  status: 'sent' | 'read';
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
  whatsappNumber: string;
}

export interface Feedback {
  id: string;
  rating: 'Helpful' | 'Neutral' | 'Unhelpful';
  comment: string;
  submittedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface TelehealthSession {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  clinicianId: string;
  notes?: string;
}

export interface TreatmentPlanExercise {
  name: string;
  sets: number;
  reps: number;
  frequency: string;
}

export interface TreatmentPlan {
  id: string;
  patientName: string;
  condition: string;
  goals: string;
  exercises: TreatmentPlanExercise[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  authorName: string;
  authorTitle: string;
  createdAt: string;
  content: string;
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorName: string;
  authorTitle: string;
  createdAt: string;
  content: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  registrationLink: string;
}

export interface Booking {
  id: string;
  patientName: string;
  patientContact: string;
  therapistId: string;
  service: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'clinician';
  createdAt: string;
}

// Clinician is a type of user with additional professional details.
export interface Clinician extends User {
  title: string;
  bio: string;
}
