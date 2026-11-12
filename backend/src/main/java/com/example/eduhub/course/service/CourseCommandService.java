package com.example.eduhub.course.service;

import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseRequest;
import com.example.eduhub.course.dto.SessionRequest;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.repository.CourseRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자의 과정·회차 등록, 수정, 종료 (FR-03).
 *
 * <p>상태 규칙(종료된 과정·회차는 바꿀 수 없음 등)은 엔티티가 검사하고, 이 서비스는 조회와 트랜잭션만 맡는다 (D-06, D-10).
 */
@Service
@Transactional
public class CourseCommandService {

  private final CourseRepository courseRepository;
  private final CourseQueryService courseQueryService;

  public CourseCommandService(
      CourseRepository courseRepository, CourseQueryService courseQueryService) {
    this.courseRepository = courseRepository;
    this.courseQueryService = courseQueryService;
  }

  /** 모집 중(OPEN) 과정을 등록하고 등록한 과정을 돌려준다. 회차는 따로 추가한다. */
  public CourseDetailResponse createCourse(CourseRequest request) {
    Course course =
        Course.create(
            request.trimmedTitle(), request.trimmedCategory(), request.normalizedDescription());
    return CourseDetailResponse.of(courseRepository.save(course), List.of());
  }

  /** 과정의 제목·분류·소개를 바꾸고 바뀐 상세를 돌려준다. */
  public CourseDetailResponse updateCourse(Long courseId, CourseRequest request) {
    findCourse(courseId)
        .update(request.trimmedTitle(), request.trimmedCategory(), request.normalizedDescription());
    return courseQueryService.getDetail(courseId);
  }

  /** 과정과 모집 중인 회차를 모두 종료하고 상세를 돌려준다. */
  public CourseDetailResponse closeCourse(Long courseId) {
    findCourse(courseId).close();
    return courseQueryService.getDetail(courseId);
  }

  /** 회차를 추가하고 추가한 회차를 돌려준다. */
  public SessionResponse addSession(Long courseId, SessionRequest request) {
    CourseSession session =
        findCourse(courseId)
            .addSession(request.startDate(), request.trimmedPlace(), request.capacity());
    courseRepository.flush(); // id를 받아 응답에 담는다
    return SessionResponse.from(session);
  }

  /** 회차의 시작일·장소·정원을 바꾼다. */
  public SessionResponse updateSession(Long courseId, Long sessionId, SessionRequest request) {
    CourseSession session = findSession(courseId, sessionId);
    session.update(request.startDate(), request.trimmedPlace(), request.capacity());
    return SessionResponse.from(session);
  }

  /** 회차를 종료한다. */
  public SessionResponse closeSession(Long courseId, Long sessionId) {
    CourseSession session = findSession(courseId, sessionId);
    session.close();
    return SessionResponse.from(session);
  }

  private Course findCourse(Long courseId) {
    return courseRepository
        .findWithSessionsById(courseId)
        .orElseThrow(() -> new NotFoundException("과정을 찾을 수 없습니다: id=" + courseId));
  }

  private CourseSession findSession(Long courseId, Long sessionId) {
    return findCourse(courseId)
        .findSession(sessionId)
        .orElseThrow(
            () ->
                new NotFoundException(
                    "회차를 찾을 수 없습니다: courseId=" + courseId + ", sessionId=" + sessionId));
  }
}
