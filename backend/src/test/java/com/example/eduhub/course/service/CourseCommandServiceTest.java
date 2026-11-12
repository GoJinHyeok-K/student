package com.example.eduhub.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.eduhub.common.exception.ConflictException;
import com.example.eduhub.common.exception.NotFoundException;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseRequest;
import com.example.eduhub.course.dto.SessionRequest;
import com.example.eduhub.course.dto.SessionResponse;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

// 로컬 PostgreSQL 테스트 DB에서 등록·수정·종료가 저장되는지 확인한다 (FR-03, NFR-05 커버리지).
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({CourseCommandService.class, CourseQueryService.class})
class CourseCommandServiceTest {

  private static final LocalDate DAY = LocalDate.of(2026, 12, 1);

  @Autowired private CourseCommandService commandService;
  @Autowired private CourseQueryService queryService;
  @Autowired private EntityManager em;

  private Long createCourse() {
    return commandService.createCourse(new CourseRequest("JPA 기초", "개발", "설명")).id();
  }

  /** 1차 캐시를 비워 DB에 저장된 값을 다시 읽는다 */
  private CourseDetailResponse reload(Long courseId) {
    em.flush();
    em.clear();
    return queryService.getDetail(courseId);
  }

  @Test
  @DisplayName("등록: 앞뒤 공백을 지우고, 빈 소개는 null로 저장하며 모집 중 상태다")
  void createCourseTrimsAndOpens() {
    CourseDetailResponse created =
        commandService.createCourse(new CourseRequest("  JPA 기초 ", " 개발", "  "));

    CourseDetailResponse saved = reload(created.id());
    assertThat(saved.title()).isEqualTo("JPA 기초");
    assertThat(saved.category()).isEqualTo("개발");
    assertThat(saved.description()).isNull();
    assertThat(saved.status()).isEqualTo(CourseStatus.OPEN);
    assertThat(saved.sessions()).isEmpty();
  }

  @Test
  @DisplayName("수정: 제목·분류·소개가 저장된다")
  void updateCourse() {
    Long id = createCourse();

    commandService.updateCourse(id, new CourseRequest("JPA 심화", "데이터", "새 설명"));

    CourseDetailResponse saved = reload(id);
    assertThat(saved.title()).isEqualTo("JPA 심화");
    assertThat(saved.category()).isEqualTo("데이터");
    assertThat(saved.description()).isEqualTo("새 설명");
  }

  @Test
  @DisplayName("회차 추가·수정: id가 붙어 저장되고 바꾼 값이 저장된다")
  void addAndUpdateSession() {
    Long id = createCourse();

    SessionResponse added = commandService.addSession(id, new SessionRequest(DAY, " 본사 ", 20));
    assertThat(added.id()).isNotNull();
    assertThat(added.place()).isEqualTo("본사");

    commandService.updateSession(id, added.id(), new SessionRequest(DAY.plusDays(7), "온라인", 40));

    SessionResponse saved = reload(id).sessions().getFirst();
    assertThat(saved.startDate()).isEqualTo(DAY.plusDays(7));
    assertThat(saved.place()).isEqualTo("온라인");
    assertThat(saved.capacity()).isEqualTo(40);
  }

  @Test
  @DisplayName("회차 종료: 그 회차만 종료된다")
  void closeSession() {
    Long id = createCourse();
    SessionResponse a = commandService.addSession(id, new SessionRequest(DAY, "A", 10));
    commandService.addSession(id, new SessionRequest(DAY.plusDays(1), "B", 10));

    SessionResponse closed = commandService.closeSession(id, a.id());

    assertThat(closed.status()).isEqualTo(CourseSessionStatus.CLOSED);
    assertThat(reload(id).sessions())
        .extracting(SessionResponse::status)
        .containsExactly(CourseSessionStatus.CLOSED, CourseSessionStatus.OPEN);
  }

  @Test
  @DisplayName("과정 종료: 과정과 회차가 모두 종료되고, 이후 수정·회차 추가는 ConflictException")
  void closeCourseThenRejectChanges() {
    Long id = createCourse();
    commandService.addSession(id, new SessionRequest(DAY, "A", 10));

    CourseDetailResponse closed = commandService.closeCourse(id);

    assertThat(closed.status()).isEqualTo(CourseStatus.CLOSED);
    CourseDetailResponse saved = reload(id);
    assertThat(saved.status()).isEqualTo(CourseStatus.CLOSED);
    assertThat(saved.sessions())
        .allSatisfy(s -> assertThat(s.status()).isEqualTo(CourseSessionStatus.CLOSED));
    assertThatThrownBy(() -> commandService.updateCourse(id, new CourseRequest("x", "개발", null)))
        .isInstanceOf(ConflictException.class);
    assertThatThrownBy(() -> commandService.addSession(id, new SessionRequest(DAY, "B", 10)))
        .isInstanceOf(ConflictException.class);
  }

  @Test
  @DisplayName("없는 과정이나 다른 과정의 회차를 고르면 NotFoundException")
  void notFound() {
    Long id = createCourse();
    Long other = createCourse();
    SessionResponse otherSession =
        commandService.addSession(other, new SessionRequest(DAY, "A", 10));

    assertThatThrownBy(() -> commandService.closeCourse(Long.MAX_VALUE))
        .isInstanceOf(NotFoundException.class);
    assertThatThrownBy(() -> commandService.closeSession(id, otherSession.id()))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("sessionId=" + otherSession.id());
  }
}
