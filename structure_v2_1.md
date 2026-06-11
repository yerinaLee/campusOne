# 대학교 학사 업무 시스템 (UAMS)
## 프로젝트 통합 설계 문서 v2.1

> 이 문서는 **AI 업무 배정용 마스터 문서**입니다.
> 프론트엔드 AI, 백엔드 AI 모두 이 문서를 기반으로 작업합니다.
> API 상세 명세는 별도 `api_spec.md` 를 참조하세요.

---

# PART 1. 요구사항 정의서

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 대학교 학사 업무 시스템 (UAMS) |
| 목적 | 대학교 학사 업무 전반을 디지털화하여 학생·교수·교직원의 업무 효율 향상 |
| 개발 기간 | 10일 (스프린트 2회) |
| 용도 | 대학교 전산실 입사 지원 포트폴리오 |
| 배포 환경 | 개인 NAS 서버 (Docker Compose) |

---

## 2. 기술 스택

### Backend
| 구분 | 기술 | 버전 |
|------|------|------|
| Language | Java | 17 (LTS) |
| Framework | Spring Boot | 3.5.x |
| ORM | Spring Data JPA + Hibernate 6 | OracleDialect |
| Security | Spring Security + JWT (jjwt 0.12.6) | - |
| Build | Gradle | 8.x |
| DB | Oracle XE | 21c (Docker) |
| API Docs | Springdoc OpenAPI (Swagger) | 2.x |

### Frontend
| 구분 | 기술 | 버전 |
|------|------|------|
| Language | TypeScript | 5.x |
| Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| UI | TailwindCSS | v4 |
| State | Zustand + persist | v5 |
| Data Fetching | TanStack Query | v5 |
| Form | React Hook Form + Zod | v7 + v4 |
| Router | react-router-dom | v7 |
| HTTP | axios | v1 |

### Infra / DevOps
| 구분 | 기술 |
|------|------|
| 개발 DB | Docker (Oracle XE 단독) |
| 배포 | Docker Compose (NAS 서버 전체 통합) |
| VCS | Git + GitHub |

---

## 3. 시스템 아키텍처

```
[Browser]
    │
    ▼
[React SPA : Vite + nginx]
    │ REST API (JSON + JWT Bearer Token)
    ▼
[Spring Boot API Server : 8080]
    ├── Spring Security (JWT Filter)
    ├── Controller → Service → Repository
    └── Spring Data JPA (OracleDialect)
            │
            ▼
    [Oracle XE 21c : 1521 / XEPDB1 / UAMS 스키마]
```

---

## 4. 사용자 역할(Role) 정의

| Role | 설명 | 주요 권한 |
|------|------|-----------|
| `ROLE_ADMIN` | 시스템 관리자 (전산실) | 전체 CRUD, 사용자 관리, 시스템 설정, 결재 최종승인 |
| `ROLE_STAFF` | 교직원 (교학처·총무처 등) | 학과·강의·성적 관리, 전자결재 처리, 공지 작성, 발령 처리 |
| `ROLE_PROFESSOR` | 교수 | 강의 관리, 성적 입력, 공지 작성, 전자결재 기안·처리 |
| `ROLE_STUDENT` | 학생 | 수강신청, 성적 조회, 공지 조회, 전자결재 기안 |

---

## 5. 기능 요구사항

### 5.1 로그인 및 권한 관리 (FR-01)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-01-01 | 아이디/비밀번호 로그인 | 필수 | ALL |
| FR-01-02 | JWT Access Token 발급 (만료 1h) | 필수 | ALL |
| FR-01-03 | Refresh Token 발급 및 자동 갱신 (만료 7d) | 필수 | ALL |
| FR-01-04 | 로그아웃 (Refresh Token 무효화) | 필수 | ALL |
| FR-01-05 | 비밀번호 변경 | 필수 | ALL |
| FR-01-06 | Role 기반 메뉴/페이지 접근 제어 | 필수 | ALL |
| FR-01-07 | 계정 잠금 (5회 연속 실패 시) | 권장 | ADMIN |

