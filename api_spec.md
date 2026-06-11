# 대학교 학사 업무 시스템 (UAMS) — API 명세서 v1.0

> **AI 업무 배정 안내**
> - **백엔드 AI**: 이 문서 전체를 참고하여 Controller·Service·Repository 구현
> - **프론트엔드 AI**: `Request / Response` 스펙과 `에러 코드`를 참고하여 API 호출 코드 및 화면 구현
> - 공통 사항은 반드시 `PART 0. 공통 규약`을 먼저 숙지할 것

---

# PART 0. 공통 규약

## 기본 정보
| 항목 | 값 |
|------|-----|
| Base URL | `http://localhost:8080/api/v1` |
| 인증 방식 | JWT Bearer Token |
| 요청 헤더 | `Authorization: Bearer {accessToken}` |
| Content-Type | `application/json` |
| 문자셋 | UTF-8 |

## 표준 응답 래퍼
모든 API는 아래 형식으로 응답한다.

```json
{
  "success": true,
  "data": { },
  "message": "요청이 처리되었습니다.",
  "timestamp": "2024-09-01T12:00:00"
}
```

## 페이징 응답 (목록 조회)
```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false
  }
}
```
> 페이징 요청 파라미터: `?page=0&size=20&sort=createdAt,desc`

## 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "에러코드",
    "message": "에러 메시지"
  },
  "timestamp": "2024-09-01T12:00:00"
}
```

## 전체 에러 코드
| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | `INVALID_INPUT` | 유효성 검사 실패 |
| 401 | `UNAUTHORIZED` | 토큰 없음·만료 |
| 401 | `INVALID_TOKEN` | 토큰 위변조 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `DUPLICATE_USERNAME` | 중복 아이디 |
| 409 | `DUPLICATE_EMAIL` | 중복 이메일 |
| 409 | `ENROLLMENT_FULL` | 수강 정원 초과 |
| 409 | `SCHEDULE_CONFLICT` | 시간표 충돌 |
| 409 | `ALREADY_ENROLLED` | 이미 수강신청된 강의 |
| 409 | `GRADE_ALREADY_CONFIRMED` | 이미 확정된 성적 |
| 409 | `OPTIMISTIC_LOCK_FAIL` | 동시 요청 충돌 (재시도) |
| 423 | `ACCOUNT_LOCKED` | 계정 잠금 |
| 403 | `ENROLLMENT_PERIOD_CLOSED` | 수강신청 기간 아님 |
| 409 | `ALREADY_CHECKED_IN` | 이미 출석 체크인 완료 |
| 400 | `ATTENDANCE_SESSION_CLOSED` | 출결 세션 종료·만료됨 |
| 400 | `INVALID_ACCESS_CODE` | 출결 코드 불일치 |
| 403 | `NOT_ENROLLED` | 해당 강의 미수강 학생 |
| 409 | `SUBMISSION_ALREADY_EXISTS` | 이미 과제 제출 완료 |
| 400 | `ASSIGNMENT_CLOSED` | 마감된 과제 (지각 제출 불허) |
| 409 | `EXAM_ALREADY_REGISTERED` | 이미 시험 등록됨 |
| 409 | `EXAM_FULL` | 시험 정원 초과 |
| 409 | `COUNSELING_REQUEST_ALREADY_EXISTS` | 동일 건으로 이미 상담 신청됨 |

## Role 권한 표기 규칙
- `[ALL]` : 인증된 모든 사용자
- `[ADMIN]` : 시스템 관리자
- `[STAFF]` : 교직원
- `[PROFESSOR]` : 교수
- `[STUDENT]` : 학생
- `[ADMIN, STAFF]` : 해당 Role 중 하나면 가능

---

# PART 1. 인증 (Auth)

---

## POST /auth/login
**로그인**  `[PUBLIC]`

### Request
```json
{
  "username": "20240001",
  "password": "password123!"
}
```

### Response `200`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "20240001",
      "name": "홍길동",
      "role": "STUDENT",
      "email": "hong@university.ac.kr"
    }
  }
}
```

### Error
| 코드 | 조건 |
|------|------|
| `UNAUTHORIZED` | 아이디 또는 비밀번호 불일치 |
| `ACCOUNT_LOCKED` | 5회 실패로 잠긴 계정 |

---

## POST /auth/logout
**로그아웃** `[ALL]`

### Request
```json
{
  "refreshToken": "eyJhbGci..."
}
```

### Response `200`
```json
{ "success": true, "data": null, "message": "로그아웃되었습니다." }
```

---

## POST /auth/refresh
**Access Token 재발급** `[PUBLIC]`

### Request
```json
{
  "refreshToken": "eyJhbGci..."
}
```

### Response `200`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 3600
  }
}
```

---

## PUT /auth/password
**비밀번호 변경** `[ALL]`

### Request
```json
{
  "currentPassword": "oldPass123!",
  "newPassword": "newPass456!",
  "confirmPassword": "newPass456!"
}
```

### Response `200`
```json
{ "success": true, "data": null, "message": "비밀번호가 변경되었습니다." }
```

---

## GET /auth/me
**내 정보 조회** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "20240001",
    "name": "홍길동",
    "role": "STUDENT",
    "email": "hong@university.ac.kr",
    "phone": "010-1234-5678",
    "isActive": true
  }
}
```

---

# PART 2. 학생 관리 (Students)

---

## GET /students
**학생 목록 조회** `[ADMIN, STAFF, PROFESSOR]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `page` | int | 페이지 번호 (default: 0) |
| `size` | int | 페이지 크기 (default: 20) |
| `keyword` | string | 학번·이름 검색 |
| `departmentId` | long | 학과 필터 |
| `status` | string | ENROLLED·LEAVE·GRADUATED·EXPELLED |
| `grade` | int | 학년 (1~4) |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 10,
        "studentNumber": "20240001",
        "name": "홍길동",
        "email": "hong@university.ac.kr",
        "phone": "010-1234-5678",
        "departmentId": 1,
        "departmentName": "컴퓨터공학과",
        "grade": 1,
        "semester": 1,
        "admissionYear": 2024,
        "status": "ENROLLED"
      }
    ],
    "page": 0, "size": 20, "totalElements": 150, "totalPages": 8
  }
}
```

---

## POST /students
**학생 등록** `[ADMIN, STAFF]`

