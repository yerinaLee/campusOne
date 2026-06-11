# CampusOne 학사 업무 시스템 — 작업 로그

마지막 업데이트: 2026-06-10

## 프로젝트 개요

대학교 학사 업무 시스템 (University Academic Management System).  
요구사항 정의서: `structure_v2_1.md` | API 정의서: `api_spec.md` | DB 설계서: `structure_v2_1.md`

### 디렉터리 구조
```
campusOne/
├── campusOne_api/          -- Spring Boot 3.5 백엔드
├── campusOne_app/
│   └── frontend/           -- React 19 + Vite 프론트엔드
├── infra/                  -- Docker 구성 (Oracle 21c)
├── structure_v2_1.md       -- 요구사항 + DB 설계서
├── WORK_LOG.md       		-- 현재까지 작업 진행상황 로그
└── api_spec.md             -- API 명세서
```

## 개발 환경

### DB 접속 정보
```
Host: localhost | Port: 1521 | Service: XEPDB1
User: UAMS | Password: UamsPass123!
```

### 실행 명령
```bash
# Oracle DB (Docker)
docker compose up -d

# 백엔드
cd campusOne_api
./gradlew bootRun   # http://localhost:8080

# 프론트엔드
cd campusOne_app/frontend
npm run dev         # http://localhost:5173
```

### 초기 관리자 계정
- ID: `admin` / PW: `admin123`
- 앱 시작 시 `DataInitializer`가 자동 생성 (BCrypt 해시)

---

## Oracle JPA 매핑 규칙

| DB 타입 | Java 타입 | 비고 |
|---------|-----------|------|
| `NUMBER(19) GENERATED ALWAYS AS IDENTITY` | `Long` + `@GeneratedValue(IDENTITY)` | PK |
| `TIMESTAMP WITH TIME ZONE` | `OffsetDateTime` | |
| `NUMBER(1,0)` boolean | `Boolean` + `@Column(columnDefinition = "NUMBER(1,0)")` | |
| `CLOB` | `@Lob @Column(columnDefinition = "CLOB") String` | |
| `DATE` | `LocalDate` | |
| 테이블명/컬럼명 | 대문자 (`@Table(name="USERS")`) | Oracle 관례 |
| default_schema | `application.yaml`의 `hibernate.default_schema: UAMS` | 엔티티에 schema 속성 불필요 |

---

## 백엔드 작업 현황

소스 경로: `campusOne_api/src/main/java/com/campus/campus_api/`

### ✅ 설정 및 공통

| 파일 | 설명 |
|------|------|
| `build.gradle` | Oracle JDBC, jjwt, validation 의존성 |
| `src/main/resources/application.yaml` | datasource, JPA, JWT 설정 |
| `global/response/ApiResponse.java` | 공통 응답 래퍼 |
| `global/exception/ErrorCode.java` | 에러 코드 열거형 |
| `global/exception/CustomException.java` | 커스텀 예외 |
| `global/exception/GlobalExceptionHandler.java` | 전역 예외 처리 |
| `global/jwt/JwtProvider.java` | JWT 생성/검증 |
| `global/jwt/JwtAuthFilter.java` | 요청별 JWT 필터 |
| `global/config/SecurityConfig.java` | Spring Security 설정 |
| `global/config/WebConfig.java` | CORS (localhost:5173, localhost:3000) |
| `global/DataInitializer.java` | 앱 시작 시 admin 계정 자동 생성 |

### ✅ 엔티티 & 레포지토리

| 도메인 | 엔티티 | 레포지토리 |
|--------|--------|-----------|
| 사용자 | `User.java` (implements UserDetails) | `UserRepository.java` |
| 단과대학 | `College.java` | `CollegeRepository.java` |
| 학과 | `Department.java` | `DepartmentRepository.java` |
| 학생 | `Student.java` | `StudentRepository.java` |
| 교수 | `Professor.java` | `ProfessorRepository.java` |
| 강의 | `Course.java` (@Version 낙관적 락), `CourseSchedule.java` | `CourseRepository.java` |

### ✅ 구현된 도메인 서비스