### 5.2 학생 관리 (FR-02)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-02-01 | 학생 등록 (학번 자동 채번: YYYY+0001) | 필수 | ADMIN, STAFF |
| FR-02-02 | 학생 정보 조회 (목록/상세, 페이징) | 필수 | ADMIN, STAFF, PROFESSOR |
| FR-02-03 | 학생 정보 수정 | 필수 | ADMIN, STAFF |
| FR-02-04 | 학생 상태 변경 (재학/휴학/졸업/제적) | 필수 | ADMIN, STAFF |
| FR-02-05 | 학생 검색 (학번·이름·학과·상태) | 필수 | ADMIN, STAFF, PROFESSOR |
| FR-02-06 | 본인 정보 조회/수정 (연락처·주소) | 필수 | STUDENT |

### 5.3 교수 관리 (FR-03)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-03-01 | 교수 등록 (교번 자동 채번: P+YYYY+0001) | 필수 | ADMIN, STAFF |
| FR-03-02 | 교수 정보 조회 (목록/상세, 페이징) | 필수 | ADMIN, STAFF |
| FR-03-03 | 교수 정보 수정 | 필수 | ADMIN, STAFF |
| FR-03-04 | 교수 상태 변경 (재직/휴직/퇴직) | 필수 | ADMIN, STAFF |
| FR-03-05 | 교수 담당 강의 목록 조회 | 필수 | ALL |
| FR-03-06 | 본인 정보 조회/수정 | 필수 | PROFESSOR |

### 5.4 교직원 관리 (FR-04) ★

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-04-01 | 교직원 등록 (사번 자동 채번: S+YYYY+0001) | 필수 | ADMIN |
| FR-04-02 | 교직원 정보 조회 (목록/상세) | 필수 | ADMIN |
| FR-04-03 | 교직원 정보 수정 | 필수 | ADMIN |
| FR-04-04 | 교직원 직무 등록/수정 (겸직 포함) | 필수 | ADMIN |
| FR-04-05 | 교직원 발령 처리 (전보·승진·퇴직) | 필수 | ADMIN |
| FR-04-06 | 발령 이력 조회 | 필수 | ADMIN |
| FR-04-07 | 행정 부서 관리 (처/팀 CRUD) | 필수 | ADMIN |
| FR-04-08 | 직위 코드 관리 | 권장 | ADMIN |

### 5.5 학과 관리 (FR-05)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-05-01 | 단과대학 등록/수정/삭제 | 권장 | ADMIN, STAFF |
| FR-05-02 | 학과 등록/수정/삭제 | 필수 | ADMIN, STAFF |
| FR-05-03 | 학과 목록 및 상세 조회 | 필수 | ALL |
| FR-05-04 | 학과별 학생/교수 현황 조회 | 필수 | ADMIN, STAFF |

### 5.6 강의 관리 (FR-06)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-06-01 | 강의 개설 (학수번호 자동 채번) | 필수 | ADMIN, STAFF |
| FR-06-02 | 강의 정보 수정/폐강 | 필수 | ADMIN, STAFF |
| FR-06-03 | 강의 목록/상세 조회 (페이징·필터) | 필수 | ALL |
| FR-06-04 | 강의 시간표 충돌 검증 | 필수 | ADMIN, STAFF |
| FR-06-05 | 학기별 강의 조회 | 필수 | ALL |
| FR-06-06 | 수강 인원 현황 조회 | 필수 | ADMIN, STAFF, PROFESSOR |

### 5.7 수강신청 (FR-07)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-07-01 | 수강신청 (정원 초과 시 불가, 낙관적 락) | 필수 | STUDENT |
| FR-07-02 | 수강 취소 | 필수 | STUDENT |
| FR-07-03 | 내 수강신청 내역 조회 | 필수 | STUDENT |
| FR-07-04 | 시간표 중복 검증 | 필수 | STUDENT |
| FR-07-05 | 수강신청 기간 설정 | 필수 | ADMIN, STAFF |
| FR-07-06 | 전체 수강신청 현황 조회 | 필수 | ADMIN, STAFF, PROFESSOR |

### 5.8 성적 관리 (FR-08)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-08-01 | 성적 입력 (A+~F, P/NP 지원) | 필수 | PROFESSOR |
| FR-08-02 | 성적 수정 (확정 전) | 필수 | PROFESSOR |
| FR-08-03 | 성적 확정 처리 | 필수 | STAFF |
| FR-08-04 | 본인 성적 조회 (과목별/학기별) | 필수 | STUDENT |
| FR-08-05 | GPA 자동 계산 (P/NP 제외) | 필수 | SYSTEM |
| FR-08-06 | 성적 분포 통계 조회 (강의별) | 권장 | PROFESSOR, STAFF |
| FR-08-07 | 성적표 출력 | 권장 | STUDENT |