### Request
```json
{
  "name": "홍길동",
  "email": "hong@university.ac.kr",
  "phone": "010-1234-5678",
  "password": "tempPass123!",
  "departmentId": 1,
  "grade": 1,
  "semester": 1,
  "admissionYear": 2024,
  "birthDate": "2005-03-15",
  "address": "서울시 강남구"
}
```

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentNumber": "20240001",
    "name": "홍길동",
    "username": "20240001"
  },
  "message": "학생이 등록되었습니다."
}
```

---

## GET /students/{id}
**학생 상세 조회** `[ADMIN, STAFF, PROFESSOR]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 10,
    "studentNumber": "20240001",
    "name": "홍길동",
    "email": "hong@university.ac.kr",
    "phone": "010-1234-5678",
    "departmentId": 1,
    "departmentName": "컴퓨터공학과",
    "collegeName": "공과대학",
    "grade": 1,
    "semester": 1,
    "admissionYear": 2024,
    "status": "ENROLLED",
    "birthDate": "2005-03-15",
    "address": "서울시 강남구",
    "createdAt": "2024-03-01T09:00:00"
  }
}
```

---

## PUT /students/{id}
**학생 정보 수정** `[ADMIN, STAFF]`

### Request
```json
{
  "phone": "010-9999-8888",
  "address": "서울시 서초구",
  "departmentId": 1,
  "grade": 2,
  "semester": 1
}
```

### Response `200`
```json
{ "success": true, "data": { "id": 1 }, "message": "학생 정보가 수정되었습니다." }
```

---

## PATCH /students/{id}/status
**학생 상태 변경** `[ADMIN, STAFF]`

### Request
```json
{
  "status": "LEAVE",
  "reason": "군 입대"
}
```

### Response `200`
```json
{ "success": true, "data": null, "message": "상태가 변경되었습니다." }
```

---

## GET /students/me
**본인 정보 조회** `[STUDENT]`

> `/students/{id}` 와 동일한 응답 구조. 본인 정보만 반환.

---

## PUT /students/me
**본인 정보 수정** `[STUDENT]`

### Request
```json
{
  "phone": "010-1111-2222",
  "address": "경기도 수원시"
}
```

---

# PART 3. 교수 관리 (Professors)

---

## GET /professors
**교수 목록 조회** `[ADMIN, STAFF]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `keyword` | string | 교번·이름 검색 |
| `departmentId` | long | 학과 필터 |
| `status` | string | ACTIVE·LEAVE·RETIRED |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "professorNumber": "P20240001",
        "name": "김교수",
        "email": "prof@university.ac.kr",
        "departmentId": 1,
        "departmentName": "컴퓨터공학과",
        "position": "교수",
        "status": "ACTIVE"
      }
    ],
    "page": 0, "size": 20, "totalElements": 30, "totalPages": 2
  }
}
```

---

## POST /professors
**교수 등록** `[ADMIN, STAFF]`

### Request
```json
{
  "name": "김교수",
  "email": "prof@university.ac.kr",
  "phone": "010-2222-3333",
  "password": "tempPass123!",
  "departmentId": 1,
  "position": "조교수",
  "researchField": "인공지능",
  "officeLocation": "공학관 301호",
  "officePhone": "02-1234-5678",
  "hireDate": "2024-03-01"
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "professorNumber": "P20240001", "name": "김교수" }
}
```

---

## GET /professors/{id}
**교수 상세 조회** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "professorNumber": "P20240001",
    "name": "김교수",
    "email": "prof@university.ac.kr",
    "phone": "010-2222-3333",
    "departmentId": 1,
    "departmentName": "컴퓨터공학과",
    "position": "조교수",
    "researchField": "인공지능",
    "officeLocation": "공학관 301호",
    "officePhone": "02-1234-5678",
    "hireDate": "2024-03-01",
    "status": "ACTIVE"
  }
}
```

---

## PUT /professors/{id}
**교수 정보 수정** `[ADMIN, STAFF]`

---

## PATCH /professors/{id}/status
**교수 상태 변경** `[ADMIN, STAFF]`

### Request
```json
{ "status": "LEAVE", "reason": "연구년" }
```

---

## GET /professors/{id}/courses
**교수 담당 강의 목록** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `year` | int | 연도 |
| `semester` | int | 학기 (1·2) |

---

## GET /professors/me
**본인 정보 조회** `[PROFESSOR]`

## PUT /professors/me
**본인 정보 수정** `[PROFESSOR]`

---

# PART 4. 교직원 관리 (Staff)

---

## GET /staff
**교직원 목록 조회** `[ADMIN]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `keyword` | string | 사번·이름 검색 |
| `officeId` | long | 부서 필터 |
| `status` | string | ACTIVE·LEAVE·RETIRED·RESIGNED |
| `employmentType` | string | FULL_TIME·PART_TIME·INTERN |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "staffNumber": "S20240001",
        "name": "이직원",
        "email": "staff@university.ac.kr",
        "officeName": "교학처",
        "primaryJobTitle": "학사 담당",
        "positionName": "담당자",
        "employmentType": "FULL_TIME",
        "status": "ACTIVE"
      }
    ],
    "page": 0, "size": 20, "totalElements": 50, "totalPages": 3
  }
}
```

---

## POST /staff
**교직원 등록** `[ADMIN]`

### Request
```json
{
  "name": "이직원",
  "email": "staff@university.ac.kr",
  "phone": "010-3333-4444",
  "password": "tempPass123!",
  "officeId": 1,
  "employmentType": "FULL_TIME",
  "hireDate": "2024-03-01",
  "birthDate": "1990-05-20",
  "address": "서울시 마포구",
  "emergencyContact": "010-9999-0000"
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "staffNumber": "S20240001", "name": "이직원" }
}
```

---

## GET /staff/{id}
**교직원 상세 조회** `[ADMIN]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "staffNumber": "S20240001",
    "name": "이직원",
    "email": "staff@university.ac.kr",
    "phone": "010-3333-4444",
    "officeId": 1,
    "officeName": "교학처",
    "employmentType": "FULL_TIME",
    "status": "ACTIVE",
    "hireDate": "2024-03-01",
    "birthDate": "1990-05-20",
    "officePhone": "02-1234-0001",
    "officeLocation": "본관 201호",
    "jobs": [
      {
        "id": 1,
        "officeId": 1,
        "officeName": "교학처",
        "positionId": 7,
        "positionName": "담당자",
        "jobTitle": "컴퓨터공학과 학사 담당",
        "jobCategory": "ACADEMIC",
        "isPrimary": true,
        "startDate": "2024-03-01",
        "endDate": null
      }
    ]
  }
}
```

---

## PUT /staff/{id}
**교직원 정보 수정** `[ADMIN]`

---

## PATCH /staff/{id}/status
**교직원 상태 변경** `[ADMIN]`

### Request
```json
{ "status": "RETIRED", "reason": "정년퇴직", "effectiveDate": "2024-08-31" }
```

---

## POST /staff/{id}/jobs
**직무 추가 (겸직 포함)** `[ADMIN]`

### Request
```json
{
  "officeId": 2,
  "positionId": 7,
  "departmentId": 1,
  "jobTitle": "컴퓨터공학과 학사 담당",
  "jobCategory": "ACADEMIC",
  "isPrimary": true,
  "startDate": "2024-03-01",
  "description": "학사 관련 업무 전반"
}
```

### Response `201`
```json
{ "success": true, "data": { "jobId": 1 }, "message": "직무가 등록되었습니다." }
```

---

## PUT /staff/{id}/jobs/{jobId}
**직무 수정** `[ADMIN]`

## DELETE /staff/{id}/jobs/{jobId}
**직무 종료 (endDate 설정)** `[ADMIN]`

### Request
```json
{ "endDate": "2024-08-31" }
```

---

## POST /staff/{id}/assignments
**발령 처리** `[ADMIN]`

### Request
```json
{
  "toOfficeId": 3,
  "toPositionId": 3,
  "assignmentType": "TRANSFER",
  "effectiveDate": "2024-09-01",
  "reason": "전산실 전보"
}
```

### Response `201`
```json
{ "success": true, "data": { "historyId": 5 }, "message": "발령 처리되었습니다." }
```

---

## GET /staff/{id}/assignments
**발령 이력 조회** `[ADMIN]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "fromOfficeName": "교학처",
      "toOfficeName": "전산실",
      "fromPositionName": "담당자",
      "toPositionName": "담당자",
      "assignmentType": "TRANSFER",
      "effectiveDate": "2024-09-01",
      "reason": "전산실 전보",
      "processedByName": "관리자"
    }
  ]
}
```

---

# PART 5. 행정 부서 관리 (Offices)

---

## GET /offices
**행정 부서 목록** `[ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ACADEMIC",
      "name": "교학처",
      "officeType": "ACADEMIC",
      "parentId": null,
      "parentName": null,
      "phone": "02-1234-5001",
      "location": "본관 2층",
      "children": [
        { "id": 5, "name": "학사팀", "officeType": "ACADEMIC" }
      ]
    }
  ]
}
```

