package com.example.eduhub.course.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.common.web.PageResponse;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseSummaryResponse;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.service.CourseQueryService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

  @Autowired private MockMvcTester mvc;
  @MockitoBean private CourseQueryService courseQueryService;

  @Test
  @DisplayName("목록: keyword, category, page, size를 서비스에 넘기고 PageResponse 형식으로 돌려준다")
  void searchPassesConditionsAndReturnsPage() {
    given(courseQueryService.search(eq("jpa"), eq("개발"), any(Pageable.class)))
        .willReturn(
            new PageResponse<>(
                List.of(new CourseSummaryResponse(7L, "JPA 기초", "개발", CourseStatus.OPEN, 2)),
                1,
                5,
                6));

    assertThat(
            mvc.get()
                .uri("/api/v1/courses")
                .param("keyword", "jpa")
                .param("category", "개발")
                .param("page", "1")
                .param("size", "5"))
        .hasStatusOk()
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"content":[{"id":7,"title":"JPA 기초","category":"개발","status":"OPEN","sessionCount":2}],
             "page":1,"size":5,"totalElements":6}
            """);

    ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
    verify(courseQueryService).search(eq("jpa"), eq("개발"), pageable.capture());
    assertThat(pageable.getValue().getPageNumber()).isEqualTo(1);
    assertThat(pageable.getValue().getPageSize()).isEqualTo(5);
  }

  @Test
  @DisplayName("목록: 파라미터가 없으면 page 0, size 20, id 내림차순으로 조회한다")
  void searchUsesDefaultPageable() {
    given(courseQueryService.search(isNull(), isNull(), any(Pageable.class)))
        .willReturn(new PageResponse<>(List.of(), 0, 20, 0));

    assertThat(mvc.get().uri("/api/v1/courses")).hasStatusOk();

    ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
    verify(courseQueryService).search(isNull(), isNull(), pageable.capture());
    assertThat(pageable.getValue().getPageNumber()).isZero();
    assertThat(pageable.getValue().getPageSize()).isEqualTo(20);
    assertThat(pageable.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "id"));
  }

  @Test
  @DisplayName("상세: 200과 함께 회차 목록과 남은 자리를 돌려준다")
  void getDetailReturnsSessions() {
    given(courseQueryService.getDetail(7L))
        .willReturn(
            new CourseDetailResponse(
                7L,
                "JPA 기초",
                "개발",
                "엔티티와 연관관계 매핑",
                CourseStatus.OPEN,
                List.of(
                    new SessionResponse(
                        3L,
                        LocalDate.of(2026, 12, 1),
                        "본사 3층 교육장",
                        20,
                        20,
                        CourseSessionStatus.OPEN))));

    assertThat(mvc.get().uri("/api/v1/courses/7"))
        .hasStatusOk()
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"id":7,"title":"JPA 기초","category":"개발","description":"엔티티와 연관관계 매핑",
             "status":"OPEN",
             "sessions":[{"id":3,"startDate":"2026-12-01","place":"본사 3층 교육장",
                          "capacity":20,"remainingSeats":20,"status":"OPEN"}]}
            """);
  }

  @Test
  @DisplayName("상세: 없는 id는 404와 ProblemDetail 본문을 돌려준다")
  void getDetailReturns404WhenMissing() {
    given(courseQueryService.getDetail(99L))
        .willThrow(new NotFoundException("과정을 찾을 수 없습니다: id=99"));

    assertThat(mvc.get().uri("/api/v1/courses/99"))
        .hasStatus(HttpStatus.NOT_FOUND)
        .hasContentType(MediaType.APPLICATION_PROBLEM_JSON)
        .bodyJson()
        .isLenientlyEqualTo(
            """
            {"status":404,"title":"Not Found","detail":"과정을 찾을 수 없습니다: id=99"}
            """);
  }

  @Test
  @DisplayName("상세: id가 숫자가 아니면 400을 돌려준다")
  void getDetailReturns400WhenIdIsNotNumber() {
    assertThat(mvc.get().uri("/api/v1/courses/abc")).hasStatus(HttpStatus.BAD_REQUEST);
  }
}