### 5.9 공지사항 (FR-09)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-09-01 | 공지 작성/수정/삭제 | 필수 | ADMIN, STAFF, PROFESSOR |
| FR-09-02 | 공지 목록/상세 조회 | 필수 | ALL |
| FR-09-03 | 카테고리 분류 (학사/학과/강의/일반) | 필수 | ALL |
| FR-09-04 | 공지 검색 (제목/내용) | 필수 | ALL |
| FR-09-05 | 상단 고정(pinned) 공지 | 권장 | ADMIN, STAFF |
| FR-09-06 | 파일 첨부 | 권장 | ADMIN, STAFF, PROFESSOR |

### 5.10 전자결재 (FR-10)

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-10-01 | 결재 문서 기안 (휴학원·복학원·수강정정 등) | 필수 | STUDENT, PROFESSOR |
| FR-10-02 | 결재 라인 구성 (기안→검토→최종승인) | 필수 | ADMIN, STAFF |
| FR-10-03 | 결재 처리 (승인/반려 + 의견) | 필수 | PROFESSOR, STAFF, ADMIN |
| FR-10-04 | 결재 상태 조회 | 필수 | ALL |
| FR-10-05 | 문서 목록 조회 (기안함/결재함/완료함) | 필수 | ALL |
| FR-10-06 | 결재 알림 (상태 변경 시) | 권장 | ALL |
| FR-10-07 | 결재 양식 관리 | 권장 | ADMIN |

### 5.11 출결 관리 (FR-11) ★★ 신규

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-11-01 | 출결 세션 생성 (QR 토큰 + 6자리 코드 자동 생성) | 필수 | PROFESSOR |
| FR-11-02 | QR 코드 화면 표시 (교수 화면에 QR + 코드 노출) | 필수 | PROFESSOR |
| FR-11-03 | 세션 수동 종료 | 필수 | PROFESSOR |
| FR-11-04 | 6자리 코드 재생성 (기존 코드 즉시 무효화) | 필수 | PROFESSOR |
| FR-11-05 | QR 스캔 → 세션 정보 확인 (활성 여부) | 필수 | STUDENT |
| FR-11-06 | 6자리 코드 입력으로 출석 체크인 | 필수 | STUDENT |
| FR-11-07 | 세션별 출결 현황 실시간 조회 | 필수 | PROFESSOR |
| FR-11-08 | 강의 전체 출결 집계 조회 (출석·지각·결석 통계) | 필수 | PROFESSOR, ADMIN, STAFF |
| FR-11-09 | 내 출결 현황 조회 (강의별·전체) | 필수 | STUDENT |
| FR-11-10 | 출결 수동 조정 (사유 기록 필수) | 필수 | PROFESSOR, ADMIN, STAFF |
| FR-11-11 | 지각 임계 시간 설정 (세션 생성 시 선택) | 권장 | PROFESSOR |
| FR-11-12 | GPS 좌표 수집 (선택적 보조 수단, 강제하지 않음) | 권장 | STUDENT |
| FR-11-13 | 출결 통계 강의 대시보드 (출석률 그래프) | 권장 | PROFESSOR, ADMIN, STAFF |

> **QR 체크인 흐름 요약**
> 1. 교수 → 출결 세션 생성 (강의 선택, 시간 설정)
> 2. 시스템 → QR URL(`/attend/{qrToken}`) + 6자리 코드 발급
> 3. 교수 → 강의실 화면(빔프로젝터 등)에 QR + 코드 표시
> 4. 학생 → 핸드폰으로 QR 스캔 → 브라우저에서 사이트 진입
> 5. 학생 → 6자리 코드 입력 → 출석 확인
> 6. 시스템 → 입력 시각에 따라 PRESENT(출석) / LATE(지각) 자동 판정