---

## POST /offices
**행정 부서 등록** `[ADMIN]`

### Request
```json
{
  "code": "IT",
  "name": "전산실",
  "officeType": "IT",
  "parentId": null,
  "phone": "02-1234-9000",
  "location": "공학관 지하 1층"
}
```

## PUT /offices/{id}
**행정 부서 수정** `[ADMIN]`

## DELETE /offices/{id}
**행정 부서 삭제** `[ADMIN]`

---

## GET /job-positions
**직위 코드 목록** `[ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "DIRECTOR", "name": "처장", "gradeLevel": 1 },
    { "id": 3, "code": "TEAM_LEAD", "name": "팀장", "gradeLevel": 3 },
    { "id": 7, "code": "OFFICER", "name": "담당자", "gradeLevel": 7 }
  ]
}
```

---

# PART 6. 학과 관리 (Departments)

---

## GET /colleges
**단과대학 목록** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "ENG", "name": "공과대학" },
    { "id": 2, "code": "BUS", "name": "경영대학" }
  ]
}
```

## POST /colleges
**단과대학 등록** `[ADMIN, STAFF]`

### Request
```json
{ "code": "ENG", "name": "공과대학" }
```

## PUT /colleges/{id}
**단과대학 수정** `[ADMIN, STAFF]`

## DELETE /colleges/{id}
**단과대학 삭제** `[ADMIN, STAFF]`

---

## GET /departments
**학과 목록** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `collegeId` | long | 단과대학 필터 |

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CS",
      "name": "컴퓨터공학과",
      "collegeId": 1,
      "collegeName": "공과대학",
      "headProfessorName": "김교수",
      "studentCount": 120,
      "professorCount": 8
    }
  ]
}
```

---

## POST /departments
**학과 등록** `[ADMIN, STAFF]`

### Request
```json
{
  "collegeId": 1,
  "code": "CS",
  "name": "컴퓨터공학과",
  "headProfessorId": 1
}
```

## PUT /departments/{id}
**학과 수정** `[ADMIN, STAFF]`

## DELETE /departments/{id}
**학과 삭제** `[ADMIN, STAFF]`

## GET /departments/{id}
**학과 상세 조회** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CS",
    "name": "컴퓨터공학과",
    "collegeId": 1,
    "collegeName": "공과대학",
    "headProfessorId": 1,
    "headProfessorName": "김교수",
    "studentCount": 120,
    "professorCount": 8
  }
}
```

---

# PART 7. 강의 관리 (Courses)

---

## GET /courses
**강의 목록** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `year` | int | 개설 연도 |
| `semester` | int | 학기 (1·2) |
| `departmentId` | long | 학과 필터 |
| `professorId` | long | 교수 필터 |
| `courseType` | string | MAJOR·MAJOR_ELECTIVE·GENERAL·GENERAL_REQUIRED |
| `keyword` | string | 강의명·학수번호 검색 |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "courseCode": "CS20240001",
        "name": "자료구조",
        "departmentName": "컴퓨터공학과",
        "professorName": "김교수",
        "credit": 3,
        "year": 2024,
        "semester": 1,
        "maxEnrollment": 30,
        "currentEnrollment": 25,
        "classroom": "공학관 201",
        "courseType": "MAJOR",
        "status": "OPEN",
        "schedules": [
          { "dayOfWeek": 1, "periodStart": 1, "periodEnd": 3, "classroom": "공학관 201" }
        ]
      }
    ],
    "page": 0, "size": 20, "totalElements": 80, "totalPages": 4
  }
}
```

---

## POST /courses
**강의 개설** `[ADMIN, STAFF]`

### Request
```json
{
  "name": "자료구조",
  "departmentId": 1,
  "professorId": 1,
  "credit": 3,
  "year": 2024,
  "semester": 1,
  "maxEnrollment": 30,
  "classroom": "공학관 201",
  "courseType": "MAJOR",
  "description": "기본 자료구조 학습",
  "schedules": [
    { "dayOfWeek": 1, "periodStart": 1, "periodEnd": 3, "classroom": "공학관 201" },
    { "dayOfWeek": 3, "periodStart": 1, "periodEnd": 3, "classroom": "공학관 201" }
  ]
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "courseCode": "CS20240001", "name": "자료구조" }
}
```

### Error
| 코드 | 조건 |
|------|------|
| `SCHEDULE_CONFLICT` | 교수 시간표 충돌 |

---

## GET /courses/{id}
**강의 상세** `[ALL]`

---

## PUT /courses/{id}
**강의 수정** `[ADMIN, STAFF]`

---

## DELETE /courses/{id}
**강의 폐강** `[ADMIN, STAFF]`

### Response `200`
```json
{ "success": true, "data": null, "message": "강의가 폐강 처리되었습니다." }
```

---

# PART 8. 수강신청 (Enrollments)

---

## GET /enrollments
**수강신청 목록 조회** `[STUDENT - 본인, ADMIN/STAFF/PROFESSOR - 전체]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `year` | int | 연도 |
| `semester` | int | 학기 |
| `studentId` | long | 학생 필터 (ADMIN·STAFF·PROFESSOR만) |
| `courseId` | long | 강의 필터 |
| `status` | string | ENROLLED·WITHDRAWN·COMPLETED |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "studentId": 1,
        "studentName": "홍길동",
        "studentNumber": "20240001",
        "courseId": 1,
        "courseName": "자료구조",
        "courseCode": "CS20240001",
        "professorName": "김교수",
        "credit": 3,
        "year": 2024,
        "semester": 1,
        "status": "ENROLLED",
        "enrolledAt": "2024-02-15T09:00:00"
      }
    ]
  }
}
```

---

## POST /enrollments
**수강신청** `[STUDENT]`

### Request
```json
{
  "courseId": 1
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "courseId": 1, "courseName": "자료구조" },
  "message": "수강신청이 완료되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `ENROLLMENT_FULL` | 정원 초과 |
| `ALREADY_ENROLLED` | 이미 신청한 강의 |
| `SCHEDULE_CONFLICT` | 시간표 충돌 |
| `ENROLLMENT_PERIOD_CLOSED` | 수강신청 기간 아님 |
| `OPTIMISTIC_LOCK_FAIL` | 동시 요청 충돌 |

---

## DELETE /enrollments/{id}
**수강 취소** `[STUDENT]`

### Response `200`
```json
{ "success": true, "data": null, "message": "수강 취소되었습니다." }
```

### Error
| 코드 | 조건 |
|------|------|
| `ENROLLMENT_PERIOD_CLOSED` | 취소 기간 아님 |

---

## GET /enrollments/period
**수강신청 기간 조회** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "semester": 1,
    "startAt": "2024-02-14T09:00:00",
    "endAt": "2024-02-16T18:00:00",
    "isOpen": true
  }
}
```

---

## PUT /enrollments/period
**수강신청 기간 설정** `[ADMIN, STAFF]`

### Request
```json
{
  "year": 2024,
  "semester": 1,
  "startAt": "2024-02-14T09:00:00",
  "endAt": "2024-02-16T18:00:00"
}
```

---

# PART 9. 성적 관리 (Grades)

---

## GET /grades
**성적 목록 조회**

