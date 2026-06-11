package com.campus.campus_api.domain.counseling.service;

import com.campus.campus_api.domain.counseling.dto.*;
import com.campus.campus_api.domain.counseling.entity.CounselingRecord;
import com.campus.campus_api.domain.counseling.entity.CounselingRequest;
import com.campus.campus_api.domain.counseling.repository.CounselingRecordRepository;
import com.campus.campus_api.domain.counseling.repository.CounselingRequestRepository;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CounselingService {

    private final CounselingRequestRepository requestRepository;
    private final CounselingRecordRepository recordRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional
    public CounselingRequestResponse createRequest(Long userId, CounselingRequestCreateRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        if (requestRepository.existsByStudentIdAndStatusIn(student.getId(), List.of("PENDING", "ACCEPTED"))) {
            throw new CustomException(ErrorCode.COUNSELING_REQUEST_ALREADY_EXISTS, "진행 중인 상담 신청이 이미 존재합니다.");
        }

        CounselingRequest counselingRequest = CounselingRequest.builder()
                .student(student)
                .counselingType(request.getCounselingType())
                .preferredDate(request.getPreferredDate())
                .reason(request.getReason())
                .status("PENDING")
                .build();

        requestRepository.save(counselingRequest);
        return CounselingRequestResponse.from(counselingRequest);
    }

    @Transactional(readOnly = true)
    public Page<CounselingRequestResponse> getRequests(Long userId, String role, Long studentId, String status, String counselingType, Pageable pageable) {
        List<CounselingRequest> requests;
        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));
            requests = requestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        } else {
            if (status != null && !status.isEmpty()) {
                requests = requestRepository.findByStatusOrderByCreatedAtDesc(status);
            } else {
                requests = requestRepository.findAll();
            }
        }

        if (studentId != null) {
            requests = requests.stream().filter(r -> r.getStudent().getId().equals(studentId)).collect(Collectors.toList());
        }
        if (counselingType != null && !counselingType.isEmpty()) {
            requests = requests.stream().filter(r -> r.getCounselingType().equals(counselingType)).collect(Collectors.toList());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), requests.size());
        List<CounselingRequestResponse> content = requests.subList(start, end).stream()
                .map(CounselingRequestResponse::from).collect(Collectors.toList());

        return new PageImpl<>(content, pageable, requests.size());
    }

    @Transactional
    public CounselingRequestResponse processRequest(Long requestId, Long userId, CounselingRequestProcessRequest requestDto) {
        CounselingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "상담 신청을 찾을 수 없습니다."));

        User counselor = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "상담사 정보가 없습니다."));

        request.setStatus(requestDto.getStatus());
        if ("ACCEPTED".equals(requestDto.getStatus())) {
            request.setCounselor(counselor);
        } else if ("REJECTED".equals(requestDto.getStatus())) {
            request.setRejectReason(requestDto.getRejectReason());
        }

        return CounselingRequestResponse.from(request);
    }

    @Transactional
    public CounselingRecordResponse createRecord(Long userId, CounselingRecordCreateRequest requestDto) {
        CounselingRequest request = null;
        if (requestDto.getRequestId() != null) {
            request = requestRepository.findById(requestDto.getRequestId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "상담 신청을 찾을 수 없습니다."));
            request.setStatus("COMPLETED");
        }

        Student student = studentRepository.findById(requestDto.getStudentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));
        User counselor = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "상담사 정보가 없습니다."));

        CounselingRecord record = CounselingRecord.builder()
                .request(request)
                .student(student)
                .counselor(counselor)
                .counselingType(requestDto.getCounselingType())
                .subject(requestDto.getSubject())
                .content(requestDto.getContent())
                .outcome(requestDto.getOutcome())
                .followUp(requestDto.getFollowUp())
                .counseledAt(requestDto.getCounseledAt())
                .isNotified(false)
                .isConfidential(requestDto.getIsConfidential() != null ? requestDto.getIsConfidential() : false)
                .build();

        recordRepository.save(record);
        return CounselingRecordResponse.from(record);
    }

    @Transactional(readOnly = true)
    public Page<CounselingRecordResponse> getRecords(Long userId, String role, Long studentId, String counselingType, String from, String to, Pageable pageable) {
        List<CounselingRecord> records;
        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));
            records = recordRepository.findByStudentIdAndIsConfidentialFalseOrderByCounseledAtDesc(student.getId());
        } else {
            records = recordRepository.findAll();
            if (studentId != null) {
                records = records.stream().filter(r -> r.getStudent().getId().equals(studentId)).collect(Collectors.toList());
            }
        }

        if (counselingType != null && !counselingType.isEmpty()) {
            records = records.stream().filter(r -> r.getCounselingType().equals(counselingType)).collect(Collectors.toList());
        }

        records.sort((a, b) -> b.getCounseledAt().compareTo(a.getCounseledAt()));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), records.size());
        List<CounselingRecordResponse> content = records.subList(start, end).stream()
                .map(CounselingRecordResponse::from).collect(Collectors.toList());

        return new PageImpl<>(content, pageable, records.size());
    }

    @Transactional(readOnly = true)
    public CounselingRecordResponse getRecord(Long recordId, Long userId, String role) {
        CounselingRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "상담 기록을 찾을 수 없습니다."));

        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));
            if (!record.getStudent().getId().equals(student.getId()) || record.getIsConfidential()) {
                throw new CustomException(ErrorCode.FORBIDDEN, "접근 권한이 없습니다.");
            }
        }

        return CounselingRecordResponse.from(record);
    }

    @Transactional
    public CounselingRecordResponse updateRecord(Long recordId, CounselingRecordUpdateRequest request) {
        CounselingRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "상담 기록을 찾을 수 없습니다."));

        if (request.getSubject() != null) record.setSubject(request.getSubject());
        if (request.getContent() != null) record.setContent(request.getContent());
        if (request.getOutcome() != null) record.setOutcome(request.getOutcome());
        if (request.getFollowUp() != null) record.setFollowUp(request.getFollowUp());

        return CounselingRecordResponse.from(record);
    }

    @Transactional
    public void notifyStudent(Long recordId) {
        CounselingRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "상담 기록을 찾을 수 없습니다."));

        // 이메일 발송 더미 로직
        log.info("============== 이메일 발송 (DUMMY) ==============");
        log.info("수신자: {}", record.getStudent().getUser().getEmail());
        log.info("제목: [상담 결과 안내] {}", record.getSubject());
        log.info("내용:\n{}\n\n결과: {}", record.getContent(), record.getOutcome());
        log.info("================================================");

        record.setIsNotified(true);
    }
}