### 5.12 학생 상담 관리 (FR-12) ★★ 신규

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-12-01 | 상담 신청 (유형·희망일·사유 입력) | 필수 | STUDENT |
| FR-12-02 | 상담 신청 처리 (수락 / 거절 + 사유) | 필수 | PROFESSOR, STAFF |
| FR-12-03 | 상담 기록 직접 작성 (신청 없이 기록 가능) | 필수 | PROFESSOR, STAFF |
| FR-12-04 | 상담 기록 수정 | 필수 | PROFESSOR, STAFF |
| FR-12-05 | 내 상담 기록 조회 | 필수 | STUDENT |
| FR-12-06 | 전체 상담 기록 조회 (학생·유형·기간 필터) | 필수 | PROFESSOR, STAFF, ADMIN |
| FR-12-07 | 상담 결과 이메일 발송 (학생에게 통지) | 필수 | PROFESSOR, STAFF, ADMIN |
| FR-12-08 | 비밀 상담 기록 (학생 조회 차단) | 권장 | PROFESSOR, STAFF |
| FR-12-09 | 상담 통계 조회 (유형별·기간별 건수) | 권장 | ADMIN, STAFF |

> **상담 흐름**: 학생 신청(PENDING) → 담당자 수락(ACCEPTED) → 상담 실시 → 기록 작성 → 이메일 발송

### 5.13 과제 제출 시스템 (FR-13) ★★ 신규

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-13-01 | 과제 개설 (제목·설명·마감일·최대점수·제출 유형 설정) | 필수 | PROFESSOR |
| FR-13-02 | 과제 가시성 설정 (비공개→공개 전환) | 필수 | PROFESSOR |
| FR-13-03 | 과제 수정 / 삭제 | 필수 | PROFESSOR |
| FR-13-04 | 강의별 과제 목록 조회 | 필수 | PROFESSOR, STUDENT |
| FR-13-05 | 과제 제출 (파일 업로드 or 텍스트, 중복 제출 불가) | 필수 | STUDENT |
| FR-13-06 | 지각 제출 여부 자동 판정 (마감일 초과 시 LATE) | 필수 | SYSTEM |
| FR-13-07 | 제출 현황 조회 (제출자 목록 + 미제출자 목록) | 필수 | PROFESSOR, ADMIN, STAFF |
| FR-13-08 | 내 제출물 조회 (점수·피드백 포함) | 필수 | STUDENT |
| FR-13-09 | 채점 (점수 입력 + 피드백 작성) | 필수 | PROFESSOR |
| FR-13-10 | 채점 완료 후 과제 GRADED 상태 전환 | 권장 | PROFESSOR |
| FR-13-11 | 지각 제출 허용 여부 설정 (과제별) | 권장 | PROFESSOR |

### 5.14 시험 관리감독 시스템 (FR-14) ★★ 신규

| ID | 기능 | 우선순위 | 담당 Role |
|----|------|----------|-----------|
| FR-14-01 | 시험 일정 등록 (유형·날짜·시간·강의실·정원) | 필수 | PROFESSOR, STAFF |
| FR-14-02 | 시험 수정 / 취소 | 필수 | PROFESSOR, STAFF |
| FR-14-03 | 감독관 배정 (주감독 1명 + 보조감독 복수) | 필수 | PROFESSOR, STAFF, ADMIN |
| FR-14-04 | 시험 목록 조회 (강의별·날짜별·유형별 필터) | 필수 | ALL |
| FR-14-05 | 내 시험 일정 조회 (수강 강의 기준 자동 집계) | 필수 | STUDENT |
| FR-14-06 | 특별 시험 신청 (재시험·추가시험·사유 첨부) | 필수 | STUDENT |
| FR-14-07 | 특별 시험 신청 처리 (승인 / 거절) | 필수 | PROFESSOR, STAFF |
| FR-14-08 | 시험 응시 상태 기록 (출석·결시·면제) | 필수 | PROFESSOR, STAFF |
| FR-14-09 | 내 감독 시험 조회 | 필수 | PROFESSOR, STAFF |
| FR-14-10 | 시험 통계 (강의별 응시율·결시율) | 권장 | PROFESSOR, ADMIN, STAFF |

> **시험 유형**: MIDTERM(중간고사), FINAL(기말고사), QUIZ(쪽지시험), MAKEUP(재시험), EXTRA(추가시험)

---