- `[PROFESSOR]`: 본인 담당 강의의 학생 성적
- `[STUDENT]`: 본인 성적만
- `[ADMIN, STAFF]`: 전체

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `courseId` | long | 강의 필터 |
| `year` | int | 연도 |
| `semester` | int | 학기 |
| `studentId` | long | 학생 필터 (ADMIN·STAFF·PROFESSOR만) |
| `status` | string | TEMP·SUBMITTED·CONFIRMED |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "enrollmentId": 1,
        "studentId": 1,
        "studentName": "홍길동",
        "studentNumber": "20240001",
        "courseId": 1,
        "courseName": "자료구조",
        "credit": 3,
        "letterGrade": "A+",
        "score": 98.5,
        "gradePoints": 4.5,
        "isPassFail": false,
        "status": "SUBMITTED"
      }
    ]
  }
}
```

---

## PUT /grades/{id}
**성적 입력/수정** `[PROFESSOR]`

### Request
```json
{
  "letterGrade": "A+",
  "score": 98.5,
  "isPassFail": false,
  "remark": "우수한 성적"
}
```

### Response `200`
```json
{ "success": true, "data": { "id": 1, "letterGrade": "A+", "gradePoints": 4.5 } }
```

### Error
| 코드 | 조건 |
|------|------|
| `GRADE_ALREADY_CONFIRMED` | 이미 확정된 성적 |
| `FORBIDDEN` | 본인 담당 강의 아님 |

---

## POST /grades/confirm
**성적 확정** `[STAFF]`

### Request
```json
{
  "courseId": 1
}
```

### Response `200`
```json
{ "success": true, "data": null, "message": "성적이 확정되었습니다." }
```

---

## GET /grades/gpa
**GPA 조회** `[STUDENT - 본인, ADMIN/STAFF - 전체]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `studentId` | long | ADMIN·STAFF만 사용 가능 |

### Response `200`
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "studentName": "홍길동",
    "totalGpa": 4.12,
    "totalCredits": 36,
    "semesterGpa": [
      { "year": 2024, "semester": 1, "gpa": 4.25, "credits": 18 },
      { "year": 2024, "semester": 2, "gpa": 4.00, "credits": 18 }
    ]
  }
}
```

---

## GET /grades/statistics/{courseId}
**강의별 성적 분포** `[PROFESSOR, STAFF, ADMIN]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseName": "자료구조",
    "totalStudents": 30,
    "distribution": {
      "A+": 3, "A": 5, "B+": 8, "B": 7,
      "C+": 4, "C": 2, "D+": 1, "D": 0, "F": 0
    },
    "average": 3.85
  }
}
```

---

# PART 10. 공지사항 (Notices)

---

## GET /notices
**공지 목록** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `category` | string | ACADEMIC·DEPARTMENT·COURSE·GENERAL |
| `departmentId` | long | 학과 필터 |
| `courseId` | long | 강의 필터 |
| `keyword` | string | 제목·내용 검색 |
| `isPinned` | boolean | 고정 공지만 |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "2024학년도 1학기 수강신청 안내",
        "category": "ACADEMIC",
        "authorName": "교학처",
        "isPinned": true,
        "viewCount": 1250,
        "hasAttachment": false,
        "createdAt": "2024-01-15T09:00:00"
      }
    ]
  }
}
```

---

## POST /notices
**공지 작성** `[ADMIN, STAFF, PROFESSOR]`

### Request
```json
{
  "title": "2024학년도 1학기 수강신청 안내",
  "content": "수강신청 기간은 2월 14일부터...",
  "category": "ACADEMIC",
  "departmentId": null,
  "courseId": null,
  "isPinned": true
}
```

### Response `201`
```json
{ "success": true, "data": { "id": 1, "title": "..." } }
```

---

## GET /notices/{id}
**공지 상세** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "2024학년도 1학기 수강신청 안내",
    "content": "수강신청 기간은 2월 14일부터...",
    "category": "ACADEMIC",
    "authorId": 1,
    "authorName": "교학처",
    "departmentId": null,
    "courseId": null,
    "isPinned": true,
    "viewCount": 1251,
    "attachments": [
      { "id": 1, "fileName": "수강신청_안내.pdf", "fileSize": 204800, "mimeType": "application/pdf" }
    ],
    "createdAt": "2024-01-15T09:00:00",
    "updatedAt": "2024-01-15T09:00:00"
  }
}
```

---

## PUT /notices/{id}
**공지 수정** `[ADMIN, STAFF, PROFESSOR - 본인 작성만]`

## DELETE /notices/{id}
**공지 삭제** `[ADMIN, STAFF, PROFESSOR - 본인 작성만]`

---

# PART 11. 전자결재 (Approvals)

---

## GET /approvals/templates
**결재 양식 목록** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "LEAVE_OF_ABSENCE", "name": "휴학원" },
    { "id": 2, "code": "REINSTATEMENT",    "name": "복학원" },
    { "id": 3, "code": "COURSE_CHANGE",    "name": "수강정정신청" },
    { "id": 4, "code": "GRADE_APPEAL",     "name": "성적이의신청" },
    { "id": 5, "code": "CERTIFICATE_REQUEST", "name": "증명서발급신청" }
  ]
}
```

---

## GET /approvals
**결재 문서 목록** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `box` | string | `DRAFT`(기안함)·`PENDING`(결재함)·`DONE`(완료함) |
| `status` | string | DRAFT·IN_PROGRESS·APPROVED·REJECTED |
| `templateId` | long | 양식 필터 |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "2024-1학기 휴학 신청",
        "templateName": "휴학원",
        "drafterName": "홍길동",
        "status": "IN_PROGRESS",
        "currentStep": 1,
        "submittedAt": "2024-03-01T10:00:00"
      }
    ]
  }
}
```

---

## POST /approvals
**결재 문서 기안** `[STUDENT, PROFESSOR, STAFF]`

### Request
```json
{
  "templateId": 1,
  "title": "2024-1학기 휴학 신청",
  "content": "군 입대로 인한 휴학을 신청합니다.",
  "formData": {
    "leaveType": "군입대",
    "startDate": "2024-03-01",
    "endDate": "2025-02-28"
  },
  "approvalLines": [
    { "step": 1, "approverId": 5, "roleLabel": "지도교수" },
    { "step": 2, "approverId": 10, "roleLabel": "교학처 담당자" },
    { "step": 3, "approverId": 2, "roleLabel": "교학처장" }
  ]
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "title": "2024-1학기 휴학 신청", "status": "IN_PROGRESS" },
  "message": "결재 문서가 기안되었습니다."
}
```

---

## GET /approvals/{id}
**결재 문서 상세** `[ALL - 관련자만]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "templateId": 1,
    "templateName": "휴학원",
    "title": "2024-1학기 휴학 신청",
    "drafterId": 1,
    "drafterName": "홍길동",
    "content": "군 입대로 인한 휴학을 신청합니다.",
    "formData": { "leaveType": "군입대", "startDate": "2024-03-01", "endDate": "2025-02-28" },
    "status": "IN_PROGRESS",
    "currentStep": 1,
    "submittedAt": "2024-03-01T10:00:00",
    "approvalLines": [
      {
        "id": 1,
        "step": 1,
        "approverId": 5,
        "approverName": "김교수",
        "roleLabel": "지도교수",
        "action": null,
        "comment": null,
        "actionAt": null
      },
      {
        "id": 2,
        "step": 2,
        "approverId": 10,
        "approverName": "이직원",
        "roleLabel": "교학처 담당자",
        "action": null,
        "comment": null,
        "actionAt": null
      }
    ]
  }
}
```

---

## POST /approvals/{id}/process
**결재 처리 (승인/반려)** `[PROFESSOR, STAFF, ADMIN - 결재선에 포함된 경우]`

### Request
```json
{
  "action": "APPROVED",
  "comment": "검토 완료, 승인합니다."
}
```

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    "currentStep": 2
  },
  "message": "승인 처리되었습니다."
}
```

