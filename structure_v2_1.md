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
| Framework | Spring Boot | 3.3.x |
| ORM | Spring Data JPA + Hibernate | - |
| Security | Spring Security + JWT | - |
| Build | Gradle | 8.x |
| DB | Oracle XE | 21c (Docker) |
| API Docs | Springdoc OpenAPI (Swagger) | 2.x |

### Frontend
| 구분 | 기술 | 버전 |
|------|------|------|
| Language | TypeScript | 5.x |
| Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| UI Library | Shadcn/ui + Tailwind CSS v4 | - |
| State | Zustand | - |
| Data Fetching | TanStack Query | v5 |
| Form | React Hook Form + Zod | - |
| Router | React Router | v6 |

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

## 7. 표준 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { },
  "message": "요청이 처리되었습니다.",
  "timestamp": "2024-09-01T12:00:00"
}
```

### 페이징 응답
```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "message": "조회되었습니다.",
  "timestamp": "2024-09-01T12:00:00"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_FULL",
    "message": "수강 정원이 초과되었습니다."
  },
  "timestamp": "2024-09-01T12:00:00"
}
```

### 주요 에러 코드
| 코드 | 상황 |
|------|------|
| `UNAUTHORIZED` | 인증 토큰 없음/만료 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스 없음 |
| `DUPLICATE_USERNAME` | 중복 아이디 |
| `ENROLLMENT_FULL` | 수강 정원 초과 |
| `ENROLLMENT_PERIOD_CLOSED` | 수강신청 기간 아님 |
| `SCHEDULE_CONFLICT` | 시간표 충돌 |
| `GRADE_ALREADY_CONFIRMED` | 이미 확정된 성적 |
| `ACCOUNT_LOCKED` | 계정 잠금 상태 |
| `OPTIMISTIC_LOCK_FAIL` | 동시 요청 충돌 (재시도 요청) |

---

## 8. 개발 일정 (10일)

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

## 5. 테이블 상세 설계 (Oracle DDL)

---

*ERD : https://vocal-elf-237d1f.netlify.app/* 

### 5.1 사용자 도메인

#### `USERS` — 통합 사용자 계정

```sql
CREATE TABLE USERS (
    ID               NUMBER(19)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME         VARCHAR2(50)    NOT NULL,
    PASSWORD_HASH    VARCHAR2(255)   NOT NULL,
    NAME             VARCHAR2(100)   NOT NULL,
    EMAIL            VARCHAR2(255)   NOT NULL,
    PHONE            VARCHAR2(20),
    ROLE             VARCHAR2(20)    NOT NULL,
    -- ADMIN | STAFF | PROFESSOR | STUDENT
    -- STAFF는 세부 직무를 STAFF_JOBS 테이블로 관리
    IS_ACTIVE        NUMBER(1,0)     DEFAULT 1 NOT NULL CHECK (IS_ACTIVE IN (0,1)),
    LOGIN_FAIL_COUNT NUMBER(3,0)     DEFAULT 0 NOT NULL,
    LOCKED_AT        TIMESTAMP WITH TIME ZONE,
    LAST_LOGIN_AT    TIMESTAMP WITH TIME ZONE,
    CREATED_BY       NUMBER(19),
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT       TIMESTAMP WITH TIME ZONE,
    CONSTRAINT UK_USERS_USERNAME UNIQUE (USERNAME),
    CONSTRAINT UK_USERS_EMAIL    UNIQUE (EMAIL),
    CONSTRAINT CHK_USERS_ROLE CHECK (
        ROLE IN ('ADMIN','STAFF','PROFESSOR','STUDENT')
    )
);

CREATE INDEX IDX_USERS_ROLE ON USERS(ROLE);
CREATE INDEX IDX_USERS_ACTIVE ON USERS(IS_ACTIVE, DELETED_AT);

COMMENT ON TABLE  USERS IS '통합 사용자 계정 (학생/교수/교직원/관리자)';
COMMENT ON COLUMN USERS.ROLE IS 'ADMIN=시스템관리자, STAFF=교직원, PROFESSOR=교수, STUDENT=학생';
```

---

#### `REFRESH_TOKENS` — JWT Refresh Token

```sql
CREATE TABLE REFRESH_TOKENS (
    ID          NUMBER(19)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID     NUMBER(19)      NOT NULL,
    TOKEN       VARCHAR2(512)   NOT NULL,
    EXPIRES_AT  TIMESTAMP WITH TIME ZONE NOT NULL,
    CREATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    REVOKED_AT  TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_RT_USER    FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT UK_RT_TOKEN   UNIQUE (TOKEN)
);

CREATE INDEX IDX_RT_USER  ON REFRESH_TOKENS(USER_ID);
CREATE INDEX IDX_RT_TOKEN ON REFRESH_TOKENS(TOKEN);
```

---

### 5.2 조직 도메인

#### `COLLEGES` — 단과대학

```sql
CREATE TABLE COLLEGES (
    ID         NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CODE       VARCHAR2(10)  NOT NULL,
    NAME       VARCHAR2(100) NOT NULL,
    CREATED_BY NUMBER(19),
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT TIMESTAMP WITH TIME ZONE,
    CONSTRAINT UK_COLLEGES_CODE UNIQUE (CODE)
);

