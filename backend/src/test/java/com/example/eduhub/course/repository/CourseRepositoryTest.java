package com.example.eduhub.course.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

// 로컬 PostgreSQL 테스트 DB(.env의 TEST_DB_*)에 Flyway 마이그레이션을 적용해 돌린다 (H2로 바꾸지 않는다)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class CourseRepositoryTest {

  @Autowired private CourseRepository courseRepository;
  @Autowired private EntityManager em;

  @Test
  @DisplayName("과정과 회차를 저장하면 다시 조회했을 때 같은 값과 OPEN 상태가 나온다")
  void saveAndFindCourseWithSessions() {
    Course course = Course.create("JPA 기초", "개발", "엔티티와 연관관계 매핑");
    course.addSession(LocalDate.of(2026, 12, 1), "본사 3층 교육장", 20);
    course.addSession(LocalDate.of(2026, 12, 15), "온라인", 50);
    Long id = courseRepository.save(course).getId();
    em.flush();
    em.clear();

    Course found = courseRepository.findById(id).orElseThrow();

    assertThat(found.getTitle()).isEqualTo("JPA 기초");
    assertThat(found.getCategory()).isEqualTo("개발");
    assertThat(found.getDescription()).isEqualTo("엔티티와 연관관계 매핑");
    assertThat(found.getStatus()).isEqualTo(CourseStatus.OPEN);
    assertThat(found.getSessions())
        .extracting(
            CourseSession::getStartDate,
            CourseSession::getPlace,
            CourseSession::getCapacity,
            CourseSession::getStatus)
        .containsExactlyInAnyOrder(
            tuple(LocalDate.of(2026, 12, 1), "본사 3층 교육장", 20, CourseSessionStatus.OPEN),
            tuple(LocalDate.of(2026, 12, 15), "온라인", 50, CourseSessionStatus.OPEN));
  }
}