> 마지막 step 승인 시 `status`가 `APPROVED`로 변경  
> 반려 시 전체 문서가 즉시 `REJECTED`로 변경되고 기안자에게 알림

---

## DELETE /approvals/{id}
**결재 문서 취소 (임시저장 상태만)** `[STUDENT, PROFESSOR - 본인 기안만]`

---

## GET /approvals/notifications
**결재 알림 목록** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "documentId": 1,
      "documentTitle": "2024-1학기 휴학 신청",
      "message": "결재 문서가 승인되었습니다.",
      "isRead": false,
      "createdAt": "2024-03-02T14:00:00"
    }
  ]
}
```

---

## PATCH /approvals/notifications/{id}/read
**알림 읽음 처리** `[ALL]`

### Response `200`
```json
{ "success": true, "data": null, "message": "읽음 처리되었습니다." }
```

---

# PART 12. 공통 조회 API

---

## GET /common/colleges-departments
**단과대학 + 학과 트리 (폼 선택용)** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "공과대학",
      "departments": [
        { "id": 1, "name": "컴퓨터공학과" },
        { "id": 2, "name": "기계공학과" }
      ]
    }
  ]
}
```

---

## GET /common/professors-by-department/{departmentId}
**학과별 교수 목록 (강의 개설 폼용)** `[ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "김교수", "position": "교수" }
  ]
}
```

---

# PART 13. 출결 관리 (Attendance)

---

## 출결 체크인 흐름

```
[교수] 세션 생성  →  QR 토큰(UUID) + 6자리 코드 발급
     ↓  (화면·프로젝터에 QR 표시)
[학생] QR 스캔   →  https://campus.ac.kr/attend/{qrToken}
     ↓  (사이트 진입 후 코드 입력)
[학생] POST /attendance/check-in  { qrToken, accessCode }
     ↓  (검증: 세션 유효 + 수강생 확인 + 중복 방지)
[시스템] 출결 기록 생성  →  PRESENT 또는 LATE
```

---

## POST /attendance/sessions
**출결 세션 생성** `[PROFESSOR]`

교수가 강의를 선택하고 출결 세션을 시작합니다. 시스템이 UUID 기반 QR 토큰과 6자리 랜덤 코드를 자동 생성합니다.

### Request Body
```json
{
  "courseId": 1,
  "lectureDate": "2025-03-10",
  "startTime": "2025-03-10T09:00:00+09:00",
  "endTime": "2025-03-10T09:20:00+09:00",
  "lateThreshold": "2025-03-10T09:10:00+09:00"
}
```

> `lateThreshold` 생략 시 세션 종료 전 체크인은 모두 PRESENT로 처리합니다.

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "courseId": 1,
    "courseName": "프로그래밍 기초",
    "lectureDate": "2025-03-10",
    "startTime": "2025-03-10T09:00:00+09:00",
    "endTime": "2025-03-10T09:20:00+09:00",
    "lateThreshold": "2025-03-10T09:10:00+09:00",
    "accessCode": "482931",
    "qrToken": "a3f7c2e1-4b8d-4c2a-9e1f-0123456789ab",
    "qrUrl": "http://localhost:5173/attend/a3f7c2e1-4b8d-4c2a-9e1f-0123456789ab",
    "status": "ACTIVE"
  },
  "message": "출결 세션이 생성되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `FORBIDDEN` | 본인 담당 강의가 아님 |
| `NOT_FOUND` | 존재하지 않는 강의 |

---

## GET /attendance/sessions/{id}
**출결 세션 상세 + 현황** `[PROFESSOR, ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "courseId": 1,
    "courseName": "프로그래밍 기초",
    "lectureDate": "2025-03-10",
    "startTime": "2025-03-10T09:00:00+09:00",
    "endTime": "2025-03-10T09:20:00+09:00",
    "lateThreshold": "2025-03-10T09:10:00+09:00",
    "accessCode": "482931",
    "qrUrl": "http://localhost:5173/attend/a3f7c2e1-...",
    "status": "ACTIVE",
    "totalEnrolled": 35,
    "presentCount": 20,
    "lateCount": 3,
    "absentCount": 12
  }
}
```

---

## PATCH /attendance/sessions/{id}/close
**세션 수동 종료** `[PROFESSOR]`

세션을 즉시 CLOSED 상태로 변경합니다. 이후 학생 체크인 불가.

### Response `200`
```json
{ "success": true, "data": null, "message": "출결 세션이 종료되었습니다." }
```

### Error
| 코드 | 조건 |
|------|------|
| `FORBIDDEN` | 본인 세션이 아님 |

---

## POST /attendance/sessions/{id}/regenerate-code
**6자리 코드 재생성** `[PROFESSOR]`

세션이 ACTIVE 상태일 때만 가능. 기존 코드는 즉시 무효화됩니다.

### Response `200`
```json
{
  "success": true,
  "data": { "accessCode": "719204" },
  "message": "코드가 재생성되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `ATTENDANCE_SESSION_CLOSED` | 이미 종료된 세션 |

---

## GET /attendance/sessions/{id}/records
**세션별 출결 목록** `[PROFESSOR, ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "studentNumber": "20240001",
      "studentName": "최예진",
      "status": "PRESENT",
      "checkedInAt": "2025-03-10T09:03:22+09:00",
      "isManual": false
    },
    {
      "id": 2,
      "studentId": 2,
      "studentNumber": "20240002",
      "studentName": "정우진",
      "status": "LATE",
      "checkedInAt": "2025-03-10T09:14:05+09:00",
      "isManual": false
    },
    {
      "id": 3,
      "studentId": 3,
      "studentNumber": "20230001",
      "studentName": "박도현",
      "status": "ABSENT",
      "checkedInAt": null,
      "isManual": false
    }
  ]
}
```

---

## PUT /attendance/records/{recordId}
**출결 수동 조정** `[PROFESSOR, ADMIN, STAFF]`

출결 상태를 수동으로 변경합니다. 사유(`reason`) 입력 필수.

### Request Body
```json
{
  "status": "PRESENT",
  "reason": "사전 결석계 제출 (의료 사유)"
}
```

### Response `200`
```json
{
  "success": true,
  "data": { "id": 1, "status": "PRESENT", "isManual": true },
  "message": "출결이 수정되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `INVALID_INPUT` | reason 미입력 |

---

## GET /courses/{courseId}/attendance/summary
**강의 전체 출결 집계** `[PROFESSOR, ADMIN, STAFF]`

특정 강의의 전체 세션에 대한 학생별 출결 통계를 반환합니다.

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `year` | int | 선택 | 연도 필터 |
| `semester` | int | 선택 | 학기 필터 (1 또는 2) |

### Response `200`
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseName": "프로그래밍 기초",
    "totalSessions": 8,
    "students": [
      {
        "studentId": 1,
        "studentNumber": "20240001",
        "studentName": "최예진",
        "presentCount": 7,
        "lateCount": 1,
        "absentCount": 0,
        "attendanceRate": 93.8
      }
    ]
  }
}
```

---

## GET /attendance/qr/{qrToken}
**QR 토큰으로 세션 조회** `[PUBLIC]`

학생이 QR을 스캔하면 이 URL로 진입합니다. 인증 없이 접근 가능하며, 세션 활성 여부와 기본 정보를 반환합니다.

### Response `200`
```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "courseName": "프로그래밍 기초",
    "professorName": "이민준",
    "lectureDate": "2025-03-10",
    "isActive": true,
    "endTime": "2025-03-10T09:20:00+09:00"
  }
}
```

### Error
| 코드 | 조건 |
|------|------|
| `NOT_FOUND` | 유효하지 않은 QR 토큰 |
| `ATTENDANCE_SESSION_CLOSED` | 이미 종료된 세션 |

---

## POST /attendance/check-in
**출석 체크인** `[STUDENT]`

학생이 QR 토큰 + 6자리 코드를 제출하여 출석을 확인합니다. 체크인 시각이 `lateThreshold` 이후이면 LATE로 기록됩니다.

### Request Body
```json
{
  "qrToken": "a3f7c2e1-4b8d-4c2a-9e1f-0123456789ab",
  "accessCode": "482931",
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

> `latitude`, `longitude`는 선택 항목입니다.

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "PRESENT",
    "checkedInAt": "2025-03-10T09:03:22+09:00",
    "courseName": "프로그래밍 기초"
  },
  "message": "출석이 확인되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `ATTENDANCE_SESSION_CLOSED` | 세션이 종료되었거나 시간 만료 |