COMMENT ON TABLE COLLEGES IS '단과대학';
```

---

#### `DEPARTMENTS` — 학과

```sql
CREATE TABLE DEPARTMENTS (
    ID                 NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    COLLEGE_ID         NUMBER(19)    NOT NULL,
    CODE               VARCHAR2(10)  NOT NULL,
    NAME               VARCHAR2(100) NOT NULL,
    HEAD_PROFESSOR_ID  NUMBER(19),           -- 학과장 (PROFESSOR)
    CREATED_BY         NUMBER(19),
    CREATED_AT         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT         TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_DEPT_COLLEGE    FOREIGN KEY (COLLEGE_ID)        REFERENCES COLLEGES(ID),
    CONSTRAINT FK_DEPT_HEAD_PROF  FOREIGN KEY (HEAD_PROFESSOR_ID) REFERENCES USERS(ID),
    CONSTRAINT UK_DEPT_CODE       UNIQUE (CODE)
);

CREATE INDEX IDX_DEPT_COLLEGE ON DEPARTMENTS(COLLEGE_ID);

COMMENT ON TABLE DEPARTMENTS IS '학과';
```

---

### 5.3 학생 도메인

#### `STUDENTS` — 학생 상세 정보

```sql
CREATE TABLE STUDENTS (
    ID              NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID         NUMBER(19)    NOT NULL,
    STUDENT_NUMBER  VARCHAR2(20)  NOT NULL,   -- 예: 20240001
    DEPARTMENT_ID   NUMBER(19)    NOT NULL,
    GRADE           NUMBER(1,0)   NOT NULL,   -- 학년 1~4
    SEMESTER        NUMBER(1,0)   NOT NULL,   -- 학기 1~2
    ADMISSION_YEAR  NUMBER(4,0)   NOT NULL,
    STATUS          VARCHAR2(20)  DEFAULT 'ENROLLED' NOT NULL,
    -- ENROLLED(재학) | LEAVE(휴학) | GRADUATED(졸업) | EXPELLED(제적)
    ADDRESS         VARCHAR2(500),
    BIRTH_DATE      DATE,
    CREATED_BY      NUMBER(19),
    CREATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT      TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_STU_USER   FOREIGN KEY (USER_ID)       REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_STU_DEPT   FOREIGN KEY (DEPARTMENT_ID) REFERENCES DEPARTMENTS(ID),
    CONSTRAINT UK_STU_USER   UNIQUE (USER_ID),
    CONSTRAINT UK_STU_NUMBER UNIQUE (STUDENT_NUMBER),
    CONSTRAINT CHK_STU_GRADE    CHECK (GRADE    BETWEEN 1 AND 4),
    CONSTRAINT CHK_STU_SEMESTER CHECK (SEMESTER BETWEEN 1 AND 2),
    CONSTRAINT CHK_STU_STATUS   CHECK (
        STATUS IN ('ENROLLED','LEAVE','GRADUATED','EXPELLED')
    )
);

CREATE INDEX IDX_STU_DEPT   ON STUDENTS(DEPARTMENT_ID);
CREATE INDEX IDX_STU_STATUS ON STUDENTS(STATUS);

COMMENT ON TABLE  STUDENTS IS '학생 상세 정보 (USERS 1:1)';
COMMENT ON COLUMN STUDENTS.STATUS IS 'ENROLLED=재학, LEAVE=휴학, GRADUATED=졸업, EXPELLED=제적';
```

---

### 5.4 교수 도메인

#### `PROFESSORS` — 교수 상세 정보

```sql
CREATE TABLE PROFESSORS (
    ID                NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID           NUMBER(19)    NOT NULL,
    PROFESSOR_NUMBER  VARCHAR2(20)  NOT NULL,   -- 예: P20240001
    DEPARTMENT_ID     NUMBER(19)    NOT NULL,
    POSITION          VARCHAR2(50),             -- 교수/부교수/조교수/강사
    RESEARCH_FIELD    VARCHAR2(200),
    OFFICE_LOCATION   VARCHAR2(100),
    OFFICE_PHONE      VARCHAR2(20),
    STATUS            VARCHAR2(20)  DEFAULT 'ACTIVE' NOT NULL,
    -- ACTIVE(재직) | LEAVE(휴직) | RETIRED(퇴직)
    HIRE_DATE         DATE,
    CREATED_BY        NUMBER(19),
    CREATED_AT        TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT        TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT        TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_PROF_USER  FOREIGN KEY (USER_ID)       REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_PROF_DEPT  FOREIGN KEY (DEPARTMENT_ID) REFERENCES DEPARTMENTS(ID),
    CONSTRAINT UK_PROF_USER  UNIQUE (USER_ID),
    CONSTRAINT UK_PROF_NUM   UNIQUE (PROFESSOR_NUMBER),
    CONSTRAINT CHK_PROF_STATUS CHECK (STATUS IN ('ACTIVE','LEAVE','RETIRED'))
);

