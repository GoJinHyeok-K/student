package com.example.eduhub.course.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.eduhub.common.exception.ConflictException;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// 과정·회차의 상태 규칙 (FR-03, D-06, D-10). DB 없이 돈다.
class CourseTest {

  private static final LocalDate DAY = LocalDate.of(2026, 12, 1);

  @Test
  @DisplayName("과정을 수정하면 제목·분류·소개가 바뀐다")
  void updateChangesFields() {
    Course course = Course.create("JPA", "개발", "설명");

    course.update("JPA 심화", "데이터", null);

    assertThat(course.getTitle()).isEqualTo("JPA 심화");
    assertThat(course.getCategory()).isEqualTo("데이터");
    assertThat(course.getDescription()).isNull();
  }

  @Test
  @DisplayName("과정을 종료하면 모집 중인 회차도 모두 종료된다")
  void closeClosesSessions() {
    Course course = Course.create("JPA", "개발", null);
    CourseSession a = course.addSession(DAY, "A", 10);
    CourseSession b = course.addSession(DAY.plusDays(7), "B", 10);

    course.close();

    assertThat(course.getStatus()).isEqualTo(CourseStatus.CLOSED);
    assertThat(a.getStatus()).isEqualTo(CourseSessionStatus.CLOSED);
    assertThat(b.getStatus()).isEqualTo(CourseSessionStatus.CLOSED);
  }

  @Test
  @DisplayName("이미 종료된 과정을 다시 종료해도 오류 없이 종료 상태로 남는다")
  void closeIsIdempotent() {
    Course course = Course.create("JPA", "개발", null);
    course.close();

    course.close();

    assertThat(course.isClosed()).isTrue();
  }

  @Test
  @DisplayName("종료된 과정은 수정하거나 회차를 추가할 수 없다")
  void closedCourseRejectsChanges() {
    Course course = Course.create("JPA", "개발", null);
    course.close();

    assertThatThrownBy(() -> course.update("x", "개발", null)).isInstanceOf(ConflictException.class);
    assertThatThrownBy(() -> course.addSession(DAY, "A", 10)).isInstanceOf(ConflictException.class);
    assertThat(course.getSessions()).isEmpty();
  }

  @Test
  @DisplayName("회차를 수정하면 시작일·장소·정원이 바뀐다")
  void sessionUpdateChangesFields() {
    CourseSession session = Course.create("JPA", "개발", null).addSession(DAY, "A", 10);

    session.update(DAY.plusDays(1), "B", 30);

    assertThat(session.getStartDate()).isEqualTo(DAY.plusDays(1));
    assertThat(session.getPlace()).isEqualTo("B");
    assertThat(session.getCapacity()).isEqualTo(30);
  }

  @Test
  @DisplayName("종료된 회차는 수정할 수 없다")
  void closedSessionRejectsUpdate() {
    CourseSession session = Course.create("JPA", "개발", null).addSession(DAY, "A", 10);
    session.close();

    assertThatThrownBy(() -> session.update(DAY, "B", 10)).isInstanceOf(ConflictException.class);
    assertThat(session.getPlace()).isEqualTo("A");
  }

  @Test
  @DisplayName("정원이 1 미만이면 회차를 만들거나 바꿀 수 없다")
  void capacityMustBePositive() {
    Course course = Course.create("JPA", "개발", null);
    CourseSession session = course.addSession(DAY, "A", 10);

    assertThatThrownBy(() -> course.addSession(DAY, "A", 0))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> session.update(DAY, "A", 0))
        .isInstanceOf(IllegalArgumentException.class);
    assertThat(session.getCapacity()).isEqualTo(10);
  }
}