| `INVALID_ACCESS_CODE` | 6자리 코드 불일치 |
| `ALREADY_CHECKED_IN` | 이미 체크인 완료 |
| `NOT_ENROLLED` | 해당 강의 미수강 학생 |

---

## GET /attendance/my
**내 출결 현황** `[STUDENT]`

로그인한 학생의 강의별 출결 집계와 세부 기록을 반환합니다.

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `courseId` | long | 선택 | 특정 강의 필터 |
| `year` | int | 선택 | 연도 |
| `semester` | int | 선택 | 학기 (1 또는 2) |

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "courseId": 1,
      "courseName": "프로그래밍 기초",
      "totalSessions": 8,
      "presentCount": 7,
      "lateCount": 1,
      "absentCount": 0,
      "attendanceRate": 93.8,
      "records": [
        {
          "sessionId": 1,
          "lectureDate": "2025-03-10",
          "status": "PRESENT",
          "checkedInAt": "2025-03-10T09:03:22+09:00"
        }
      ]
    }
  ]
}
```

---

# PART 14. 학생 상담 관리 (Counseling)

---

## POST /counseling/requests
**상담 신청** `[STUDENT]`

### Request Body
```json
{
  "counselingType": "ACADEMIC",
  "preferredDate": "2025-04-10",
  "reason": "전공 변경과 수강 계획에 대해 상담을 받고 싶습니다."
}
```

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "counselingType": "ACADEMIC",
    "preferredDate": "2025-04-10",
    "status": "PENDING",
    "createdAt": "2025-04-05T10:00:00+09:00"
  },
  "message": "상담이 신청되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `COUNSELING_REQUEST_ALREADY_EXISTS` | 이미 PENDING·ACCEPTED 상태의 동일 유형 신청 존재 |

---

## GET /counseling/requests
**상담 신청 목록 조회** `[ALL]`

- `STUDENT`: 본인 신청 내역만 반환
- `PROFESSOR, STAFF, ADMIN`: 전체 또는 필터 조회

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `studentId` | long | 학생 필터 (PROFESSOR·STAFF·ADMIN만) |
| `status` | string | PENDING·ACCEPTED·REJECTED·COMPLETED·CANCELLED |
| `counselingType` | string | 유형 필터 |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "studentName": "홍길동",
        "studentNumber": "20240001",
        "counselingType": "ACADEMIC",
        "preferredDate": "2025-04-10",
        "status": "PENDING",
        "createdAt": "2025-04-05T10:00:00+09:00"
      }
    ],
    "page": 0, "size": 20, "totalElements": 5, "totalPages": 1
  }
}
```

---

## PATCH /counseling/requests/{id}/accept
**상담 신청 수락** `[PROFESSOR, STAFF]`

### Response `200`
```json
{ "success": true, "data": { "id": 1, "status": "ACCEPTED" }, "message": "상담 신청을 수락했습니다." }
```

---

## PATCH /counseling/requests/{id}/reject
**상담 신청 거절** `[PROFESSOR, STAFF]`

### Request Body
```json
{ "rejectReason": "해당 기간 출장으로 인해 상담이 어렵습니다." }
```

### Response `200`
```json
{ "success": true, "data": { "id": 1, "status": "REJECTED" }, "message": "상담 신청을 거절했습니다." }
```

---

## POST /counseling/records
**상담 기록 작성** `[PROFESSOR, STAFF]`

신청서 기반 또는 직접 기록 모두 가능. `requestId`는 선택 항목.

### Request Body
```json
{
  "requestId": 1,
  "studentId": 1,
  "counselingType": "ACADEMIC",
  "subject": "전공 변경 관련 상담",
  "content": "학생이 컴퓨터공학과에서 데이터사이언스로의 전과를 희망...",
  "outcome": "전과 신청서 및 학점 이수 조건 안내 완료",
  "followUp": "다음 학기 수강 계획 재확인 예정",
  "counseledAt": "2025-04-10T14:00:00+09:00",
  "isConfidential": false
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "subject": "전공 변경 관련 상담", "counseledAt": "2025-04-10T14:00:00+09:00" },
  "message": "상담 기록이 저장되었습니다."
}
```

---

## GET /counseling/records
**상담 기록 목록** `[PROFESSOR, STAFF, ADMIN, STUDENT(본인)]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `studentId` | long | 학생 필터 (PROFESSOR·STAFF·ADMIN만) |
| `counselingType` | string | 유형 필터 |
| `from` | date | 기간 시작 (`YYYY-MM-DD`) |
| `to` | date | 기간 종료 (`YYYY-MM-DD`) |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "studentName": "홍길동",
        "counselorName": "김교수",
        "counselingType": "ACADEMIC",
        "subject": "전공 변경 관련 상담",
        "counseledAt": "2025-04-10T14:00:00+09:00",
        "isNotified": true,
        "isConfidential": false
      }
    ]
  }
}
```

> `isConfidential = true`인 기록은 STUDENT 조회 시 `content`, `outcome`, `followUp` 필드를 `"[비공개]"`로 마스킹합니다.

---

## GET /counseling/records/{id}
**상담 기록 상세** `[PROFESSOR, STAFF, ADMIN, STUDENT(본인·비밀아닌 것만)]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentId": 1,
    "studentName": "홍길동",
    "counselorId": 5,
    "counselorName": "김교수",
    "counselingType": "ACADEMIC",
    "subject": "전공 변경 관련 상담",
    "content": "학생이 컴퓨터공학과에서...",
    "outcome": "전과 신청서 및 학점 이수 조건 안내 완료",
    "followUp": "다음 학기 수강 계획 재확인 예정",
    "counseledAt": "2025-04-10T14:00:00+09:00",
    "isNotified": true,
    "isConfidential": false
  }
}
```

---

## PUT /counseling/records/{id}
**상담 기록 수정** `[PROFESSOR, STAFF]`

### Request Body
```json
{
  "subject": "전공 변경 및 장학금 관련 상담",
  "content": "...",
  "outcome": "...",
  "followUp": "..."
}
```

### Response `200`
```json
{ "success": true, "data": { "id": 1 }, "message": "상담 기록이 수정되었습니다." }
```

---

## POST /counseling/records/{id}/notify
**상담 결과 이메일 발송** `[PROFESSOR, STAFF, ADMIN]`

학생의 등록 이메일로 상담 요약을 발송합니다. 비동기 처리되며 발송 완료 시 `IS_NOTIFIED = 1` 업데이트.

### Response `200`
```json
{ "success": true, "data": null, "message": "이메일이 발송되었습니다." }
```

