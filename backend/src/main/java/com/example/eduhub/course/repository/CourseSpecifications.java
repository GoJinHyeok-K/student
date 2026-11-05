package com.example.eduhub.course.repository;

import com.example.eduhub.course.domain.Course;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * 과정 목록 검색 조건 (FR-01). 비어 있는 조건은 빼고 조립한다.
 *
 * <p>JPQL의 {@code :keyword is null or ...}는 PostgreSQL이 null 파라미터의 타입을 정하지 못해 실패하므로 쓰지 않는다.
 */
public final class CourseSpecifications {

  private static final char ESCAPE = '\\';

  private CourseSpecifications() {}

  /** 제목 부분 일치(대소문자 무시)와 분류 일치. 둘 다 비어 있으면 전체를 조회한다. */
  public static Specification<Course> search(String keyword, String category) {
    List<Specification<Course>> specs = new ArrayList<>();
    if (hasText(keyword)) {
      specs.add(titleContains(keyword.strip()));
    }
    if (hasText(category)) {
      specs.add(categoryEquals(category.strip()));
    }
    return Specification.allOf(specs);
  }

  private static Specification<Course> titleContains(String keyword) {
    String pattern = "%" + escapeLike(keyword.toLowerCase(Locale.ROOT)) + "%";
    return (root, query, cb) -> cb.like(cb.lower(root.get("title")), pattern, ESCAPE);
  }

  private static Specification<Course> categoryEquals(String category) {
    return (root, query, cb) -> cb.equal(root.get("category"), category);
  }

  private static String escapeLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }

  private static boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}
