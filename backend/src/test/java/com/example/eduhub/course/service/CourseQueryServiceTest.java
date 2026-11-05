package com.example.eduhub.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.common.web.PageResponse;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseSummaryResponse;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.repository.CourseRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

// 로컬 PostgreSQL 테스트 DB에서 Service의 DTO 변환과 예외를 확인한다 (NFR-05 커버리지).
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(CourseQueryService.class)
class CourseQueryServiceTest {

  @Autowired private CourseQueryService courseQueryService;
  @Autowired private CourseRepository courseRepository;
  @Autowired private EntityManager em;

  @Test
  @DisplayName("목록 결과를 PageResponse<CourseSummaryResponse>로 바꾼다")
  void searchReturnsPageResponse() {
    Course course = courseRepository.save(Course.create("서비스 테스트 과정 QX7", "개발", null));
    em.flush();
    em.clear();

    PageResponse<CourseSummaryResponse> result =
        courseQueryService.search("qx7", "개발", PageRequest.of(0, 10));

    assertThat(result.content())
        .containsExactly(
            new CourseSummaryResponse(course.getId(), "서비스 테스트 과정 QX7", "개발", CourseStatus.OPEN));
    assertThat(result.page()).isZero();
    assertThat(result.size()).isEqualTo(10);
    assertThat(result.totalElements()).isEqualTo(1);
  }

  @Test
  @DisplayName("상세: 회차는 시작일 순이고 남은 자리는 정원과 같다")
  void getDetailSortsSessionsAndSetsRemainingSeats() {
    Course course = Course.create("JPA 기초", "개발", "설명");
    course.addSession(LocalDate.of(2026, 12, 15), "온라인", 50);
    course.addSession(LocalDate.of(2026, 12, 1), "본사 3층 교육장", 20);
    Long id = courseRepository.save(course).getId();
    em.flush();
    em.clear();

    CourseDetailResponse detail = courseQueryService.getDetail(id);

    assertThat(detail.title()).isEqualTo("JPA 기초");
    assertThat(detail.description()).isEqualTo("설명");
    assertThat(detail.sessions())
        .extracting(SessionResponse::startDate)
        .containsExactly(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 15));
    assertThat(detail.sessions())
        .allSatisfy(s -> assertThat(s.remainingSeats()).isEqualTo(s.capacity()));
  }

  @Test
  @DisplayName("상세: 없는 id는 NotFoundException을 던진다")
  void getDetailThrowsWhenMissing() {
    assertThatThrownBy(() -> courseQueryService.getDetail(Long.MAX_VALUE))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("id=" + Long.MAX_VALUE);
  }
}