### Error
| 코드 | 조건 |
|------|------|
| `NOT_FOUND` | 존재하지 않는 기록 |

---

# PART 15. 과제 제출 시스템 (Assignments)

---

## POST /assignments
**과제 개설** `[PROFESSOR]`

### Request Body
```json
{
  "courseId": 1,
  "title": "1주차 알고리즘 과제",
  "description": "BFS와 DFS를 활용한 그래프 탐색 구현",
  "dueDate": "2025-04-14T23:59:00+09:00",
  "maxScore": 100,
  "submissionType": "FILE",
  "allowLateSubmit": false,
  "isVisible": true
}
```

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "1주차 알고리즘 과제",
    "dueDate": "2025-04-14T23:59:00+09:00",
    "status": "OPEN"
  },
  "message": "과제가 개설되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `FORBIDDEN` | 본인 담당 강의 아님 |

---

## GET /assignments
**과제 목록 조회** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `courseId` | long | 강의 필터 (필수) |
| `status` | string | OPEN·CLOSED·GRADED |

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "1주차 알고리즘 과제",
      "dueDate": "2025-04-14T23:59:00+09:00",
      "maxScore": 100,
      "submissionType": "FILE",
      "status": "OPEN",
      "submittedCount": 18,
      "totalEnrolled": 25
    }
  ]
}
```

> STUDENT 조회 시 `submittedCount`, `totalEnrolled`는 미포함. 본인 제출 여부(`mySubmission: null | {...}`)를 추가 반환.

---

## GET /assignments/{id}
**과제 상세** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "courseId": 1,
    "courseName": "자료구조",
    "title": "1주차 알고리즘 과제",
    "description": "BFS와 DFS를 활용한 그래프 탐색 구현",
    "dueDate": "2025-04-14T23:59:00+09:00",
    "maxScore": 100,
    "submissionType": "FILE",
    "allowLateSubmit": false,
    "status": "OPEN"
  }
}
```

---

## PUT /assignments/{id}
**과제 수정** `[PROFESSOR]`

## DELETE /assignments/{id}
**과제 삭제** `[PROFESSOR]`

```json
{ "success": true, "data": null, "message": "과제가 삭제되었습니다." }
```

---

## POST /assignments/{id}/submissions
**과제 제출** `[STUDENT]`

- `submissionType = FILE`: `multipart/form-data` 전송 (`file` + `content` 선택)
- `submissionType = TEXT`: JSON Body

### Request (TEXT 유형)
```json
{
  "content": "BFS 구현: queue를 사용하여..."
}
```

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "assignmentId": 1,
    "status": "SUBMITTED",
    "submittedAt": "2025-04-13T20:30:00+09:00"
  },
  "message": "과제가 제출되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `SUBMISSION_ALREADY_EXISTS` | 이미 제출 완료 |
| `ASSIGNMENT_CLOSED` | 마감됐고 지각 제출 불허 |
| `NOT_ENROLLED` | 해당 강의 미수강 |

> 마감일 초과 + `allowLateSubmit = true`면 status = `LATE`로 저장.

---

## GET /assignments/{id}/submissions
**제출 현황 조회** `[PROFESSOR, ADMIN, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "assignmentId": 1,
    "title": "1주차 알고리즘 과제",
    "submittedCount": 18,
    "lateCount": 2,
    "notSubmittedCount": 5,
    "submissions": [
      {
        "id": 1,
        "studentId": 1,
        "studentNumber": "20240001",
        "studentName": "홍길동",
        "status": "SUBMITTED",
        "submittedAt": "2025-04-13T20:30:00+09:00",
        "score": null,
        "isGraded": false
      }
    ],
    "notSubmitted": [
      { "studentId": 5, "studentNumber": "20240005", "studentName": "최예진" }
    ]
  }
}
```

---

## GET /assignments/{id}/submissions/my
**내 제출물 조회** `[STUDENT]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "assignmentTitle": "1주차 알고리즘 과제",
    "status": "GRADED",
    "submittedAt": "2025-04-13T20:30:00+09:00",
    "fileName": "homework1.zip",
    "score": 92.0,
    "maxScore": 100,
    "feedback": "BFS 구현은 정확하나 DFS에서 재귀 깊이 제한 처리가 필요합니다.",
    "gradedAt": "2025-04-16T10:00:00+09:00"
  }
}
```

---

## PUT /assignments/{id}/submissions/{submissionId}/grade
**채점** `[PROFESSOR]`

### Request Body
```json
{
  "score": 92.0,
  "feedback": "BFS 구현은 정확하나 DFS에서 재귀 깊이 제한 처리가 필요합니다."
}
```

### Response `200`
```json
{
  "success": true,
  "data": { "id": 1, "score": 92.0, "status": "GRADED" },
  "message": "채점이 완료되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `FORBIDDEN` | 본인 담당 강의 아님 |
| `INVALID_INPUT` | 점수가 maxScore 초과 |

---

# PART 16. 시험 관리감독 (Exams)

---

## POST /exams
**시험 등록** `[PROFESSOR, STAFF]`

### Request Body
```json
{
  "courseId": 1,
  "examType": "MIDTERM",
  "title": "2025-1학기 자료구조 중간고사",
  "examDate": "2025-04-23",
  "startTime": "2025-04-23T10:00:00+09:00",
  "endTime": "2025-04-23T12:00:00+09:00",
  "room": "공학관 401호",
  "maxStudents": 35,
  "description": "4장까지 범위"
}
```

### Response `201`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "2025-1학기 자료구조 중간고사",
    "examDate": "2025-04-23",
    "startTime": "2025-04-23T10:00:00+09:00",
    "endTime": "2025-04-23T12:00:00+09:00",
    "room": "공학관 401호",
    "status": "SCHEDULED"
  },
  "message": "시험이 등록되었습니다."
}
```

---

## GET /exams
**시험 목록 조회** `[ALL]`

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `courseId` | long | 강의 필터 |
| `examType` | string | 유형 필터 |
| `from` | date | 기간 시작 |
| `to` | date | 기간 종료 |
| `status` | string | SCHEDULED·ONGOING·COMPLETED·CANCELLED |

### Response `200` (페이징)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "courseId": 1,
        "courseName": "자료구조",
        "examType": "MIDTERM",
        "title": "2025-1학기 자료구조 중간고사",
        "examDate": "2025-04-23",
        "startTime": "2025-04-23T10:00:00+09:00",
        "endTime": "2025-04-23T12:00:00+09:00",
        "room": "공학관 401호",
        "status": "SCHEDULED"
      }
    ]
  }
}
```

---

## GET /exams/{id}
**시험 상세** `[ALL]`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "courseId": 1,
    "courseName": "자료구조",
    "professorName": "김교수",
    "examType": "MIDTERM",
    "title": "2025-1학기 자료구조 중간고사",
    "examDate": "2025-04-23",
    "startTime": "2025-04-23T10:00:00+09:00",
    "endTime": "2025-04-23T12:00:00+09:00",
    "room": "공학관 401호",
    "maxStudents": 35,
    "status": "SCHEDULED",
    "description": "4장까지 범위",
    "supervisors": [
      { "userId": 5, "name": "김교수", "role": "MAIN" },
      { "userId": 10, "name": "이직원", "role": "ASSISTANT" }
    ]
  }
}
```

---

## PUT /exams/{id}
**시험 수정** `[PROFESSOR, STAFF]`

## DELETE /exams/{id}
**시험 취소** `[PROFESSOR, STAFF]`

```json
{ "success": true, "data": null, "message": "시험이 취소되었습니다." }
```

---

## POST /exams/{id}/supervisors
**감독관 배정** `[PROFESSOR, STAFF, ADMIN]`

