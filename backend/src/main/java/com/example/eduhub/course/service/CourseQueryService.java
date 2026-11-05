package com.example.eduhub.course.service;

import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.common.web.PageResponse;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseSummaryResponse;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.repository.CourseRepository;
import com.example.eduhub.course.repository.CourseSpecifications;
import com.example.eduhub.course.repository.SessionCount;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 과정 조회 (FR-01, FR-02).
 *
 * <p>open-in-view가 꺼져 있으므로 DTO 변환은 이 트랜잭션 안에서 끝낸다 (NFR-02).
 */
@Service
@Transactional(readOnly = true)
public class CourseQueryService {

  private final CourseRepository courseRepository;

  public CourseQueryService(CourseRepository courseRepository) {
    this.courseRepository = courseRepository;
  }

  /**
   * 제목 keyword(부분 일치)와 category(일치)로 과정 목록을 검색한다. 조건은 생략할 수 있다.
   *
   * <p>회차 수는 현재 페이지의 과정들에 대해 쿼리 한 번으로 센다 (NFR-02, N+1 방지).
   */
  public PageResponse<CourseSummaryResponse> search(
      String keyword, String category, Pageable pageable) {
    Page<Course> courses =
        courseRepository.findAll(CourseSpecifications.search(keyword, category), pageable);
    Map<Long, Long> sessionCounts = countSessions(courses.getContent());
    return PageResponse.from(
        courses.map(c -> CourseSummaryResponse.of(c, sessionCounts.getOrDefault(c.getId(), 0L))));
  }

  private Map<Long, Long> countSessions(List<Course> courses) {
    if (courses.isEmpty()) {
      return Map.of();
    }
    List<Long> ids = courses.stream().map(Course::getId).toList();
    return courseRepository.countSessionsByCourseIds(ids).stream()
        .collect(Collectors.toMap(SessionCount::getCourseId, SessionCount::getSessionCount));
  }

  /** 과정 상세와 회차 목록(시작일 순)을 조회한다. 없으면 {@link NotFoundException}. */
  public CourseDetailResponse getDetail(Long id) {
    var course =
        courseRepository
            .findWithSessionsById(id)
            .orElseThrow(() -> new NotFoundException("과정을 찾을 수 없습니다: id=" + id));
    List<SessionResponse> sessions =
        course.getSessions().stream()
            .sorted(
                Comparator.comparing(CourseSession::getStartDate)
                    .thenComparing(CourseSession::getId))
            .map(SessionResponse::from)
            .toList();
    return CourseDetailResponse.of(course, sessions);
  }
}
