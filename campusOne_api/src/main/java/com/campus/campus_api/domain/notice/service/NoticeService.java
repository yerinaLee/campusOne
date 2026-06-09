package com.campus.campus_api.domain.notice.service;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.department.repository.DepartmentRepository;
import com.campus.campus_api.domain.notice.dto.NoticeCreateRequest;
import com.campus.campus_api.domain.notice.dto.NoticeDetailResponse;
import com.campus.campus_api.domain.notice.dto.NoticeListResponse;
import com.campus.campus_api.domain.notice.entity.Notice;
import com.campus.campus_api.domain.notice.repository.NoticeRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public Page<NoticeListResponse> getNotices(String category, Long departmentId, Pageable pageable) {
        return noticeRepository.findAllByFilter(category, departmentId, pageable)
                .map(NoticeListResponse::from);
    }

    @Transactional
    public NoticeDetailResponse getNotice(Long id) {
        noticeRepository.incrementViewCount(id);
        Notice notice = noticeRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));
        return NoticeDetailResponse.from(notice);
    }

    public NoticeDetailResponse createNotice(User user, NoticeCreateRequest request) {
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElse(null);
        }

        OffsetDateTime now = OffsetDateTime.now();
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .author(user)
                .department(department)
                .course(course)
                .isPinned(Boolean.TRUE.equals(request.getIsPinned()))
                .viewCount(0L)
                .createdBy(user.getId())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return NoticeDetailResponse.from(noticeRepository.save(notice));
    }
}