| 도메인 | DTO | Service | Controller | 주요 엔드포인트 |
|--------|-----|---------|------------|----------------|
| 인증 | `LoginRequest`, `TokenResponse` | `AuthService` | `AuthController` | POST `/auth/login`, `/auth/logout` |
| 강의 | `CourseListResponse`, `CourseDetailResponse`, `CourseScheduleDto` | `CourseService` | `CourseController` | GET `/courses`, `/courses/{id}` |
| 수강신청 | `EnrollRequest`, `EnrollmentResponse` | `EnrollmentService` | `EnrollmentController` | GET/POST `/enrollments/my`, DELETE `/enrollments/{id}` |
| 성적 | `GradeSubmitRequest`, `GradeUpdateRequest`, `GradeResponse` | `GradeService` | `GradeController` | GET `/grades/my`, `/grades/course/{id}`, POST/PUT |
| 공지사항 | `NoticeCreateRequest`, `NoticeListResponse`, `NoticeDetailResponse` | `NoticeService` | `NoticeController` | GET `/notices`, `/notices/{id}`, POST |

### ✅ 추가 구현 완료 도메인 (Phase 2)

| 도메인 | 대상 엔티티 | 구현된 주요 기능 |
|--------|-----------|-----------------|
| 학생 | `Student` | 학생 등록, 정보 수정, 상태 변경, 목록 및 상세 조회 |
| 교수 | `Professor` | 교수 등록, 정보 수정, 상태 변경, 내 담당 강의 조회 |
| 행정 부서 | `AdministrativeOffice`, `JobPosition` | 부서/직위 구조 조회 및 관리 (CRUD) |
| 교직원 | `StaffMember`, `StaffJob`, `StaffAssignmentHistory` | 교직원 등록, 정보/상태 수정, 직무 및 발령 이력 관리 |
| 학과/단과대 | `Department`, `College` | 단과대학 및 학과 등록/수정/삭제/조회 |
| 강의 보완 | `Course`, `CourseSchedule` | 관리자 및 교직원용 강의 개설(POST), 수정(PUT), 폐강(DELETE) 추가 |
| 전자결재 | `ApprovalTemplate`, `ApprovalDocument`, `ApprovalLine` | 결재 기안 상신, 결재자 승인/반려 처리 로직, 결재 상태별 내역 조회 |

---

## 프론트엔드 작업 현황

소스 경로: `campusOne_app/frontend/src/`

> **주의**: `components/ui/button.tsx`(`@base-ui/react/button` 사용)와 `lib/utils.ts`는 이미 존재하므로 절대 덮어쓰지 말 것.

### ✅ 기반 구조

| 파일 | 설명 |
|------|------|
| `types/index.ts` | 전체 도메인 타입 (User, Course, Enrollment, Grade, Notice, Student, Professor, Staff, Department, College, Approval) |
| `api/client.ts` | axios 인스턴스 (Bearer 토큰 인터셉터, 401 시 자동 로그아웃) |
| `store/authStore.ts` | Zustand + persist (`localStorage` 'campus-auth') |
| `components/layout/AppLayout.tsx` | 사이드바 + 상단 헤더, 역할별 메뉴 (`getNavItems`) |
| `components/layout/ProtectedRoute.tsx` | 인증 + 역할 권한 체크 래퍼 |
| `App.tsx` | `createBrowserRouter` 기반 전체 라우팅 (역할별 보호 라우트 포함) |

### ✅ API 모듈

| 파일 | 주요 함수 |
|------|-----------|
| `api/auth.ts` | `login`, `logout` |
| `api/courses.ts` | `list`, `get` |
| `api/enrollments.ts` | `my`, `enroll`, `cancel` |
| `api/grades.ts` | `my`, `byCourse`, `submit`, `update` |
| `api/notices.ts` | `list`, `get`, `create` |
| `api/students.ts` | `list`, `get`, `me`, `create`, `update`, `changeStatus` |
| `api/professors.ts` | `list`, `get`, `me`, `create`, `update`, `changeStatus` |
| `api/departments.ts` | `colleges`, `departments`, `getDepartment`, `createDepartment`, `collegesWithDepartments` |
| `api/staff.ts` | `list`, `get`, `create`, `update`, `changeStatus`, `addJob`, `endJob`, `assignments`, `offices` |
| `api/approvals.ts` | `templates`, `list`, `get`, `create`, `process`, `cancel`, `notifications`, `markRead` |