CREATE INDEX IDX_PROF_DEPT ON PROFESSORS(DEPARTMENT_ID);

COMMENT ON TABLE PROFESSORS IS '교수 상세 정보 (USERS 1:1)';
```

---

### 5.5 교직원 도메인 ★ 신규

#### 도메인 구조 개요

```
USERS (role='STAFF')
    └── 1:1 STAFF_MEMBERS        -- 교직원 인사 기본 정보
              │
              └── 1:N STAFF_JOBS -- 담당 직무 (복수 직무 가능)
                        │
                        ├──> JOB_POSITIONS     -- 직위 코드 (교학처장/팀장/담당 등)
                        └──> DEPARTMENTS (선택) -- 배속 학과 (학과 소속일 때)

STAFF_DEPARTMENTS   -- 교직원 ↔ 부서 N:M (발령 이력 포함)
ADMINISTRATIVE_OFFICES -- 행정 부서 (교학처/총무처/도서관 등)
```

---

#### `ADMINISTRATIVE_OFFICES` — 행정 부서 (처/팀 단위)

```sql
CREATE TABLE ADMINISTRATIVE_OFFICES (
    ID          NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CODE        VARCHAR2(20)  NOT NULL,    -- 예: ACADEMIC, GENERAL, LIBRARY
    NAME        VARCHAR2(100) NOT NULL,   -- 예: 교학처, 총무처, 도서관
    PARENT_ID   NUMBER(19),               -- 상위 부서 (NULL=최상위)
    OFFICE_TYPE VARCHAR2(30)  NOT NULL,
    -- DEPARTMENT_OFFICE(교학처) | GENERAL(총무처) | LIBRARY(도서관)
    -- STUDENT_AFFAIRS(학생처) | RESEARCH(연구처) | IT(전산실) | ETC
    LOCATION    VARCHAR2(200),
    PHONE       VARCHAR2(30),
    CREATED_BY  NUMBER(19),
    CREATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT  TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_OFFICE_PARENT FOREIGN KEY (PARENT_ID) REFERENCES ADMINISTRATIVE_OFFICES(ID),
    CONSTRAINT UK_OFFICE_CODE   UNIQUE (CODE),
    CONSTRAINT CHK_OFFICE_TYPE  CHECK (
        OFFICE_TYPE IN (
            'ACADEMIC','GENERAL','LIBRARY','STUDENT_AFFAIRS',
            'RESEARCH','IT','FINANCE','PLANNING','ETC'
        )
    )
);

CREATE INDEX IDX_OFFICE_PARENT ON ADMINISTRATIVE_OFFICES(PARENT_ID);

COMMENT ON TABLE  ADMINISTRATIVE_OFFICES IS '행정 부서 (처/팀 단위)';
COMMENT ON COLUMN ADMINISTRATIVE_OFFICES.OFFICE_TYPE IS
    'ACADEMIC=교학처, GENERAL=총무처, IT=전산실, LIBRARY=도서관 등';
```

---

#### `JOB_POSITIONS` — 직위 코드 테이블

```sql
CREATE TABLE JOB_POSITIONS (
    ID          NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CODE        VARCHAR2(30)  NOT NULL,    -- 예: DIRECTOR, TEAM_LEAD, OFFICER
    NAME        VARCHAR2(100) NOT NULL,   -- 예: 처장, 팀장, 담당자
    GRADE_LEVEL NUMBER(2,0),              -- 직급 레벨 (1=최고 ~ 9=최하)
    IS_ACTIVE   NUMBER(1,0)   DEFAULT 1 NOT NULL CHECK (IS_ACTIVE IN (0,1)),
    CREATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT UK_JOB_CODE UNIQUE (CODE)
);

COMMENT ON TABLE  JOB_POSITIONS IS '직위 코드 (처장/팀장/담당 등)';
COMMENT ON COLUMN JOB_POSITIONS.GRADE_LEVEL IS '1=처장급, 3=팀장급, 5=주임급, 7=담당자급';

