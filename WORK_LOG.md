# CampusOne 학사 업무 시스템 — 작업 로그

마지막 업데이트: 2026-06-09 (2차)

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

### 기술 스택

**백엔드**
- Spring Boot 3.5.14, Java 17
- Spring Data JPA + Hibernate 6 (OracleDialect, validate 모드)
- Spring Security + JWT (jjwt 0.12.6)
- Oracle 21c XE (Docker, schema=UAMS, localhost:1521/XEPDB1)
- Lombok, Bean Validation

**프론트엔드**
- React 19, Vite 8, TypeScript
- TailwindCSS v4 (`@tailwindcss/vite`)
- react-router-dom v7 (`createBrowserRouter`)
- @tanstack/react-query v5, zustand v5 + persist
- axios v1, react-hook-form v7 + zod v4, lucide-react

---

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

## API 공통 응답 형식

```json
// 성공
{ "success": true, "data": { ... }, "message": null }

// 실패
{ "success": false, "data": null, "message": "에러 메시지" }
```

Base URL: `http://localhost:8080/api`  
인증: `Authorization: Bearer <accessToken>` 헤더

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
| STUDENT | 대시보드, 강의 목록, 공지사항, 전자결재, 수강신청 현황, 내 성적, 학과 안내 |
| PROFESSOR | 대시보드, 강의 목록, 공지사항, 전자결재, 성적 입력, 학생 조회, 학과 안내 |
| STAFF | 대시보드, 강의 목록, 공지사항, 전자결재, 학생 관리, 교수 관리, 학과 관리 |
| ADMIN | 대시보드, 강의 목록, 공지사항, 전자결재, 학생 관리, 교수 관리, 교직원 관리, 학과 관리 |

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
