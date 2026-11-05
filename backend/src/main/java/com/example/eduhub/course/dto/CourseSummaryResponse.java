package com.example.eduhub.course.dto;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;

/** 과정 목록의 한 항목 (FR-01). 회차는 담지 않는다. */
public record CourseSummaryResponse(Long id, String title, String category, CourseStatus status) {

  public static CourseSummaryResponse from(Course course) {
    return new CourseSummaryResponse(
        course.getId(), course.getTitle(), course.getCategory(), course.getStatus());
  }
}