-- 기본 직위 데이터
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('DIRECTOR',    '처장',   1);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('DEPUTY_DIR',  '부처장', 2);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('TEAM_LEAD',   '팀장',   3);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('DEPUTY_LEAD', '부팀장', 4);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('SENIOR',      '주임',   5);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('OFFICER',     '담당자', 7);
INSERT INTO JOB_POSITIONS (CODE, NAME, GRADE_LEVEL) VALUES ('INTERN',      '인턴',   9);
COMMIT;
```

---

#### `STAFF_MEMBERS` — 교직원 상세 정보 (USERS 1:1)

```sql
CREATE TABLE STAFF_MEMBERS (
    ID              NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID         NUMBER(19)    NOT NULL,
    STAFF_NUMBER    VARCHAR2(20)  NOT NULL,    -- 사번 예: S20240001
    OFFICE_ID       NUMBER(19)    NOT NULL,    -- 주 소속 행정 부서
    EMPLOYMENT_TYPE VARCHAR2(20)  DEFAULT 'FULL_TIME' NOT NULL,
    -- FULL_TIME(정규직) | PART_TIME(계약직) | INTERN(인턴)
    STATUS          VARCHAR2(20)  DEFAULT 'ACTIVE' NOT NULL,
    -- ACTIVE(재직) | LEAVE(휴직) | RETIRED(퇴직) | RESIGNED(의원면직)
    HIRE_DATE       DATE          NOT NULL,
    RETIRE_DATE     DATE,
    OFFICE_PHONE    VARCHAR2(30),
    OFFICE_LOCATION VARCHAR2(200),
    BIRTH_DATE      DATE,
    ADDRESS         VARCHAR2(500),
    EMERGENCY_CONTACT VARCHAR2(100),
    CREATED_BY      NUMBER(19),
    CREATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT      TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_SM_USER   FOREIGN KEY (USER_ID)  REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SM_OFFICE FOREIGN KEY (OFFICE_ID) REFERENCES ADMINISTRATIVE_OFFICES(ID),
    CONSTRAINT UK_SM_USER   UNIQUE (USER_ID),
    CONSTRAINT UK_SM_NUMBER UNIQUE (STAFF_NUMBER),
    CONSTRAINT CHK_SM_EMP_TYPE CHECK (
        EMPLOYMENT_TYPE IN ('FULL_TIME','PART_TIME','INTERN')
    ),
    CONSTRAINT CHK_SM_STATUS CHECK (
        STATUS IN ('ACTIVE','LEAVE','RETIRED','RESIGNED')
    )
);

CREATE INDEX IDX_SM_OFFICE ON STAFF_MEMBERS(OFFICE_ID);
CREATE INDEX IDX_SM_STATUS ON STAFF_MEMBERS(STATUS);

COMMENT ON TABLE  STAFF_MEMBERS IS '교직원 상세 정보 (USERS 1:1)';
COMMENT ON COLUMN STAFF_MEMBERS.EMPLOYMENT_TYPE IS 'FULL_TIME=정규직, PART_TIME=계약직, INTERN=인턴';
COMMENT ON COLUMN STAFF_MEMBERS.STATUS IS 'ACTIVE=재직, LEAVE=휴직, RETIRED=퇴직, RESIGNED=의원면직';
```

---

#### `STAFF_JOBS` — 교직원 직무 (담당 업무, 1인 복수 가능)

```sql
CREATE TABLE STAFF_JOBS (
    ID              NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STAFF_MEMBER_ID NUMBER(19)    NOT NULL,
    OFFICE_ID       NUMBER(19)    NOT NULL,    -- 해당 직무가 속한 행정 부서
    POSITION_ID     NUMBER(19)    NOT NULL,    -- 직위 (JOB_POSITIONS FK)
    DEPARTMENT_ID   NUMBER(19),               -- 학과 배속일 경우 (교학처 소속 직원이 특정 학과 담당)
    JOB_TITLE       VARCHAR2(200) NOT NULL,   -- 직무명 예: '컴퓨터공학과 학사 담당', '전산실 시스템 관리'
    JOB_CATEGORY    VARCHAR2(30)  NOT NULL,
    -- ACADEMIC(학사) | HR(인사) | FINANCE(재무) | IT(전산) | LIBRARY(도서)
    -- STUDENT_SUPPORT(학생지원) | RESEARCH_ADMIN(연구행정) | FACILITY(시설) | ETC
    IS_PRIMARY      NUMBER(1,0)   DEFAULT 1 NOT NULL CHECK (IS_PRIMARY IN (0,1)),
    -- 1=주 직무, 0=겸직
    START_DATE      DATE          NOT NULL,
    END_DATE        DATE,                      -- NULL=현재 수행 중
    DESCRIPTION     VARCHAR2(1000),
    CREATED_BY      NUMBER(19),
    CREATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_SJ_STAFF    FOREIGN KEY (STAFF_MEMBER_ID) REFERENCES STAFF_MEMBERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SJ_OFFICE   FOREIGN KEY (OFFICE_ID)       REFERENCES ADMINISTRATIVE_OFFICES(ID),
    CONSTRAINT FK_SJ_POSITION FOREIGN KEY (POSITION_ID)     REFERENCES JOB_POSITIONS(ID),
    CONSTRAINT FK_SJ_DEPT     FOREIGN KEY (DEPARTMENT_ID)   REFERENCES DEPARTMENTS(ID),
    CONSTRAINT CHK_SJ_CATEGORY CHECK (
        JOB_CATEGORY IN (
            'ACADEMIC','HR','FINANCE','IT','LIBRARY',
            'STUDENT_SUPPORT','RESEARCH_ADMIN','FACILITY','ETC'
        )
    )
);

