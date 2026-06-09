export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'PROFESSOR' | 'STUDENT';
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CourseListItem {
  id: number;
  courseCode: string;
  name: string;
  departmentName: string;
  professorName: string;
  credit: number;
  year: number;
  semester: number;
  maxEnrollment: number;
  currentEnrollment: number;
  classroom: string | null;
  courseType: string;
  status: string;
}

export interface CourseSchedule {
  id: number;
  dayOfWeek: number;
  periodStart: number;
  periodEnd: number;
  classroom: string | null;
}

export interface CourseDetail extends CourseListItem {
  description: string | null;
  schedules: CourseSchedule[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface EnrollmentItem {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  professorName: string;
  credit: number;
  year: number;
  semester: number;
  status: string;
  enrolledAt: string;
}

export interface GradeItem {
  id: number;
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  studentName: string;
  studentNumber: string;
  credit: number;
  letterGrade: string | null;
  score: number | null;
  gradePoints: number | null;
  isPassFail: boolean;
  status: string;
  submittedAt: string | null;
}

export interface NoticeListItem {
  id: number;
  title: string;
  category: string;
  authorName: string;
  departmentName: string | null;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
}

export interface NoticeDetail extends NoticeListItem {
  content: string;
  updatedAt: string;
}

// ─── Student ───────────────────────────────────────────────────────────────

export type StudentStatus = 'ENROLLED' | 'LEAVE' | 'GRADUATED' | 'EXPELLED';

export interface StudentListItem {
  id: number;
  userId: number;
  studentNumber: string;
  name: string;
  email: string;
  phone: string | null;
  departmentId: number;
  departmentName: string;
  grade: number;
  semester: number;
  admissionYear: number;
  status: StudentStatus;
}

export interface StudentDetail extends StudentListItem {
  collegeName: string;
  birthDate: string | null;
  address: string | null;
  createdAt: string;
}

// ─── Professor ─────────────────────────────────────────────────────────────

export type ProfessorStatus = 'ACTIVE' | 'LEAVE' | 'RETIRED';

export interface ProfessorListItem {
  id: number;
  professorNumber: string;
  name: string;
  email: string;
  departmentId: number;
  departmentName: string;
  position: string | null;
  status: ProfessorStatus;
}

export interface ProfessorDetail extends ProfessorListItem {
  phone: string | null;
  researchField: string | null;
  officeLocation: string | null;
  officePhone: string | null;
  hireDate: string | null;
}

// ─── Staff ─────────────────────────────────────────────────────────────────

export type StaffStatus = 'ACTIVE' | 'LEAVE' | 'RETIRED' | 'RESIGNED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERN';

export interface StaffJob {
  id: number;
  officeId: number;
  officeName: string;
  positionId: number;
  positionName: string;
  jobTitle: string;
  jobCategory: string;
  isPrimary: boolean;
  startDate: string;
  endDate: string | null;
}

export interface StaffListItem {
  id: number;
  staffNumber: string;
  name: string;
  email: string;
  officeName: string;
  primaryJobTitle: string | null;
  positionName: string | null;
  employmentType: EmploymentType;
  status: StaffStatus;
}

export interface StaffDetail extends StaffListItem {
  officeId: number;
  phone: string | null;
  hireDate: string;
  birthDate: string | null;
  officePhone: string | null;
  officeLocation: string | null;
  jobs: StaffJob[];
}

export interface AssignmentHistory {
  id: number;
  fromOfficeName: string | null;
  toOfficeName: string;
  fromPositionName: string | null;
  toPositionName: string;
  assignmentType: string;
  effectiveDate: string;
  reason: string | null;
  processedByName: string | null;
}

export interface AdministrativeOffice {
  id: number;
  code: string;
  name: string;
  officeType: string;
  parentId: number | null;
}

// ─── Department / College ──────────────────────────────────────────────────

export interface CollegeItem {
  id: number;
  code: string;
  name: string;
}

export interface DepartmentItem {
  id: number;
  code: string;
  name: string;
  collegeId: number;
  collegeName: string;
  headProfessorName: string | null;
  studentCount: number;
  professorCount: number;
}

// ─── Approval ──────────────────────────────────────────────────────────────

export interface ApprovalTemplate {
  id: number;
  code: string;
  name: string;
}

export type ApprovalStatus = 'DRAFT' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

export interface ApprovalLine {
  id: number;
  step: number;
  approverId: number;
  approverName: string;
  roleLabel: string | null;
  action: 'APPROVED' | 'REJECTED' | null;
  comment: string | null;
  actionAt: string | null;
}

export interface ApprovalListItem {
  id: number;
  title: string;
  templateName: string;
  drafterName: string;
  status: ApprovalStatus;
  currentStep: number;
  submittedAt: string | null;
}

export interface ApprovalDetailType extends ApprovalListItem {
  templateId: number;
  drafterId: number;
  content: string;
  formData: Record<string, unknown> | null;
  approvalLines: ApprovalLine[];
}
