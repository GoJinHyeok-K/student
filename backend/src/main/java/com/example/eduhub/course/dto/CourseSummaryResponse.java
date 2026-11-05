package com.example.eduhub.course.dto;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;

/**
 * 과정 목록의 한 항목 (FR-01). 회차 자체는 담지 않고 회차 수만 담는다.
 *
 * @param sessionCount 회차 수 (종료된 회차 포함)
 */
public record CourseSummaryResponse(
    Long id, String title, String category, CourseStatus status, long sessionCount) {

  public static CourseSummaryResponse of(Course course, long sessionCount) {
    return new CourseSummaryResponse(
        course.getId(), course.getTitle(), course.getCategory(), course.getStatus(), sessionCount);
  }
}
