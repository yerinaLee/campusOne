# CampusOne — 대학교 학사 업무 통합 관리 시스템 (UAMS)

> **University Academic Management System**  
> Spring Boot 3.5 + React 19 + Oracle 21c 기반 풀스택 포트폴리오 프로젝트

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [주요 기능](#4-주요-기능)
5. [디렉터리 구조](#5-디렉터리-구조)
6. [시작하기](#6-시작하기)
7. [초기 계정 및 접속 정보](#7-초기-계정-및-접속-정보)
8. [API 규격](#8-api-규격)
9. [문서](#9-문서)

---

## 1. 프로젝트 개요

대학 내 학사 업무 전반을 디지털화하는 통합 관리 시스템입니다.  
학생·교수·교직원·관리자가 하나의 플랫폼에서 수강신청, 성적, 공지사항, 전자결재, 출결, 상담, 과제, 시험 관리를 수행할 수 있습니다.

| 항목 | 내용 |
|------|------|
| 개발 기간 | 10일 스프린트 (포트폴리오) |
| 개발 인원 | 1인 풀스택 |
| 목적 | 대학 IT 부서 취업 포트폴리오 |
| 사용자 역할 | ADMIN · STAFF · PROFESSOR · STUDENT |

---

## 2. 기술 스택

### Backend

| 항목 | 버전 |
|------|------|
| Java | 17 (LTS) |
| Spring Boot | 3.5.x |
| Spring Security | JWT Bearer Token (jjwt 0.12.6) |
| Spring Data JPA | Hibernate 6 + OracleDialect |
| Build | Gradle 8.x |
| Database | Oracle XE 21c (Docker) |
| API Docs | Springdoc OpenAPI (Swagger 2.x) |

### Frontend

| 항목 | 버전 |
|------|------|
| React | 19.x |
| TypeScript | 5.x |
| Build Tool | Vite 8.x |
| Styling | TailwindCSS v4 |
| State | Zustand v5 |
| Server State | TanStack Query v5 |
| Form | React Hook Form v7 + Zod v4 |
| Routing | react-router-dom v7 |
| HTTP | axios v1 |

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────┐
│   Browser  (React 19 SPA)   │
│   http://localhost:5173     │
└──────────────┬──────────────┘
               │  REST API + JWT Bearer Token
               ▼
┌─────────────────────────────┐
│  Spring Boot API Server     │
│  http://localhost:8080      │
│  ┌──────────────────────┐   │
│  │  JWT Security Filter │   │
│  └──────────┬───────────┘   │
│  Controller → Service →     │
│  Repository (JPA)           │
└──────────────┬──────────────┘
               │  jdbc:oracle:thin
               ▼
┌─────────────────────────────┐
│  Oracle XE 21c  :1521       │
│  Service: XEPDB1            │
│  Schema:  UAMS              │
└─────────────────────────────┘
```

### 역할별 권한

| 역할 | 설명 | 주요 권한 |
|------|------|-----------|
| `ADMIN` | 시스템 관리자 | 전체 CRUD, 사용자 관리, 최종 결재 |
| `STAFF` | 교직원 (행정·학사) | 학과·강의·성적 관리, 결재 처리 |
| `PROFESSOR` | 교수 | 강의·성적 입력, 공지·결재 기안 |
| `STUDENT` | 학생 | 수강신청, 성적 조회, 결재 기안 |

---

## 4. 주요 기능

| 도메인 | 기능 요약 |
|--------|-----------|
| **인증** (FR-01) | ID/PW 로그인, JWT Access/Refresh 토큰, BCrypt 암호화 |
| **학생 관리** (FR-02) | 학생 등록 (학번 자동 생성), CRUD, 상태 관리 (재학·휴학·졸업·제적) |
| **교수 관리** (FR-03) | 교수 등록 (교번 자동 생성), 정보 관리 |
| **교직원 관리** (FR-04) ★ | 직원 등록, 직위·부서 배정, 복수 직무, 인사이동·퇴직 처리 |
| **학과·단과대 관리** (FR-05) | 단과대학 및 학과 CRUD, 조직 구조 관리 |
| **강의 관리** (FR-06) | 강의 개설 (강의코드 자동 생성), 시간표 충돌 검사, 학기별 조회 |
| **수강신청** (FR-07) | 정원 초과 방지 (낙관적 락), 시간표 중복 검증, 신청 기간 관리 |
| **성적 관리** (FR-08) | 성적 입력 (A+~F, P/NP), 확정 워크플로, GPA 자동 계산, 성적표 |
| **공지사항** (FR-09) | 공지 CRUD (학교·학과·강의·일반), 검색, 파일 첨부 |
| **전자결재** (FR-10) | 문서 기안, 결재선 설정, 승인/반려, 진행 현황 추적 |
| **출결 관리** (FR-11) ★★ | QR코드 출석, 6자리 숫자 코드 백업, 실시간 현황, 통계 |
| **학생 상담** (FR-12) ★★ | 상담 신청, 수락/거절, 상담 기록, 이메일 알림 |
| **과제 제출** (FR-13) ★★ | 과제 생성, 파일/텍스트 제출, 지각 감지, 채점·피드백 |
| **시험 관리** (FR-14) ★★ | 시험 일정 등록, 감독관 배정, 특별시험 신청 |

> ★ = 교직원 도메인 신규 · ★★ = Phase 3·4 신규 추가

---

## 5. 디렉터리 구조

```
campusOne/
├── campusOne_api/                     # Spring Boot 백엔드
│   └── src/main/java/com/campus/
│       └── campus_api/
│           ├── global/                # 공통 예외, 응답 포맷, 설정
│           └── domain/                # 도메인별 패키지
│               ├── auth/              # 인증·인가
│               ├── user/              # 사용자 계정
│               ├── student/           # 학생
│               ├── professor/         # 교수
│               ├── staff/             # 교직원
│               ├── college/           # 단과대학
│               ├── department/        # 학과
│               ├── office/            # 행정 부서
│               ├── course/            # 강의
│               ├── enrollment/        # 수강신청
│               ├── grade/             # 성적
│               ├── notice/            # 공지사항
│               ├── approval/          # 전자결재
│               ├── attendance/        # 출결
│               ├── counseling/        # 상담
│               ├── assignment/        # 과제
│               └── exam/              # 시험
│
├── campusOne_app/frontend/            # React 프론트엔드
│   └── src/
│       ├── components/                # 공통 컴포넌트
│       ├── pages/                     # 페이지 컴포넌트
│       ├── hooks/                     # Custom hooks
│       ├── stores/                    # Zustand 전역 상태
│       ├── services/                  # API 서비스 레이어
│       ├── types/                     # TypeScript 타입 정의
│       └── lib/                       # 유틸리티
│
├── infra/
│   ├── docker-compose.yml             # Oracle 컨테이너 설정
│   └── oracle/init/                   # DB 초기화 스크립트
│
├── schema.sql                         # Oracle DDL (전체 테이블)
├── data.sql                           # 샘플 데이터
├── structure_v2_1.md                  # 마스터 기획·설계 문서
├── api_spec.md                        # API 명세서
└── WORK_LOG.md                        # 개발 작업 로그
```

---

## 6. 시작하기

### 사전 요구사항

- Java 17+
- Node.js 20+
- Docker & Docker Compose

### 1단계 — 데이터베이스 실행

```bash
cd infra
docker compose up -d

# Oracle 기동 완료까지 약 1~2분 소요
docker compose logs -f oracle
# "DATABASE IS READY TO USE" 메시지 확인 후 다음 단계 진행
```

### 2단계 — 스키마 및 샘플 데이터 적재

```bash
# 테이블 생성
sql UAMS/UamsPass123!@localhost:1521/XEPDB1 @schema.sql

# 샘플 데이터 삽입
sql UAMS/UamsPass123!@localhost:1521/XEPDB1 @data.sql
```

### 3단계 — 백엔드 실행

```bash
cd campusOne_api

# 로컬 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

> **Windows:** `gradlew.bat bootRun --args='--spring.profiles.active=local'`

### 4단계 — 프론트엔드 실행

```bash
cd campusOne_app/frontend

npm install
npm run dev
```

---

## 7. 초기 계정 및 접속 정보

### 접속 URL

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### 초기 관리자 계정

| 항목 | 값 |
|------|----|
| 아이디 | `admin` |
| 비밀번호 | `admin123` |

> 앱 최초 실행 시 `DataInitializer`가 자동으로 생성합니다.

### 데이터베이스 연결 정보

| 항목 | 값 |
|------|----|
| Host | `localhost:1521` |
| Service | `XEPDB1` |
| User | `UAMS` |
| Password | `UamsPass123!` |

---

## 8. API 규격

### 인증

모든 보호된 엔드포인트는 Authorization 헤더에 JWT Bearer Token이 필요합니다.

```
Authorization: Bearer {accessToken}
```

| 토큰 | 유효 시간 |
|------|-----------|
| Access Token | 1시간 |
| Refresh Token | 7일 |

### 표준 응답 형식

```json
{
  "success": true,
  "data": {},
  "message": "요청이 처리되었습니다.",
  "timestamp": "2024-09-01T12:00:00"
}
```

### 페이지네이션

```
GET /api/v1/students?page=0&size=20&sort=createdAt,desc
```

```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

> 전체 API 명세는 [`api_spec.md`](./api_spec.md) 또는 Swagger UI를 참조하세요.

---

## 9. 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| 마스터 기획서 | [`structure_v2_1.md`](./structure_v2_1.md) | 요구사항, DB 설계, 기술 스택, 개발 일정 |
| API 명세서 | [`api_spec.md`](./api_spec.md) | 전체 REST API 엔드포인트 상세 명세 |
| DB 스키마 | [`schema.sql`](./schema.sql) | Oracle DDL — 전체 테이블 생성 스크립트 |
| 샘플 데이터 | [`data.sql`](./data.sql) | 개발용 초기 데이터 |
| ERD | [`ERD_v1.html`](./ERD_v1.html) | 엔티티 관계도 |
| 작업 로그 | [`WORK_LOG.md`](./WORK_LOG.md) | 백엔드·프론트엔드 작업 진행 내역 |

---

<div align="center">

**CampusOne** — 대학교 학사 업무 통합 관리 시스템

</div>