### ✅ 페이지 목록

#### 인증 / 공통
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/Login.tsx` | 전체 | react-hook-form + zod, 로그인 후 `/` 리다이렉트 |
| `pages/Dashboard.tsx` | 전체 | 역할별 요약 카드 |

#### 강의 / 수강신청 / 성적
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/courses/CourseList.tsx` | 전체 | 연도/학기/검색 필터 + 페이징 + 수강신청 버튼 |
| `pages/enrollments/MyEnrollments.tsx` | STUDENT | 내 수강내역 + 취소 |
| `pages/grades/MyGrades.tsx` | STUDENT | 내 성적 + GPA 계산 |
| `pages/grades/GradeManagement.tsx` | PROFESSOR | 강의 선택 → 성적 일괄 입력 |

#### 공지사항
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/notices/NoticeList.tsx` | 전체 | 카테고리 탭 필터 + 페이징 |
| `pages/notices/NoticeDetail.tsx` | 전체 | 공지 상세 |
| `pages/notices/NoticeCreate.tsx` | ADMIN/STAFF/PROFESSOR | 공지 작성 폼 |

#### 학생 관리
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/students/StudentList.tsx` | ADMIN/STAFF/PROFESSOR | 키워드/상태/학년 필터 + 페이징 |
| `pages/students/StudentDetail.tsx` | ADMIN/STAFF/PROFESSOR | 프로필 카드 + 상태 변경 모달 |
| `pages/students/StudentCreate.tsx` | ADMIN/STAFF | 학생 등록 폼 (학과 드롭다운 포함) |

#### 교수 관리
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/professors/ProfessorList.tsx` | ADMIN/STAFF | 키워드/상태 필터 + 페이징 |
| `pages/professors/ProfessorDetail.tsx` | ADMIN/STAFF | 프로필 카드 + 상태 변경 모달 |
| `pages/professors/ProfessorCreate.tsx` | ADMIN/STAFF | 교수 등록 폼 (직위 드롭다운 포함) |

#### 학과 관리
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/departments/DepartmentList.tsx` | 전체 | 카드 그리드 + 단과대학 필터 + 단과대학 요약 표 |