CREATE INDEX IDX_SJ_STAFF    ON STAFF_JOBS(STAFF_MEMBER_ID);
CREATE INDEX IDX_SJ_OFFICE   ON STAFF_JOBS(OFFICE_ID);
CREATE INDEX IDX_SJ_DEPT     ON STAFF_JOBS(DEPARTMENT_ID);
CREATE INDEX IDX_SJ_ACTIVE   ON STAFF_JOBS(STAFF_MEMBER_ID, END_DATE);

COMMENT ON TABLE  STAFF_JOBS IS '교직원 직무 (1인 복수 직무·겸직 지원)';
COMMENT ON COLUMN STAFF_JOBS.IS_PRIMARY IS '1=주 직무, 0=겸직';
COMMENT ON COLUMN STAFF_JOBS.END_DATE   IS 'NULL이면 현재 수행 중인 직무';
COMMENT ON COLUMN STAFF_JOBS.JOB_CATEGORY IS
    'ACADEMIC=학사, HR=인사, FINANCE=재무, IT=전산, LIBRARY=도서관 등';
```

---

#### `STAFF_ASSIGNMENT_HISTORY` — 교직원 발령 이력

```sql
CREATE TABLE STAFF_ASSIGNMENT_HISTORY (
    ID              NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STAFF_MEMBER_ID NUMBER(19)    NOT NULL,
    FROM_OFFICE_ID  NUMBER(19),               -- 이전 부서 (첫 발령 시 NULL)
    TO_OFFICE_ID    NUMBER(19)    NOT NULL,   -- 발령 부서
    FROM_POSITION_ID NUMBER(19),              -- 이전 직위
    TO_POSITION_ID  NUMBER(19)    NOT NULL,   -- 발령 직위
    ASSIGNMENT_TYPE VARCHAR2(30)  NOT NULL,
    -- HIRE(신규채용) | TRANSFER(전보) | PROMOTION(승진) | DEMOTION(강등)
    -- DISPATCH(파견) | RETURN(복귀) | RETIRE(퇴직) | RESIGN(의원면직)
    EFFECTIVE_DATE  DATE          NOT NULL,
    REASON          VARCHAR2(500),
    PROCESSED_BY    NUMBER(19),               -- 처리자 (ADMIN/STAFF)
    CREATED_AT      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_SAH_STAFF       FOREIGN KEY (STAFF_MEMBER_ID)  REFERENCES STAFF_MEMBERS(ID),
    CONSTRAINT FK_SAH_FROM_OFFICE FOREIGN KEY (FROM_OFFICE_ID)   REFERENCES ADMINISTRATIVE_OFFICES(ID),
    CONSTRAINT FK_SAH_TO_OFFICE   FOREIGN KEY (TO_OFFICE_ID)     REFERENCES ADMINISTRATIVE_OFFICES(ID),
    CONSTRAINT FK_SAH_FROM_POS    FOREIGN KEY (FROM_POSITION_ID) REFERENCES JOB_POSITIONS(ID),
    CONSTRAINT FK_SAH_TO_POS      FOREIGN KEY (TO_POSITION_ID)   REFERENCES JOB_POSITIONS(ID),
    CONSTRAINT FK_SAH_PROCESSED   FOREIGN KEY (PROCESSED_BY)     REFERENCES USERS(ID),
    CONSTRAINT CHK_SAH_TYPE CHECK (
        ASSIGNMENT_TYPE IN (
            'HIRE','TRANSFER','PROMOTION','DEMOTION',
            'DISPATCH','RETURN','RETIRE','RESIGN'
        )
    )
);

CREATE INDEX IDX_SAH_STAFF ON STAFF_ASSIGNMENT_HISTORY(STAFF_MEMBER_ID);
CREATE INDEX IDX_SAH_DATE  ON STAFF_ASSIGNMENT_HISTORY(EFFECTIVE_DATE);

