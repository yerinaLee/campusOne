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

// ─── Attendance ────────────────────────────────────────────────────────────

export type AttendanceSessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED';
export type AttendanceRecordStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface AttendanceSession {
  id: number;
  courseId: number;
  courseName: string;
  lectureDate: string;
  startTime: string;
  endTime: string;
  lateThreshold: string | null;
  accessCode: string;
  qrToken: string;
  qrUrl: string;
  status: AttendanceSessionStatus;
}

export interface AttendanceSessionDetail extends AttendanceSession {
  totalEnrolled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentNumber: string;
  studentName: string;
  status: AttendanceRecordStatus;
  checkedInAt: string | null;
  isManual: boolean;
}

export interface AttendanceSummaryStudent {
  studentId: number;
  studentNumber: string;
  studentName: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AttendanceSummary {
  courseId: number;
  courseName: string;
  totalSessions: number;
  students: AttendanceSummaryStudent[];
}

export interface MyAttendanceRecord {
  sessionId: number;
  lectureDate: string;
  status: AttendanceRecordStatus;
  checkedInAt: string | null;
}

export interface MyAttendanceCourse {
  courseId: number;
  courseName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
  records: MyAttendanceRecord[];
}

export interface QrSessionInfo {
  sessionId: number;
  courseName: string;
  professorName: string;
  lectureDate: string;
  isActive: boolean;
  endTime: string;
}

// ─── Counseling ────────────────────────────────────────────────────────────

export type CounselingType = 'ACADEMIC' | 'MENTAL' | 'CAREER' | 'FINANCIAL' | 'PERSONAL' | 'ETC';
export type CounselingRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface CounselingRequestItem {
  id: number;
  studentName: string;
  studentNumber: string;
  counselingType: CounselingType;
  preferredDate: string | null;
  status: CounselingRequestStatus;
  rejectReason: string | null;
  createdAt: string;
}

export interface CounselingRecordListItem {
  id: number;
  studentName: string;
  counselorName: string;
  counselingType: CounselingType;
  subject: string;
  counseledAt: string;
  isNotified: boolean;
  isConfidential: boolean;
}

export interface CounselingRecordDetail {
  id: number;
  studentId: number;
  studentName: string;
  counselorId: number;
  counselorName: string;
  counselingType: CounselingType;
  subject: string;
  content: string;
  outcome: string | null;
  followUp: string | null;
  counseledAt: string;
  isNotified: boolean;
  isConfidential: boolean;
}

// ─── Assignment ────────────────────────────────────────────────────────────

export type AssignmentStatus = 'OPEN' | 'CLOSED' | 'GRADED';
export type SubmissionType = 'FILE' | 'TEXT' | 'BOTH';
export type SubmissionStatus = 'SUBMITTED' | 'LATE' | 'GRADED';

export interface AssignmentListItem {
  id: number;
  title: string;
  dueDate: string;
  maxScore: number;
  submissionType: SubmissionType;
  status: AssignmentStatus;
  allowLateSubmit: boolean;
  submittedCount?: number;
  totalEnrolled?: number;
  mySubmission?: MySubmission | null;
}

export interface AssignmentDetail {
  id: number;
  courseId: number;
  courseName: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  submissionType: SubmissionType;
  allowLateSubmit: boolean;
  isVisible: boolean;
  status: AssignmentStatus;
}

export interface MySubmission {
  id: number;
  assignmentTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
  fileName: string | null;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  gradedAt: string | null;
}

export interface SubmissionListItem {
  id: number;
  studentId: number;
  studentNumber: string;
  studentName: string;
  status: SubmissionStatus;
  submittedAt: string;
  score: number | null;
  isGraded: boolean;
}

export interface SubmissionSummary {
  assignmentId: number;
  title: string;
  submittedCount: number;
  lateCount: number;
  notSubmittedCount: number;
  submissions: SubmissionListItem[];
  notSubmitted: { studentId: number; studentNumber: string; studentName: string }[];
}

// ─── Exam ──────────────────────────────────────────────────────────────────

export type ExamType = 'MIDTERM' | 'FINAL' | 'QUIZ' | 'MAKEUP' | 'EXTRA';
export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type ExamRegistrationStatus = 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'EXEMPT';
export type SupervisorRole = 'MAIN' | 'ASSISTANT';

export interface ExamListItem {
  id: number;
  courseId: number;
  courseName: string;
  examType: ExamType;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: ExamStatus;
}

export interface ExamSupervisorInfo {
  userId: number;
  name: string;
  role: SupervisorRole;
}

export interface ExamDetail extends ExamListItem {
  professorName: string;
  maxStudents: number | null;
  description: string | null;
  supervisors: ExamSupervisorInfo[];
}

export interface ExamRegistrationItem {
  id: number;
  studentId: number;
  studentNumber: string;
  studentName: string;
  status: ExamRegistrationStatus;
  isSpecial: boolean;
  registeredAt: string;
}

export interface MyExamScheduleItem {
  examId: number;
  courseId: number;
  courseName: string;
  examType: ExamType;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  myStatus: ExamRegistrationStatus;
}

export interface MySupervisionItem {
  examId: number;
  courseName: string;
  title: string;
  examDate: string;
  startTime: string;
  room: string | null;
  supervisorRole: SupervisorRole;
}