## 6. 비기능 요구사항

| ID | 구분 | 내용 |
|----|------|------|
| NFR-01 | 보안 | 모든 API JWT 인증 필수, 비밀번호 BCrypt 암호화 |
| NFR-02 | 보안 | Role 기반 API 엔드포인트 접근 제어 (@PreAuthorize) |
| NFR-03 | 성능 | 주요 목록 조회 API 응답 2초 이내 |
| NFR-04 | 성능 | 수강신청 동시 요청 처리 (낙관적 락 + @Version) |
| NFR-05 | 유지보수 | Swagger UI 통한 API 문서 자동화 (/swagger-ui.html) |
| NFR-06 | 유지보수 | 전역 예외 처리 및 표준 응답 형식 |
| NFR-07 | 운영 | Docker Compose로 단일 명령 배포 |
| NFR-08 | UX | 반응형 UI (데스크탑/태블릿 지원) |

---

## 7. 개발 일정 (10일)

### Sprint 1 (Day 1~5)
| Day | 작업 |
|-----|------|
| Day 1 | 프로젝트 세팅, 공통 모듈, Docker DB 기동, DDL 실행 |
| Day 2 | JWT 인증/인가, 로그인·로그아웃, Role 접근 제어 |
| Day 3 | 학생·교수·교직원 관리 API + 화면 |
| Day 4 | 학과·단과대·강의 관리 API + 화면 |
| Day 5 | 수강신청 (정원·시간충돌·낙관적 락) API + 화면 |

### Sprint 2 (Day 6~10)
| Day | 작업 |
|-----|------|
| Day 6 | 성적 관리 (입력·확정·GPA) API + 화면 |
| Day 7 | 공지사항 (CRUD·검색·첨부) API + 화면 |
| Day 8 | 전자결재 (기안·결재라인·승인/반려) API + 화면 |
| Day 9 | 통합 테스트, 버그 수정, UI 개선 |
| Day 10 | README, 더미 데이터, Docker 전체 배포 검증 |

---

# PART 2. DB 테이블 설계서
## DBMS: Oracle Database 21c XE (Docker)

---

## 1. 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|-----------|
| v1.0 | - | 최초 작성 (PostgreSQL) |
| v2.0 | - | DBMS → Oracle 21c XE 변경, 교직원(staff) 도메인 추가, Docker 구성 추가 |
| v2.1 | - | Docker 구성 변경: 개발 시 DB만 컨테이너, 백엔드·프론트 로컬 실행 분리 |

---

## 2. Oracle DDL 변환 핵심 차이점

| 항목 | PostgreSQL | Oracle 21c |
|------|-----------|------------|
| Auto Increment | `BIGSERIAL` | `NUMBER(19)` + `GENERATED ALWAYS AS IDENTITY` |
| 현재 시각 | `NOW()` | `SYSTIMESTAMP` |
| 타임존 포함 날짜 | `TIMESTAMPTZ` | `TIMESTAMP WITH TIME ZONE` |
| 논리값 | `BOOLEAN` | `NUMBER(1,0) DEFAULT 0 CHECK (col IN (0,1))` |
| 문자열 대용량 | `TEXT` | `CLOB` |
| JSON | `JSONB` | `CLOB CHECK (col IS JSON)` *(Oracle 21c JSON type 사용 가능)* |
| 조건부 인덱스 | `WHERE 절` | `Function-Based Index` 또는 불가 시 일반 인덱스 |
| 스키마 | DB별 분리 | **USER = SCHEMA** (uams 유저 생성 후 해당 스키마 사용) |
| 문자셋 | UTF-8 | `AL32UTF8` (NLS_CHARACTERSET) |

---

## 3. 공통 설계 원칙

- PK: `NUMBER(19) GENERATED ALWAYS AS IDENTITY` (Oracle 12c+ 방식)
- Sequence는 별도 생성 없이 IDENTITY 컬럼으로 대체
- 논리 삭제: `DELETED_AT TIMESTAMP WITH TIME ZONE` (NULL = 사용 중)
- 감사 컬럼: `CREATED_AT`, `UPDATED_AT`, `CREATED_BY` 전 테이블 공통
- Boolean: `NUMBER(1,0)` + CHECK 제약 (`0`=false, `1`=true)
- 테이블명/컬럼명: 대문자 관례 (Oracle 기본 대소문자 무시)
- 문자셋: `AL32UTF8` (한글 포함 다국어)
- NLS_DATE_FORMAT: `YYYY-MM-DD HH24:MI:SS`

