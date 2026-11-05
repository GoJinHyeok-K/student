package com.example.eduhub.course.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.eduhub.course.domain.Course;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

// 로컬 PostgreSQL 테스트 DB(.env의 TEST_DB_*)에서 검색 조건(FR-01)을 확인한다. 각 테스트는 롤백된다.
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class CourseSearchTest {

  private static final Pageable FIRST_PAGE = PageRequest.of(0, 20, Sort.by("id"));

  @Autowired private CourseRepository courseRepository;
  @Autowired private EntityManager em;

  private long existing;

  @BeforeEach
  void setUp() {
    existing = courseRepository.count();
    courseRepository.save(Course.create("JPA 기초", "개발", null));
    courseRepository.save(Course.create("Spring Data jpa 심화", "개발", null));
    courseRepository.save(Course.create("JPA로 보는 데이터 모델링", "데이터", null));
    courseRepository.save(Course.create("리더십 101", "리더십", null));
    em.flush();
    em.clear();
  }

  private Page<Course> search(String keyword, String category, Pageable pageable) {
    return courseRepository.findAll(CourseSpecifications.search(keyword, category), pageable);
  }

  @Test
  @DisplayName("제목 일부로 검색되고 대소문자를 구분하지 않는다")
  void searchByKeywordIgnoringCase() {
    assertThat(search("jpa", null, FIRST_PAGE).getContent())
        .extracting(Course::getTitle)
        .contains("JPA 기초", "Spring Data jpa 심화", "JPA로 보는 데이터 모델링")
        .doesNotContain("리더십 101");
  }

  @Test
  @DisplayName("분류가 정확히 같은 과정만 나온다")
  void searchByCategory() {
    assertThat(search(null, "리더십", FIRST_PAGE).getContent())
        .extracting(Course::getCategory)
        .isNotEmpty()
        .containsOnly("리더십");
  }

  @Test
  @DisplayName("제목과 분류를 함께 주면 둘 다 맞는 과정만 나온다")
  void searchByKeywordAndCategory() {
    assertThat(search("JPA", "데이터", FIRST_PAGE).getContent())
        .extracting(Course::getTitle)
        .contains("JPA로 보는 데이터 모델링")
        .doesNotContain("JPA 기초", "Spring Data jpa 심화");
  }

  @Test
  @DisplayName("조건이 없으면 전체가 나오고 페이지 크기와 전체 수가 맞는다")
  void searchWithoutConditionPages() {
    Page<Course> page = search(null, " ", PageRequest.of(0, 2, Sort.by("id")));

    assertThat(page.getContent()).hasSize(2);
    assertThat(page.getSize()).isEqualTo(2);
    assertThat(page.getTotalElements()).isEqualTo(existing + 4);
  }

  @Test
  @DisplayName("검색어의 %와 _는 와일드카드가 아니라 글자로 찾는다")
  void keywordWildcardsAreEscaped() {
    assertThat(search("%", null, FIRST_PAGE).getContent())
        .extracting(Course::getTitle)
        .doesNotContain("JPA 기초", "리더십 101");
  }

  @Test
  @DisplayName("findWithSessionsById는 회차를 함께 불러온다")
  void findWithSessionsLoadsSessions() {
    Course course = Course.create("회차 있는 과정", "개발", null);
    course.addSession(LocalDate.of(2026, 12, 1), "온라인", 10);
    Long id = courseRepository.save(course).getId();
    em.flush();
    em.clear();

    Course found = courseRepository.findWithSessionsById(id).orElseThrow();

    assertThat(em.getEntityManagerFactory().getPersistenceUnitUtil().isLoaded(found, "sessions"))
        .isTrue();
    assertThat(found.getSessions()).hasSize(1);
  }
}
