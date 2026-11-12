package com.example.eduhub.course.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.example.eduhub.common.exception.ConflictException;
import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseRequest;
import com.example.eduhub.course.dto.SessionRequest;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.service.CourseCommandService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(CourseAdminController.class)
class CourseAdminControllerTest {

  @Autowired private MockMvcTester mvc;
  @MockitoBean private CourseCommandService courseCommandService;

  private static final SessionResponse SESSION =
      new SessionResponse(3L, LocalDate.of(2026, 12, 1), "본사", 20, 20, CourseSessionStatus.OPEN);

  @Test
  @DisplayName("과정 등록: 201과 Location, 등록한 과정을 돌려준다")
  void createCourseReturns201() {
    given(courseCommandService.createCourse(new CourseRequest("JPA 기초", "개발", "설명")))
        .willReturn(
            new CourseDetailResponse(7L, "JPA 기초", "개발", "설명", CourseStatus.OPEN, List.of()));

    assertThat(
            mvc.post()
                .uri("/api/v1/admin/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"title":"JPA 기초","category":"개발","description":"설명"}
                    """))
        .hasStatus(HttpStatus.CREATED)
        .hasHeader("Location", "/api/v1/courses/7")
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"id":7,"title":"JPA 기초","status":"OPEN","sessions":[]}
            """);
  }

  @Test
  @DisplayName("과정 등록: 제목이 비어 있으면 400 ProblemDetail을 돌려주고 서비스를 부르지 않는다")
  void createCourseRejectsBlankTitle() {
    assertThat(
            mvc.post()
                .uri("/api/v1/admin/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"title":" ","category":"개발"}
                    """))
        .hasStatus(HttpStatus.BAD_REQUEST)
        .hasContentType(MediaType.APPLICATION_PROBLEM_JSON);
    verifyNoInteractions(courseCommandService);
  }

  @Test
  @DisplayName("과정 수정: 종료된 과정이면 409 ProblemDetail을 돌려준다")
  void updateCourseReturns409WhenClosed() {
    given(courseCommandService.updateCourse(any(), any()))
        .willThrow(new ConflictException("종료된 과정은 바꿀 수 없습니다: id=7"));

    assertThat(
            mvc.put()
                .uri("/api/v1/admin/courses/7")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"title":"JPA","category":"개발"}
                    """))
        .hasStatus(HttpStatus.CONFLICT)
        .hasContentType(MediaType.APPLICATION_PROBLEM_JSON)
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"status":409,"detail":"종료된 과정은 바꿀 수 없습니다: id=7"}
            """);
  }

  @Test
  @DisplayName("과정 종료: 서비스를 부르고 종료된 상세를 돌려준다")
  void closeCourse() {
    given(courseCommandService.closeCourse(7L))
        .willReturn(
            new CourseDetailResponse(7L, "JPA", "개발", null, CourseStatus.CLOSED, List.of()));

    assertThat(mvc.post().uri("/api/v1/admin/courses/7/close"))
        .hasStatusOk()
        .bodyJson()
        .isLenientlyEqualTo("{\"status\":\"CLOSED\"}");
    verify(courseCommandService).closeCourse(7L);
  }

  @Test
  @DisplayName("회차 추가: 201과 추가한 회차를 돌려준다")
  void addSessionReturns201() {
    given(
            courseCommandService.addSession(
                7L, new SessionRequest(LocalDate.of(2026, 12, 1), "본사", 20)))
        .willReturn(SESSION);

    assertThat(
            mvc.post()
                .uri("/api/v1/admin/courses/7/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"startDate":"2026-12-01","place":"본사","capacity":20}
                    """))
        .hasStatus(HttpStatus.CREATED)
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"id":3,"startDate":"2026-12-01","place":"본사","capacity":20,"status":"OPEN"}
            """);
  }

  @Test
  @DisplayName("회차 추가: 정원이 0이거나 시작일이 없으면 400을 돌려준다")
  void addSessionValidatesInput() {
    assertThat(
            mvc.post()
                .uri("/api/v1/admin/courses/7/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"place":"본사","capacity":0}
                    """))
        .hasStatus(HttpStatus.BAD_REQUEST);
    verifyNoInteractions(courseCommandService);
  }

  @Test
  @DisplayName("회차 수정: 수정한 회차를 돌려준다")
  void updateSession() {
    given(courseCommandService.updateSession(any(), any(), any())).willReturn(SESSION);

    assertThat(
            mvc.put()
                .uri("/api/v1/admin/courses/7/sessions/3")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"startDate":"2026-12-01","place":"본사","capacity":20}
                    """))
        .hasStatusOk();
    verify(courseCommandService)
        .updateSession(7L, 3L, new SessionRequest(LocalDate.of(2026, 12, 1), "본사", 20));
  }

  @Test
  @DisplayName("회차 종료: 없는 회차면 404를 돌려준다")
  void closeSessionReturns404() {
    given(courseCommandService.closeSession(7L, 99L))
        .willThrow(new NotFoundException("회차를 찾을 수 없습니다"));

    assertThat(mvc.post().uri("/api/v1/admin/courses/7/sessions/99/close"))
        .hasStatus(HttpStatus.NOT_FOUND);
  }
}