---

## 4. Docker 구성

> **개발 환경 전략**: 백엔드·프론트엔드는 로컬에서 직접 실행 (핫리로드·빠른 재시작),
> Oracle DB만 Docker로 띄운다. 포트폴리오 최종 제출 시에는 전체 통합 compose로 묶는다.

### 4.1 개발 환경 vs 배포 환경 구분

| 구분 | Oracle DB | Spring Boot | React |
|------|-----------|-------------|-------|
| **개발 (로컬)** | Docker 컨테이너 | 로컬 `./gradlew bootRun` | 로컬 `npm run dev` |
| **배포 (포트폴리오 최종)** | Docker 컨테이너 | Docker 컨테이너 | Docker 컨테이너 |

### 4.2 디렉터리 구조

```
university-system/
├── docker-compose.yml          -- 개발용: DB 전용
├── docker-compose.prod.yml     -- 배포용: 전체 서비스
├── .env
├── oracle/
│   └── init/
│       ├── 01_create_user.sql  -- 스키마 유저 생성
│       ├── 02_ddl_tables.sql   -- 전체 테이블 DDL
│       ├── 03_indexes.sql      -- 인덱스
│       └── 04_seed_data.sql    -- 초기 데이터
├── backend/
│   ├── Dockerfile              -- 배포용만 사용
│   └── src/ ...
└── frontend/
    ├── Dockerfile              -- 배포용만 사용
    └── src/ ...
```

### 4.3 docker-compose.yml (개발용 — DB 전용)

```yaml
version: '3.9'

services:
  oracle:
    image: gvenzl/oracle-xe:21-slim-faststart
    container_name: uams-oracle
    ports:
      - "1521:1521"         # 로컬 백엔드에서 localhost:1521로 접속
    environment:
      ORACLE_PASSWORD: ${ORACLE_SYS_PASSWORD:-SysPass123!}
      APP_USER: ${ORACLE_USER:-UAMS}
      APP_USER_PASSWORD: ${ORACLE_USER_PASSWORD:-UamsPass123!}
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ./oracle/init:/container-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "healthcheck.sh"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 120s    # Oracle 첫 기동 약 1~2분 소요
    restart: unless-stopped

volumes:
  oracle-data:
    driver: local
```

**실행 명령**

```bash
# DB 컨테이너 시작
docker compose up -d

# 로그 확인 (healthy 상태 대기)
docker compose logs -f oracle

# DB 컨테이너 중지 (데이터 유지)
docker compose stop

# DB 컨테이너 + 볼륨 완전 초기화
docker compose down -v
```

### 4.4 .env

```dotenv
ORACLE_SYS_PASSWORD=SysPass123!
ORACLE_USER=UAMS
ORACLE_USER_PASSWORD=UamsPass123!
```

### 4.5 Oracle init 스크립트 — 01_create_user.sql

```sql
-- gvenzl/oracle-xe 이미지는 APP_USER/APP_USER_PASSWORD 환경변수로
-- UAMS 유저를 자동 생성한다. 권한이 부족할 경우 아래를 수동 실행.

ALTER SESSION SET CONTAINER = XEPDB1;

GRANT CONNECT, RESOURCE, DBA TO UAMS;
GRANT CREATE SESSION TO UAMS;
GRANT UNLIMITED TABLESPACE TO UAMS;
```

### 4.6 로컬 백엔드 접속 설정 — application-local.yml

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521/XEPDB1
    username: UAMS
    password: UamsPass123!
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    hibernate:
      ddl-auto: validate
    database-platform: org.hibernate.dialect.OracleDialect
    properties:
      hibernate:
        format_sql: true
        default_schema: UAMS
        jdbc:
          time_zone: Asia/Seoul
```

**IntelliJ 실행 설정**: Run Configuration → Active Profiles → `local`

**터미널 실행**:
```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 4.6.2 로컬 프론트 실행

**터미널 실행**:
```
npm run dev
```

### 4.7 docker-compose.prod.yml (포트폴리오 최종 제출용)