### Request Body
```json
{
  "supervisorId": 10,
  "role": "ASSISTANT"
}
```

### Response `201`
```json
{ "success": true, "data": { "examId": 1, "supervisorId": 10, "role": "ASSISTANT" }, "message": "감독관이 배정되었습니다." }
```

---

## DELETE /exams/{id}/supervisors/{userId}
**감독관 제거** `[PROFESSOR, STAFF, ADMIN]`

```json
{ "success": true, "data": null, "message": "감독관이 제거되었습니다." }
```

---

## POST /exams/{id}/registrations
**특별 시험 신청 (재시험·추가시험)** `[STUDENT]`

일반 시험은 자동 배정(수강신청 연동). 이 API는 `MAKEUP`, `EXTRA` 유형에만 사용.

### Request Body
```json
{
  "reason": "당일 고열로 인한 결시. 진단서 첨부 예정."
}
```

### Response `201`
```json
{
  "success": true,
  "data": { "id": 1, "examId": 1, "status": "REGISTERED" },
  "message": "특별 시험 신청이 완료되었습니다."
}
```

### Error
| 코드 | 조건 |
|------|------|
| `EXAM_ALREADY_REGISTERED` | 이미 등록된 시험 |
| `EXAM_FULL` | 정원 초과 |
| `NOT_ENROLLED` | 해당 강의 미수강 |

---

## GET /exams/{id}/registrations
**응시자 목록 조회** `[PROFESSOR, STAFF, ADMIN]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "studentNumber": "20240001",
      "studentName": "홍길동",
      "status": "ATTENDED",
      "isSpecial": false,
      "registeredAt": "2025-04-23T09:55:00+09:00"
    },
    {
      "id": 2,
      "studentId": 2,
      "studentNumber": "20240002",
      "studentName": "정우진",
      "status": "ABSENT",
      "isSpecial": false,
      "registeredAt": "2025-04-23T09:58:00+09:00"
    }
  ]
}
```

---

## PATCH /exams/{id}/registrations/{studentId}/status
**응시 상태 변경** `[PROFESSOR, STAFF]`

### Request Body
```json
{ "status": "ATTENDED" }
```

### Response `200`
```json
{ "success": true, "data": { "studentId": 1, "status": "ATTENDED" }, "message": "응시 상태가 변경되었습니다." }
```

---

## GET /exams/my-schedule
**내 시험 일정** `[STUDENT]`

수강 중인 강의의 시험 일정을 자동 집계합니다.

### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `year` | int | 연도 |
| `semester` | int | 학기 |

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "examId": 1,
      "courseId": 1,
      "courseName": "자료구조",
      "examType": "MIDTERM",
      "title": "2025-1학기 자료구조 중간고사",
      "examDate": "2025-04-23",
      "startTime": "2025-04-23T10:00:00+09:00",
      "endTime": "2025-04-23T12:00:00+09:00",
      "room": "공학관 401호",
      "myStatus": "REGISTERED"
    }
  ]
}
```

---

## GET /exams/my-supervision
**내 감독 시험 조회** `[PROFESSOR, STAFF]`

### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "examId": 1,
      "courseName": "자료구조",
      "title": "2025-1학기 자료구조 중간고사",
      "examDate": "2025-04-23",
      "startTime": "2025-04-23T10:00:00+09:00",
      "room": "공학관 401호",
      "supervisorRole": "MAIN"
    }
  ]
}
```

---

# PART 17. 백엔드 구현 가이드 (Backend AI 전용)

---

## 프로젝트 구조
```
src/main/java/com/uams/
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── SwaggerConfig.java
├── common/
│   ├── response/ApiResponse.java
│   ├── response/PageResponse.java
│   ├── exception/GlobalExceptionHandler.java
│   └── exception/ErrorCode.java
├── domain/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   └── dto/
│   ├── student/
│   ├── professor/
│   ├── staff/
│   ├── department/
│   ├── course/
│   ├── enrollment/
│   ├── grade/
│   ├── notice/
│   └── approval/
└── entity/
    ├── Users.java
    ├── Students.java
    ├── Professors.java
    ├── StaffMembers.java
    ├── StaffJobs.java
    └── ...
```

## 필수 구현 사항

### 낙관적 락 (수강신청)
```java
@Entity
public class Courses {
    @Version
    @Column(name = "VERSION_NO")
    private Long versionNo;

    @Column(name = "CURRENT_ENROLLMENT")
    private int currentEnrollment;
}
// ObjectOptimisticLockingFailureException → OPTIMISTIC_LOCK_FAIL 에러로 변환
```

### JWT 필터 체인
- `JwtAuthenticationFilter` → `OncePerRequestFilter` 구현
- Access Token 만료 시 `401 UNAUTHORIZED` 반환
- Refresh Token은 `/auth/refresh` 에서만 처리

### Role 기반 접근 제어
```java
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
@GetMapping("/students")
public ResponseEntity<?> getStudents(...) { }
```

### 표준 응답 래퍼 예시
```java
@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "요청이 처리되었습니다.", LocalDateTime.now());
    }
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message, LocalDateTime.now());
    }
}
```

---

# PART 18. 프론트엔드 구현 가이드 (Frontend AI 전용)

---

## 프로젝트 구조
```
src/
├── api/
│   ├── client.ts          -- axios 인스턴스 + 인터셉터
│   ├── auth.ts
│   ├── students.ts
│   ├── professors.ts
│   ├── staff.ts
│   ├── courses.ts
│   ├── enrollments.ts
│   ├── grades.ts
│   ├── notices.ts
│   └── approvals.ts
├── stores/
│   └── authStore.ts       -- Zustand: 토큰·유저 정보
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── students/
│   ├── professors/
│   ├── staff/
│   ├── courses/
│   ├── enrollment/
│   ├── grades/
│   ├── notices/
│   └── approvals/
├── components/
│   └── layout/
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
└── router/
    └── index.tsx          -- Role 기반 ProtectedRoute 포함
```

## API 클라이언트 설정
```typescript
// src/api/client.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: Access Token 주입
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터: 401 시 Refresh Token으로 재발급
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh 로직
    }
    return Promise.reject(error)
  }
)

export default client
```

## Role 기반 라우팅
```typescript
// 접근 가능한 Role 목록을 prop으로 받는 ProtectedRoute
<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
  <StudentsPage />
</ProtectedRoute>
```

## Role별 사이드바 메뉴 구성
| 메뉴 | ADMIN | STAFF | PROFESSOR | STUDENT |
|------|-------|-------|-----------|---------|
| 대시보드 | ✅ | ✅ | ✅ | ✅ |
| 학생 관리 | ✅ | ✅ | ✅(조회) | - |
| 교수 관리 | ✅ | ✅ | - | - |
| 교직원 관리 | ✅ | - | - | - |
| 학과 관리 | ✅ | ✅ | - | - |
| 강의 관리 | ✅ | ✅ | ✅(본인) | - |
| 수강신청 | - | ✅(관리) | ✅(현황) | ✅ |
| 성적 관리 | ✅ | ✅(확정) | ✅(입력) | ✅(조회) |
| 공지사항 | ✅ | ✅ | ✅ | ✅ |
| 전자결재 | ✅ | ✅ | ✅ | ✅ |

## TanStack Query 사용 예시
```typescript
// 학생 목록 조회
export const useStudents = (params: StudentQueryParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: () => client.get('/students', { params }).then(r => r.data.data),
  })

// 수강신청
export const useEnroll = () =>
  useMutation({
    mutationFn: (courseId: number) =>
      client.post('/enrollments', { courseId }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
```
