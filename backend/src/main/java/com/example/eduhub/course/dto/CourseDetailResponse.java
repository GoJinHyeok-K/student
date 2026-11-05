package com.example.eduhub.course.dto;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;
import java.util.List;

/**
 * 과정 상세 (FR-02).
 *
 * @param sessions 회차 목록 (시작일 순)
 */
public record CourseDetailResponse(
    Long id,
    String title,
    String category,
    String description,
    CourseStatus status,
    List<SessionResponse> sessions) {

  public static CourseDetailResponse of(Course course, List<SessionResponse> sessions) {
    return new CourseDetailResponse(
        course.getId(),
        course.getTitle(),
        course.getCategory(),
        course.getDescription(),
        course.getStatus(),
        sessions);
  }
}