```yaml
version: '3.9'

services:
  oracle:
    image: gvenzl/oracle-xe:21-slim-faststart
    container_name: uams-oracle
    ports:
      - "1521:1521"
    environment:
      ORACLE_PASSWORD: ${ORACLE_SYS_PASSWORD}
      APP_USER: ${ORACLE_USER}
      APP_USER_PASSWORD: ${ORACLE_USER_PASSWORD}
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ./oracle/init:/container-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "healthcheck.sh"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 120s
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: uams-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:oracle:thin:@oracle:1521/XEPDB1
      SPRING_DATASOURCE_USERNAME: ${ORACLE_USER}
      SPRING_DATASOURCE_PASSWORD: ${ORACLE_USER_PASSWORD}
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: oracle.jdbc.OracleDriver
      SPRING_JPA_DATABASE_PLATFORM: org.hibernate.dialect.OracleDialect
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      oracle:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: uams-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  oracle-data:
    driver: local
```

**배포 실행 명령**:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4.8 backend/Dockerfile (배포용)

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 4.9 frontend/Dockerfile (배포용)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 5. 테이블 상세 설계

> 전체 DDL은 [`schema.sql`](./schema.sql)을 참조하세요.  
> ERD: https://vocal-elf-237d1f.netlify.app/

도메인별 테이블 생성 스크립트는 `schema.sql`에서 관리합니다.

**실행 순서**:
```bash
# 1. 테이블 생성 (schema.sql)
sql UAMS/UamsPass123!@localhost:1521/XEPDB1 @schema.sql

# 2. 샘플 데이터 삽입 (data.sql)
sql UAMS/UamsPass123!@localhost:1521/XEPDB1 @data.sql
```

| 도메인 | 테이블 |
|--------|--------|
| 인증 | `USERS`, `REFRESH_TOKENS` |
| 조직 | `COLLEGES`, `DEPARTMENTS` |
| 학생 | `STUDENTS` |
| 교수 | `PROFESSORS` |
| 교직원 | `ADMINISTRATIVE_OFFICES`, `JOB_POSITIONS`, `STAFF_MEMBERS`, `STAFF_JOBS`, `STAFF_ASSIGNMENT_HISTORY` |
| 강의 | `COURSES`, `COURSE_SCHEDULES` |
| 수강신청 | `ENROLLMENTS` |
| 성적 | `GRADES` |
| 공지사항 | `NOTICES`, `NOTICE_ATTACHMENTS` |
| 전자결재 | `APPROVAL_TEMPLATES`, `APPROVAL_DOCUMENTS`, `APPROVAL_LINES`, `APPROVAL_NOTIFICATIONS` |
| 출결 ★★ | `ATTENDANCE_SESSIONS`, `ATTENDANCE_RECORDS` |
| 상담 ★★ | `COUNSELING_REQUESTS`, `COUNSELING_RECORDS` |
| 과제 ★★ | `ASSIGNMENTS`, `ASSIGNMENT_SUBMISSIONS` |
| 시험 ★★ | `EXAMS`, `EXAM_REGISTRATIONS`, `EXAM_SUPERVISORS` |

★★ = Phase 3·4 신규 추가

---

## 6. 전체 테이블 목록 (v2 기준)

