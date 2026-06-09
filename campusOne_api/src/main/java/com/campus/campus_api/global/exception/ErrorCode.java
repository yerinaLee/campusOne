package com.campus.campus_api.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "강의를 찾을 수 없습니다."),
    ENROLLMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "수강신청 내역을 찾을 수 없습니다."),
    GRADE_NOT_FOUND(HttpStatus.NOT_FOUND, "성적을 찾을 수 없습니다."),
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다."),
    ALREADY_ENROLLED(HttpStatus.CONFLICT, "이미 수강신청된 강의입니다."),
    ENROLLMENT_FULL(HttpStatus.CONFLICT, "수강 인원이 마감되었습니다."),
    COURSE_NOT_OPEN(HttpStatus.BAD_REQUEST, "개설된 강의가 아닙니다."),
    ALREADY_WITHDRAWN(HttpStatus.BAD_REQUEST, "이미 취소된 수강신청입니다."),
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "학생 정보를 찾을 수 없습니다."),
    PROFESSOR_NOT_FOUND(HttpStatus.NOT_FOUND, "교수 정보를 찾을 수 없습니다."),
    ACCOUNT_LOCKED(HttpStatus.UNAUTHORIZED, "계정이 잠겼습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    INVALID_INPUT(HttpStatus.CONFLICT, "기존 비밀번호와 같은 비밀번호입니다.");

    private final HttpStatus status;
    private final String message;
}