COMMENT ON TABLE STAFF_ASSIGNMENT_HISTORY IS '교직원 발령 이력 (전보/승진/퇴직 등)';
```

---

### 5.6 강의 도메인

#### `COURSES` — 강의(교과목)

```sql
CREATE TABLE COURSES (
    ID                 NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    COURSE_CODE        VARCHAR2(20)  NOT NULL,
    NAME               VARCHAR2(200) NOT NULL,
    DEPARTMENT_ID      NUMBER(19)    NOT NULL,
    PROFESSOR_ID       NUMBER(19)    NOT NULL,
    CREDIT             NUMBER(1,0)   NOT NULL,
    YEAR               NUMBER(4,0)   NOT NULL,
    SEMESTER           NUMBER(1,0)   NOT NULL,
    MAX_ENROLLMENT     NUMBER(5,0)   DEFAULT 30 NOT NULL,
    CURRENT_ENROLLMENT NUMBER(5,0)   DEFAULT 0  NOT NULL,
    VERSION_NO         NUMBER(10,0)  DEFAULT 0  NOT NULL, -- 낙관적 락용
    CLASSROOM          VARCHAR2(100),
    COURSE_TYPE        VARCHAR2(30)  DEFAULT 'MAJOR' NOT NULL,
    -- MAJOR(전공필수) | MAJOR_ELECTIVE(전공선택) | GENERAL(교양) | GENERAL_REQUIRED(교양필수)
    DESCRIPTION        CLOB,
    STATUS             VARCHAR2(20)  DEFAULT 'OPEN' NOT NULL,
    -- OPEN(개설) | CLOSED(폐강) | ENDED(종강)
    CREATED_BY         NUMBER(19),
    CREATED_AT         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT         TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_CRS_DEPT  FOREIGN KEY (DEPARTMENT_ID) REFERENCES DEPARTMENTS(ID),
    CONSTRAINT FK_CRS_PROF  FOREIGN KEY (PROFESSOR_ID)  REFERENCES PROFESSORS(ID),
    CONSTRAINT UK_CRS_CODE  UNIQUE (COURSE_CODE),
    CONSTRAINT CHK_CRS_CREDIT   CHECK (CREDIT BETWEEN 1 AND 6),
    CONSTRAINT CHK_CRS_SEMESTER CHECK (SEMESTER IN (1, 2)),
    CONSTRAINT CHK_CRS_ENROLL   CHECK (CURRENT_ENROLLMENT <= MAX_ENROLLMENT),
    CONSTRAINT CHK_CRS_TYPE CHECK (
        COURSE_TYPE IN ('MAJOR','MAJOR_ELECTIVE','GENERAL','GENERAL_REQUIRED')
    ),
    CONSTRAINT CHK_CRS_STATUS CHECK (STATUS IN ('OPEN','CLOSED','ENDED'))
);

CREATE INDEX IDX_CRS_DEPT     ON COURSES(DEPARTMENT_ID);
CREATE INDEX IDX_CRS_PROF     ON COURSES(PROFESSOR_ID);
CREATE INDEX IDX_CRS_YEAR_SEM ON COURSES(YEAR, SEMESTER);

COMMENT ON COLUMN COURSES.VERSION_NO IS '낙관적 락 (@Version) 용 버전 컬럼';
```

---

#### `COURSE_SCHEDULES` — 강의 시간표

```sql
CREATE TABLE COURSE_SCHEDULES (
    ID           NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    COURSE_ID    NUMBER(19)   NOT NULL,
    DAY_OF_WEEK  NUMBER(1,0)  NOT NULL,   -- 1=월 ~ 6=토
    PERIOD_START NUMBER(2,0)  NOT NULL,   -- 시작 교시
    PERIOD_END   NUMBER(2,0)  NOT NULL,   -- 종료 교시
    CLASSROOM    VARCHAR2(100),
    CONSTRAINT FK_CS_COURSE     FOREIGN KEY (COURSE_ID) REFERENCES COURSES(ID) ON DELETE CASCADE,
    CONSTRAINT CHK_CS_DAY       CHECK (DAY_OF_WEEK  BETWEEN 1 AND 6),
    CONSTRAINT CHK_CS_PERIOD_S  CHECK (PERIOD_START BETWEEN 1 AND 15),
    CONSTRAINT CHK_CS_PERIOD_E  CHECK (PERIOD_END   BETWEEN 1 AND 15),
    CONSTRAINT CHK_CS_PERIOD    CHECK (PERIOD_START <= PERIOD_END)
);

CREATE INDEX IDX_CS_COURSE ON COURSE_SCHEDULES(COURSE_ID);
```

---

### 5.7 수강신청 도메인

#### `ENROLLMENTS` — 수강신청

```sql
CREATE TABLE ENROLLMENTS (
    ID           NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STUDENT_ID   NUMBER(19)   NOT NULL,
    COURSE_ID    NUMBER(19)   NOT NULL,
    YEAR         NUMBER(4,0)  NOT NULL,
    SEMESTER     NUMBER(1,0)  NOT NULL,
    STATUS       VARCHAR2(20) DEFAULT 'ENROLLED' NOT NULL,
    -- ENROLLED(수강중) | WITHDRAWN(취소) | COMPLETED(수료)
    ENROLLED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    WITHDRAWN_AT TIMESTAMP WITH TIME ZONE,
    CREATED_BY   NUMBER(19),
    CREATED_AT   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_ENR_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS(ID),
    CONSTRAINT FK_ENR_COURSE  FOREIGN KEY (COURSE_ID)  REFERENCES COURSES(ID),
    CONSTRAINT UK_ENR_UNIQUE  UNIQUE (STUDENT_ID, COURSE_ID, YEAR, SEMESTER),
    CONSTRAINT CHK_ENR_SEM    CHECK (SEMESTER IN (1, 2)),
    CONSTRAINT CHK_ENR_STATUS CHECK (STATUS IN ('ENROLLED','WITHDRAWN','COMPLETED'))
);