| # | 테이블명 | 설명 | 도메인 |
|---|----------|------|--------|
| 1 | `USERS` | 통합 사용자 계정 | 인증 |
| 2 | `REFRESH_TOKENS` | JWT Refresh Token | 인증 |
| 3 | `COLLEGES` | 단과대학 | 조직 |
| 4 | `DEPARTMENTS` | 학과 | 조직 |
| 5 | `ADMINISTRATIVE_OFFICES` | 행정 부서 (처/팀) | 교직원 ★ |
| 6 | `JOB_POSITIONS` | 직위 코드 | 교직원 ★ |
| 7 | `STUDENTS` | 학생 상세 | 학생 |
| 8 | `PROFESSORS` | 교수 상세 | 교수 |
| 9 | `STAFF_MEMBERS` | 교직원 상세 | 교직원 ★ |
| 10 | `STAFF_JOBS` | 교직원 직무 (겸직 포함) | 교직원 ★ |
| 11 | `STAFF_ASSIGNMENT_HISTORY` | 교직원 발령 이력 | 교직원 ★ |
| 12 | `COURSES` | 강의(교과목) | 강의 |
| 13 | `COURSE_SCHEDULES` | 강의 시간표 | 강의 |
| 14 | `ENROLLMENTS` | 수강신청 | 수강 |
| 15 | `GRADES` | 성적 | 성적 |
| 16 | `NOTICES` | 공지사항 | 공지 |
| 17 | `NOTICE_ATTACHMENTS` | 공지 첨부파일 | 공지 |
| 18 | `APPROVAL_TEMPLATES` | 결재 양식 | 전자결재 |
| 19 | `APPROVAL_DOCUMENTS` | 결재 문서 | 전자결재 |
| 20 | `APPROVAL_LINES` | 결재 라인 | 전자결재 |
| 21 | `APPROVAL_NOTIFICATIONS` | 결재 알림 | 전자결재 |
| 22 | `ATTENDANCE_SESSIONS` | 출결 세션 | 출결 ★★ |
| 23 | `ATTENDANCE_RECORDS` | 학생 출결 기록 | 출결 ★★ |
| 24 | `COUNSELING_REQUESTS` | 학생 상담 신청 | 상담 ★★ |
| 25 | `COUNSELING_RECORDS` | 상담 기록 | 상담 ★★ |
| 26 | `ASSIGNMENTS` | 과제 | 과제 ★★ |
| 27 | `ASSIGNMENT_SUBMISSIONS` | 과제 제출물 | 과제 ★★ |
| 28 | `EXAMS` | 시험 일정 | 시험 ★★ |
| 29 | `EXAM_REGISTRATIONS` | 시험 응시 등록 | 시험 ★★ |
| 30 | `EXAM_SUPERVISORS` | 시험 감독관 배정 | 시험 ★★ |

★ = v2 신규 추가 | ★★ = Phase 3·4 신규 추가

---

## 7. 교직원 도메인 비즈니스 규칙

### 사번 채번 규칙
- 사번: `S` + `YYYY` + `0001`~`9999` → 예: `S20240001`

### 겸직 처리
- `STAFF_JOBS.IS_PRIMARY = 1` → 주 직무 (1인 1개만 허용 권장)
- `STAFF_JOBS.IS_PRIMARY = 0` → 겸직 (복수 가능)
- `END_DATE IS NULL` → 현재 수행 중인 직무

### 발령 처리 흐름
```
발령 기안(APPROVAL_DOCUMENTS)
    → 승인(APPROVED)
    → STAFF_ASSIGNMENT_HISTORY 레코드 INSERT
    → STAFF_MEMBERS.OFFICE_ID 업데이트
    → 기존 STAFF_JOBS.END_DATE = 발령일 설정
    → 새 STAFF_JOBS 레코드 INSERT
```

### 전자결재 결재자 선정 기준 (STAFF 기준)
| 직무 카테고리 | 담당 부서 | 결재선 예시 |
|--------------|-----------|------------|
| ACADEMIC | 교학처 | 담당자 → 팀장 → 교학처장 |
| IT | 전산실 | 담당자 → 팀장 → 처장 |
| FINANCE | 총무처/재무팀 | 담당자 → 팀장 → 처장 |
| HR | 총무처/인사팀 | 담당자 → 팀장 → 처장 |

---

## 8. Oracle 운영 참고

### 스키마 접속 정보 (Docker 환경)
```
Host     : localhost
Port     : 1521
Service  : XEPDB1
User     : UAMS
Password : UamsPass123!  (환경변수로 관리)
```

### Spring Boot Oracle JDBC 의존성 (build.gradle)
```groovy
dependencies {
    implementation 'com.oracle.database.jdbc:ojdbc11:23.4.0.24.05'
    implementation 'com.oracle.database.jdbc:ucp:23.4.0.24.05'
}
```

### application.yml JPA 설정
```yaml
spring:
  jpa:
    database-platform: org.hibernate.dialect.OracleDialect
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        default_schema: UAMS
        jdbc:
          time_zone: Asia/Seoul
```

### 시퀀스 / IDENTITY 컬럼 JPA 매핑
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

### 낙관적 락 설정 (수강신청)
```java
@Version
@Column(name = "VERSION_NO")
private Long versionNo;
```