#### 교직원 관리
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/staff/StaffList.tsx` | ADMIN | 키워드/상태/고용형태 필터 + 페이징 |
| `pages/staff/StaffDetail.tsx` | ADMIN | 직무 목록(현재/종료) + 발령 이력 테이블 |
| `pages/staff/StaffCreate.tsx` | ADMIN | 교직원 등록 폼 (사무소 드롭다운 포함) |

#### 전자결재
| 파일 | 접근 | 설명 |
|------|------|------|
| `pages/approvals/ApprovalList.tsx` | 전체 | 전체/기안함/결재함/완료함 탭, 상태 배지 |
| `pages/approvals/ApprovalDetail.tsx` | 전체 | 결재선 시각화 (대기/승인/반려 아이콘), 결재 처리 모달 |
| `pages/approvals/ApprovalCreate.tsx` | 전체 | 결재선 동적 추가/삭제 |

### 역할별 사이드바 메뉴 구성

| 역할 | 메뉴 항목 |
|------|-----------|
| STUDENT | 대시보드, 강의 목록, 공지사항, 전자결재, 수강신청 현황, 내 성적, 내 출결, **과제**, **내 시험 일정**, **시험 일정**, **상담 신청**, **상담 내역**, 학과 안내 |
| PROFESSOR | 대시보드, 강의 목록, 공지사항, 전자결재, 성적 입력, 출결 관리, **과제 관리**, **시험 일정**, **상담 관리**, **상담 기록**, 학생 조회, 학과 안내 |
| STAFF | 대시보드, 강의 목록, 공지사항, 전자결재, **시험 일정**, **상담 관리**, **상담 기록**, 학생 관리, 교수 관리, 학과 관리 |
| ADMIN | 대시보드, 강의 목록, 공지사항, 전자결재, **시험 일정**, **상담 관리**, **상담 기록**, 학생 관리, 교수 관리, 교직원 관리, 학과 관리 |

---

## 트러블슈팅 이력

| 날짜 | 문제 | 원인 | 조치 |
|------|------|------|------|
| 2026-06-09 | 백엔드 시작 시 `CourseRepository` 쿼리 검증 실패 | `Professor` 엔티티에 `userId` 필드 없음 (`user` 필드만 존재) | JPQL `p.userId` → `p.user.id` 변경 |
| 2026-06-09 | 프론트엔드 Vite 런타임 모듈 에러 (`User` export 없음) | TypeScript `interface`를 값으로 import (Vite 런타임 불가) | 타입 전용 import를 `import type`으로 일괄 변경 |
| 2026-06-09 | 초기 DB에 로그인 계정 없음 / BCrypt 불일치 | 수동 SQL 삽입은 BCrypt 해시를 모름 | `DataInitializer` 컴포넌트로 앱 시작 시 자동 생성 |
| 2026-06-09 | 백엔드 컴파일 에러 (`ApiResponse.ok` 메서드 시그니처 불일치) | `ApiResponse` 클래스에 데이터와 커스텀 메시지를 함께 받는 `ok` 오버로딩 메서드 없음 | `public static <T> ApiResponse<T> ok(T data, String message)` 추가 및 `CustomException` 커스텀 메시지 생성자 추가 |
| 2026-06-09 | 백엔드 구동 시 Schema-validation 실패 (`StaffAssignmentHistory`, `StaffJob`, `StaffMember` 컬럼 매핑 불일치) | `structure_v2_1.md` DB 스키마와 엔티티 간의 필드 및 매핑 어노테이션 불일치 (`assignmentDate` -> `effectiveDate`, `STAFF_ID` -> `STAFF_MEMBER_ID` 등) | 전수조사 후 `StaffJob`, `StaffMember`, `StaffAssignmentHistory` 엔티티에 누락된 컬럼을 추가하고 매핑 구조 일괄 수정 |
| 2026-06-09 | `data.sql` GRADES INSERT 에러 | Oracle은 `VALUES(...)` 안에서 JOIN 포함 스칼라 서브쿼리를 지원하지 않음 | 전체 3건 `INSERT INTO...SELECT ... JOIN` 패턴으로 전환 |
| 2026-06-09 | `data.sql` APPROVAL_LINES INSERT 에러 | `COMMENT`가 Oracle 예약어라 컬럼명으로 인식 불가 (ORA-00936) | `"COMMENT"` 이중 인용부호 처리 + `CROSS JOIN` 패턴으로 전환 |
| 2026-06-09 | 샘플 계정 로그인 불가 (`test1234`) | `data.sql` 삽입 시 BCrypt 해시가 실제 `test1234` 해시가 아닌 플레이스홀더였음 | `bcryptjs`로 올바른 해시 생성 후 `data.sql` 전체 교체 (27건) + DB UPDATE |
| 2026-06-09 | 로그인 시 `REFRESH_TOKENS.CREATED_AT` NOT NULL 위반 | `@EnableJpaAuditing` 누락으로 `@CreatedDate`가 동작하지 않아 `createdAt = null` | `CampusOneApplication`에 `@EnableJpaAuditing` 추가 |
| 2026-06-09 | `@CreatedDate`에서 `OffsetDateTime` 변환 불가 에러 | Spring Data Auditing이 `OffsetDateTime` 타입을 지원하지 않음 (지원: `Instant`, `LocalDateTime` 등) | `@CreatedDate` 제거 → `@PrePersist`로 `OffsetDateTime.now()` 직접 세팅으로 교체 |

---

## 다음 작업 우선순위

### 🆕 Phase 3: 학생 출결 시스템 (신규 기능)

> 설계 기준: `structure_v2_1.md` §5.11, `api_spec.md` PART 13

#### 백엔드 (campusOne_api) ✅ 완료 (2026-06-10)

| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | Oracle DDL | `ATTENDANCE_SESSIONS`, `ATTENDANCE_RECORDS` 테이블 생성 | ✅ 완료 |
| 2 | `entity/attendance/AttendanceSession.java` | `ATTENDANCE_SESSIONS` JPA 엔티티 | ✅ 완료 |
| 3 | `entity/attendance/AttendanceRecord.java` | `ATTENDANCE_RECORDS` JPA 엔티티 | ✅ 완료 |
| 4 | `domain/attendance/repository/AttendanceSessionRepository.java` | QR 토큰 조회, 코스별 세션 목록 | ✅ 완료 |
| 5 | `domain/attendance/repository/AttendanceRecordRepository.java` | 세션별/학생별 기록 조회 | ✅ 완료 |
| 6 | `domain/attendance/dto/` | 세션 생성 Request, 체크인 Request, 세션 상세·목록·집계 Response | ✅ 완료 |
| 7 | `domain/attendance/service/AttendanceService.java` | 세션 생성 (UUID + 6자리 코드 생성), 체크인 검증, 수동 조정 | ✅ 완료 |
| 8 | `domain/attendance/controller/AttendanceController.java` | REST Controller (10개 엔드포인트) | ✅ 완료 |
| 9 | `global/exception/ErrorCode.java` | `ATTENDANCE_SESSION_CLOSED`, `INVALID_ACCESS_CODE`, `ALREADY_CHECKED_IN`, `NOT_ENROLLED` 추가 | ✅ 완료 |
| 10 | `domain/enrollment/repository/EnrollmentRepository.java` | 출결 통계 및 검증에 필요한 JpaRepository 누락 메서드 추가 | ✅ 완료 |

> **핵심 비즈니스 로직 (AttendanceService)**
> - `createSession()`: `UUID.randomUUID().toString()` = qrToken, `String.format("%06d", random.nextInt(1_000_000))` = accessCode
> - `checkIn()`: ① 세션 ACTIVE 확인 → ② accessCode 일치 → ③ ENROLLMENTS 수강 여부 → ④ 중복 체크인 방지 → ⑤ 시각 비교 (lateThreshold) → PRESENT / LATE

#### 프론트엔드 (campusOne_app)

| 순서 | 파일 경로 | 작업 내용 |
|------|-----------|-----------|
| 1 | `src/api/attendance.ts` | 출결 API 모듈 (createSession, closeSession, regenerateCode, getRecords, getSummary, getQrSession, checkIn, getMyAttendance) |
| 2 | `src/types/index.ts` | `AttendanceSession`, `AttendanceRecord`, `AttendanceSummary`, `MyAttendance` 타입 추가 |
| 3 | `src/pages/attendance/AttendanceManage.tsx` | 교수용: 세션 생성 폼 + QR 코드 표시 + 6자리 코드 노출 + 실시간 출결 현황 테이블 |
| 4 | `src/pages/attendance/AttendanceCheckIn.tsx` | 학생용: `/attend/:qrToken` 진입 → 세션 정보 표시 → 6자리 코드 입력 폼 → 체크인 결과 |
| 5 | `src/pages/attendance/MyAttendance.tsx` | 학생용: 강의별 출석률 + 세부 기록 조회 |
| 6 | `src/components/layout/AppLayout.tsx` | PROFESSOR 사이드바에 `출결 관리` 추가, STUDENT 사이드바에 `내 출결` 추가 |
| 7 | `src/App.tsx` | `/attend/:qrToken` PUBLIC 라우트 추가 (비로그인 시 로그인 후 원래 URL로 복귀) |

> **프론트 구현 주의사항**
> - `/attend/:qrToken` 은 비인증 접근 가능한 PUBLIC 라우트로 설정 (ProtectedRoute 제외)
> - 체크인 API 호출 시 JWT 필요 → 미로그인이면 로그인 페이지로 리다이렉트 후 `?redirect=/attend/{token}` 파라미터로 복귀
> - QR 코드 이미지는 프론트에서 `qrcode` npm 패키지로 `qrUrl` 값을 렌더링
> - 교수 세션 현황 화면은 초기 구현에서 수동 새로고침, 이후 폴링(5초) 또는 WebSocket으로 개선

---

### 🆕 Phase 4: 상담·과제·시험 시스템 (신규 기능)

> 설계 기준: `structure_v2_1.md` §5.12~5.14, `api_spec.md` PART 14~16

#### 📋 Phase 4 백엔드 작업 목록

##### FR-12. 학생 상담 관리 ✅ 완료
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | Oracle DDL | `COUNSELING_REQUESTS`, `COUNSELING_RECORDS` 테이블 생성 | ✅ 완료 |
| 2 | `entity/counseling/CounselingRequest.java` | 상담 신청 엔티티 | ✅ 완료 |
| 3 | `entity/counseling/CounselingRecord.java` | 상담 기록 엔티티 | ✅ 완료 |
| 4 | `domain/counseling/repository/CounselingRequestRepository.java` | 학생별/상태별 신청 조회 | ✅ 완료 |
| 5 | `domain/counseling/repository/CounselingRecordRepository.java` | 학생별/상담사별 기록 조회 | ✅ 완료 |
| 6 | `domain/counseling/dto/` | 신청 Request/Response, 기록 Request/Response | ✅ 완료 |
| 7 | `domain/counseling/service/CounselingService.java` | 신청 처리, 기록 CRUD, 이메일 발송 | ✅ 완료 |
| 8 | `domain/counseling/controller/CounselingController.java` | 9개 엔드포인트 | ✅ 완료 |
| 9 | `global/exception/ErrorCode.java` | `COUNSELING_REQUEST_ALREADY_EXISTS` 추가 | ✅ 완료 |

> **이메일 발송**: 로컬 콘솔 로그(`log.info`)를 이용한 더미 발송으로 처리 완료.

##### FR-13. 과제 제출 시스템 ✅ 완료
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | Oracle DDL | `ASSIGNMENTS`, `ASSIGNMENT_SUBMISSIONS` 테이블 생성 | ✅ 완료 |
| 2 | `entity/assignment/Assignment.java` | 과제 엔티티 | ✅ 완료 |
| 3 | `entity/assignment/AssignmentSubmission.java` | 제출물 엔티티 | ✅ 완료 |
| 4 | `domain/assignment/repository/AssignmentRepository.java` | 강의별 과제 조회 | ✅ 완료 |
| 5 | `domain/assignment/repository/AssignmentSubmissionRepository.java` | 과제별/학생별 제출 조회 | ✅ 완료 |
| 6 | `domain/assignment/dto/` | 과제 생성/수정 Request, 제출 Request, 채점 Request, Response | ✅ 완료 |
| 7 | `domain/assignment/service/AssignmentService.java` | 과제 CRUD, 제출 처리 (지각 판정), 채점 | ✅ 완료 |
| 8 | `domain/assignment/controller/AssignmentController.java` | 9개 엔드포인트 | ✅ 완료 |
| 9 | `global/exception/ErrorCode.java` | `SUBMISSION_ALREADY_EXISTS`, `ASSIGNMENT_CLOSED` 추가 | ✅ 완료 |

> **지각 판정**: `submittedAt.isAfter(assignment.getDueDate())` → status = `LATE`. `allowLateSubmit = false` 이면 `ASSIGNMENT_CLOSED` 예외 발생.

##### FR-14. 시험 관리감독 시스템 ✅ 완료
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | Oracle DDL | `EXAMS`, `EXAM_REGISTRATIONS`, `EXAM_SUPERVISORS` 테이블 생성 | ✅ 완료 |
| 2 | `entity/exam/Exam.java` | 시험 엔티티 | ✅ 완료 |
| 3 | `entity/exam/ExamRegistration.java` | 시험 등록/신청 엔티티 | ✅ 완료 |
| 4 | `entity/exam/ExamSupervisor.java` | 감독관 배정 엔티티 | ✅ 완료 |
| 5 | `domain/exam/repository/ExamRepository.java` | 강의별/날짜별 시험 조회 | ✅ 완료 |
| 6 | `domain/exam/repository/ExamRegistrationRepository.java` | 시험별 응시자 조회, 학생별 시험 일정 | ✅ 완료 |
| 7 | `domain/exam/repository/ExamSupervisorRepository.java` | 시험별 감독관, 사용자별 감독 시험 | ✅ 완료 |
| 8 | `domain/exam/dto/` | 시험 생성/수정 Request, 감독관 배정 Request, 응시 상태 Request, Response | ✅ 완료 |
| 9 | `domain/exam/service/ExamService.java` | 시험 CRUD, 감독관 배정, 특별시험 신청/승인, 응시 상태 관리 | ✅ 완료 |
| 10 | `domain/exam/controller/ExamController.java` | 12개 엔드포인트 | ✅ 완료 |
| 11 | `global/exception/ErrorCode.java` | `EXAM_ALREADY_REGISTERED`, `EXAM_FULL` 추가 | ✅ 완료 |

---

#### 📋 Phase 4 프론트엔드 작업 목록 ✅ 완료 (2026-06-10)

##### FR-12. 학생 상담 관리
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | `src/api/counseling.ts` | 상담 API 모듈 (신청/처리/기록 CRUD/이메일) | ✅ 완료 |
| 2 | `src/types/index.ts` | `CounselingRequest`, `CounselingRecord` 타입 추가 | ✅ 완료 |
| 3 | `src/pages/counseling/CounselingRequestPage.tsx` | 학생용: 상담 신청 폼 + 내 신청 현황 + 상태 배지 | ✅ 완료 |
| 4 | `src/pages/counseling/CounselingManage.tsx` | 교수·교직원용: 신청 목록(수락/거절/기록작성 모달) | ✅ 완료 |
| 5 | `src/pages/counseling/CounselingHistory.tsx` | 공통: 상담 기록 목록+상세 2패널, 이메일 발송 버튼 | ✅ 완료 |

##### FR-13. 과제 제출 시스템
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | `src/api/assignments.ts` | 과제 API 모듈 (CRUD, 제출 JSON/multipart, 채점) | ✅ 완료 |
| 2 | `src/types/index.ts` | `Assignment`, `AssignmentSubmission` 타입 추가 | ✅ 완료 |
| 3 | `src/pages/assignments/AssignmentList.tsx` | 공통: 강의 선택 → 과제 목록 + D-day + 제출 상태 | ✅ 완료 |
| 4 | `src/pages/assignments/AssignmentDetail.tsx` | 학생용: 제출 폼(파일/텍스트) + 결과 / 교수용: 제출 현황 + 채점 모달 | ✅ 완료 |
| 5 | `src/pages/assignments/AssignmentCreate.tsx` | 교수용: react-hook-form+zod 과제 개설 폼 | ✅ 완료 |

##### FR-14. 시험 관리감독 시스템
| 순서 | 파일 경로 | 작업 내용 | 상태 |
|------|-----------|-----------|------|
| 1 | `src/api/exams.ts` | 시험 API 모듈 (CRUD, 감독관, 특별신청, 응시 상태) | ✅ 완료 |
| 2 | `src/types/index.ts` | `Exam`, `ExamRegistration`, `ExamSupervisor` 타입 추가 | ✅ 완료 |
| 3 | `src/pages/exams/ExamList.tsx` | 공통: 강의/유형/날짜 필터 + 시험 목록 | ✅ 완료 |
| 4 | `src/pages/exams/ExamDetail.tsx` | 시험 상세 + 감독관 추가/제거 + 특별시험 신청 + 응시자 상태 변경 | ✅ 완료 |
| 5 | `src/pages/exams/ExamCreate.tsx` | 교수·교직원용: react-hook-form+zod 시험 등록 폼 | ✅ 완료 |
| 6 | `src/pages/exams/MyExamSchedule.tsx` | 학생용: 날짜별 그룹 내 시험 일정 리스트 | ✅ 완료 |

##### 라우팅 & 레이아웃 통합
| 파일 | 변경 내용 | 상태 |
|------|-----------|------|
| `src/components/layout/AppLayout.tsx` | 역할별 상담/과제/시험 메뉴 추가 (STUDENT: 상담신청·내시험·시험일정·과제 / PROFESSOR: 상담관리·과제·시험 / STAFF·ADMIN: 상담관리·시험) | ✅ 완료 |
| `src/App.tsx` | 상담(3), 과제(3), 시험(4) 라우트 추가 (역할별 ProtectedRoute 포함) | ✅ 완료 |

> **공통 주의사항**
> - 파일 업로드(과제 제출)는 `multipart/form-data`. 백엔드에서 로컬 파일 경로 저장, 향후 S3 교체 대비 `FileStorageService` 인터페이스로 추상화 권장.
> - 이메일 발송(상담 통지)은 비동기(`@Async`) 처리로 API 응답 지연 방지.
> - 시험 날짜는 프론트에서 날짜 피커 + 시간 피커 조합 (ISO 8601 형식으로 전송).

---

### 🔴 우선 (통합 테스트 준비)

1. **프론트 ↔ 백엔드 통합 테스트** — 개발된 전체 API가 프론트엔드(`campusOne_app`)와 정상적으로 연동되는지 검증
2. **에러 핸들링 보완** — 런타임 에러(예: 404 Not Found, 400 Bad Request) 대응 확인

### 🟡 이후 (통합 테스트)

- 프론트 ↔ 백엔드 각 도메인 API 실제 연동 확인
- 역할별 접근 제어 시나리오 테스트
- 전자결재 결재선 순차 처리 흐름 E2E 테스트

---

## 샘플 데이터 (`data.sql`)

파일 위치: `campusOne/data.sql` — DB 초기화 시 Oracle SQL*Plus 또는 SQLcl로 실행

### 삽입된 주요 데이터

| 테이블 | 건수 | 비고 |
|--------|------|------|
| COLLEGES | 5 | 공과대학, 경영대학, 사회과학대학, 자연과학대학, 사범대학 |
| DEPARTMENTS | 10 | 학과별 CODE (CS, EE, BIZ, MATH, ENG, POL 등) |
| ADMINISTRATIVE_OFFICES | 7 | 교학처, 총무처, 전산실 등 |
| USERS (STAFF) | 3 | `staff_kim`, `staff_lee`, `staff_park` |
| USERS (PROFESSOR) | 8 | `prof_cs1`~`prof_pol` |
| USERS (STUDENT) | 15 | `student_20210001`~`student_20230005` |
| COURSES | 10 | 2025-1학기 (CS101, CS201, EE101, MATH101 등) |
| ENROLLMENTS | 21 | 현재 학기 18건 + 과거 학기(2024-2) 3건 |
| GRADES | 3 | 2024-2학기 확정 성적 (CONFIRMED) |
| NOTICES | 6 | 일반/학사/장학/취업 카테고리 |
| APPROVAL_TEMPLATES | 6 | 휴학원, 복학원, 수강변경, 성적이의, 전보, 예산집행품의 |
| APPROVAL_DOCUMENTS | 2 | 휴학신청(진행 중), 성적이의(처리 완료) |

### 샘플 계정

| 역할 | 아이디 | 비밀번호 |
|------|--------|---------|
| ADMIN | `admin` | `admin123` (DataInitializer 자동 생성) |
| STUDENT | `student_20210001` 외 14명 | `test1234` |
| PROFESSOR | `prof_cs1` 외 7명 | `test1234` |
| STAFF | `staff_kim`, `staff_lee`, `staff_park` | `test1234` |

> BCrypt 해시: `$2a$10$.SPiCWLA.e5fhlomJqo47.FegSTHErjjYih2uf5neF/9OPrt5ncDm` (`test1234`)

### 📝 코드 작성 시 주의사항

**백엔드**
- 패키지 루트: `com.campus.campus_api`
- 소스 경로: `campusOne_api/src/main/java/com/campus/campus_api/`
- Oracle JPA 매핑 규칙 섹션 반드시 참고
- `ddl-auto: validate` — 스키마 변경 시 직접 DDL 실행 필요

**프론트엔드**
- `components/ui/button.tsx`, `lib/utils.ts` 절대 덮어쓰지 말 것
- 새 UI는 순수 TailwindCSS + HTML 요소만 사용 (shadcn registry import 금지)
- `@/` = `src/` 경로 별칭 (vite.config.ts 설정)
- 모든 API 모듈은 `res.data.data` 반환 패턴 준수
- 타입은 반드시 `import type` 사용