CREATE INDEX IDX_ENR_STUDENT ON ENROLLMENTS(STUDENT_ID);
CREATE INDEX IDX_ENR_COURSE  ON ENROLLMENTS(COURSE_ID);
```

---

### 5.8 성적 도메인

#### `GRADES` — 성적

```sql
CREATE TABLE GRADES (
    ID            NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ENROLLMENT_ID NUMBER(19)    NOT NULL,
    LETTER_GRADE  VARCHAR2(5),              -- A+, A, B+, B, C+, C, D+, D, F, P, NP
    SCORE         NUMBER(5,2),             -- 원점수
    GRADE_POINTS  NUMBER(3,2),             -- 환산 평점 (4.5~0.0)
    IS_PASS_FAIL  NUMBER(1,0)  DEFAULT 0 NOT NULL CHECK (IS_PASS_FAIL IN (0,1)),
    STATUS        VARCHAR2(20) DEFAULT 'TEMP' NOT NULL,
    -- TEMP(임시) | SUBMITTED(제출) | CONFIRMED(확정)
    SUBMITTED_AT  TIMESTAMP WITH TIME ZONE,
    CONFIRMED_AT  TIMESTAMP WITH TIME ZONE,
    CONFIRMED_BY  NUMBER(19),              -- 확정 처리자 (STAFF)
    REMARK        VARCHAR2(1000),
    CREATED_BY    NUMBER(19),
    CREATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_GRD_ENROLLMENT  FOREIGN KEY (ENROLLMENT_ID) REFERENCES ENROLLMENTS(ID),
    CONSTRAINT FK_GRD_CONFIRMED   FOREIGN KEY (CONFIRMED_BY)  REFERENCES USERS(ID),
    CONSTRAINT UK_GRD_ENROLLMENT  UNIQUE (ENROLLMENT_ID),
    CONSTRAINT CHK_GRD_LETTER CHECK (
        LETTER_GRADE IN ('A+','A','B+','B','C+','C','D+','D','F','P','NP')
    ),
    CONSTRAINT CHK_GRD_POINTS CHECK (GRADE_POINTS BETWEEN 0.0 AND 4.5),
    CONSTRAINT CHK_GRD_STATUS CHECK (STATUS IN ('TEMP','SUBMITTED','CONFIRMED'))
);

CREATE INDEX IDX_GRD_ENROLLMENT ON GRADES(ENROLLMENT_ID);
CREATE INDEX IDX_GRD_STATUS     ON GRADES(STATUS);
```

---

### 5.9 공지사항 도메인

#### `NOTICES` — 공지사항

```sql
CREATE TABLE NOTICES (
    ID            NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TITLE         VARCHAR2(500) NOT NULL,
    CONTENT       CLOB          NOT NULL,
    CATEGORY      VARCHAR2(30)  DEFAULT 'GENERAL' NOT NULL,
    -- ACADEMIC(학사) | DEPARTMENT(학과) | COURSE(강의) | GENERAL(일반)
    AUTHOR_ID     NUMBER(19)    NOT NULL,
    DEPARTMENT_ID NUMBER(19),              -- NULL=전체 공지
    COURSE_ID     NUMBER(19),             -- 강의 공지
    IS_PINNED     NUMBER(1,0)  DEFAULT 0 NOT NULL CHECK (IS_PINNED IN (0,1)),
    VIEW_COUNT    NUMBER(10,0) DEFAULT 0  NOT NULL,
    CREATED_BY    NUMBER(19),
    CREATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_NTC_AUTHOR FOREIGN KEY (AUTHOR_ID)     REFERENCES USERS(ID),
    CONSTRAINT FK_NTC_DEPT   FOREIGN KEY (DEPARTMENT_ID) REFERENCES DEPARTMENTS(ID),
    CONSTRAINT FK_NTC_COURSE FOREIGN KEY (COURSE_ID)     REFERENCES COURSES(ID),
    CONSTRAINT CHK_NTC_CATEGORY CHECK (
        CATEGORY IN ('ACADEMIC','DEPARTMENT','COURSE','GENERAL')
    )
);

CREATE INDEX IDX_NTC_AUTHOR   ON NOTICES(AUTHOR_ID);
CREATE INDEX IDX_NTC_CATEGORY ON NOTICES(CATEGORY);
CREATE INDEX IDX_NTC_PINNED   ON NOTICES(IS_PINNED, CREATED_AT DESC);
```

---

#### `NOTICE_ATTACHMENTS` — 공지 첨부파일

```sql
CREATE TABLE NOTICE_ATTACHMENTS (
    ID         NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NOTICE_ID  NUMBER(19)    NOT NULL,
    FILE_NAME  VARCHAR2(255) NOT NULL,
    FILE_PATH  VARCHAR2(1000) NOT NULL,
    FILE_SIZE  NUMBER(15,0)  NOT NULL,
    MIME_TYPE  VARCHAR2(100),
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_NA_NOTICE FOREIGN KEY (NOTICE_ID) REFERENCES NOTICES(ID) ON DELETE CASCADE
);

CREATE INDEX IDX_NA_NOTICE ON NOTICE_ATTACHMENTS(NOTICE_ID);
```

---

### 5.10 전자결재 도메인

#### `APPROVAL_TEMPLATES` — 결재 양식

```sql
CREATE TABLE APPROVAL_TEMPLATES (
    ID            NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CODE          VARCHAR2(50)  NOT NULL,
    NAME          VARCHAR2(200) NOT NULL,
    DESCRIPTION   VARCHAR2(1000),
    FIELDS_SCHEMA CLOB CHECK (FIELDS_SCHEMA IS JSON),  -- JSON 스키마
    IS_ACTIVE     NUMBER(1,0)  DEFAULT 1 NOT NULL CHECK (IS_ACTIVE IN (0,1)),
    CREATED_BY    NUMBER(19),
    CREATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT UK_AT_CODE UNIQUE (CODE)
);
```

---

#### `APPROVAL_DOCUMENTS` — 결재 문서

```sql
CREATE TABLE APPROVAL_DOCUMENTS (
    ID           NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TEMPLATE_ID  NUMBER(19)    NOT NULL,
    TITLE        VARCHAR2(500) NOT NULL,
    DRAFTER_ID   NUMBER(19)    NOT NULL,
    CONTENT      CLOB          NOT NULL,
    FORM_DATA    CLOB CHECK (FORM_DATA IS JSON),
    STATUS       VARCHAR2(20)  DEFAULT 'DRAFT' NOT NULL,
    -- DRAFT | IN_PROGRESS | APPROVED | REJECTED
    CURRENT_STEP NUMBER(3,0)   DEFAULT 1 NOT NULL,
    SUBMITTED_AT TIMESTAMP WITH TIME ZONE,
    COMPLETED_AT TIMESTAMP WITH TIME ZONE,
    CREATED_BY   NUMBER(19),
    CREATED_AT   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    DELETED_AT   TIMESTAMP WITH TIME ZONE,
    CONSTRAINT FK_AD_TEMPLATE FOREIGN KEY (TEMPLATE_ID) REFERENCES APPROVAL_TEMPLATES(ID),
    CONSTRAINT FK_AD_DRAFTER  FOREIGN KEY (DRAFTER_ID)  REFERENCES USERS(ID),
    CONSTRAINT CHK_AD_STATUS  CHECK (STATUS IN ('DRAFT','IN_PROGRESS','APPROVED','REJECTED'))
);

CREATE INDEX IDX_AD_DRAFTER ON APPROVAL_DOCUMENTS(DRAFTER_ID);
CREATE INDEX IDX_AD_STATUS  ON APPROVAL_DOCUMENTS(STATUS);
```

---

#### `APPROVAL_LINES` — 결재 라인

```sql
CREATE TABLE APPROVAL_LINES (
    ID          NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DOCUMENT_ID NUMBER(19)    NOT NULL,
    STEP        NUMBER(3,0)   NOT NULL,
    APPROVER_ID NUMBER(19)    NOT NULL,
    ROLE_LABEL  VARCHAR2(100),           -- 예: 지도교수, 학과장, 교학처장
    ACTION      VARCHAR2(20),            -- APPROVED | REJECTED | NULL(대기)
    COMMENT     VARCHAR2(2000),
    ACTION_AT   TIMESTAMP WITH TIME ZONE,
    CREATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_AL_DOCUMENT FOREIGN KEY (DOCUMENT_ID) REFERENCES APPROVAL_DOCUMENTS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_AL_APPROVER FOREIGN KEY (APPROVER_ID) REFERENCES USERS(ID),
    CONSTRAINT UK_AL_STEP     UNIQUE (DOCUMENT_ID, STEP),
    CONSTRAINT CHK_AL_ACTION  CHECK (ACTION IN ('APPROVED','REJECTED') OR ACTION IS NULL)
);

CREATE INDEX IDX_AL_DOCUMENT ON APPROVAL_LINES(DOCUMENT_ID);
CREATE INDEX IDX_AL_APPROVER ON APPROVAL_LINES(APPROVER_ID);
```

---

#### `APPROVAL_NOTIFICATIONS` — 결재 알림

```sql
CREATE TABLE APPROVAL_NOTIFICATIONS (
    ID          NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID     NUMBER(19)    NOT NULL,
    DOCUMENT_ID NUMBER(19)    NOT NULL,
    MESSAGE     VARCHAR2(500) NOT NULL,
    IS_READ     NUMBER(1,0)  DEFAULT 0 NOT NULL CHECK (IS_READ IN (0,1)),
    CREATED_AT  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FK_AN_USER     FOREIGN KEY (USER_ID)     REFERENCES USERS(ID),
    CONSTRAINT FK_AN_DOCUMENT FOREIGN KEY (DOCUMENT_ID) REFERENCES APPROVAL_DOCUMENTS(ID)
);

CREATE INDEX IDX_AN_USER ON APPROVAL_NOTIFICATIONS(USER_ID, IS_READ);
```

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

★ = v2 신규 추가

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
