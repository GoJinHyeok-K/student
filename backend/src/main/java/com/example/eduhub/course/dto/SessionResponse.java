package com.example.eduhub.course.dto;

import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.domain.CourseSessionStatus;
import java.time.LocalDate;

/**
 * 과정 상세의 회차 (FR-02).
 *
 * @param remainingSeats 남은 자리. 수강 신청(FR-04)이 생기기 전까지는 정원과 같다
 */
public record SessionResponse(
    Long id,
    LocalDate startDate,
    String place,
    int capacity,
    int remainingSeats,
    CourseSessionStatus status) {

  public static SessionResponse from(CourseSession session) {
    return new SessionResponse(
        session.getId(),
        session.getStartDate(),
        session.getPlace(),
        session.getCapacity(),
        session.getCapacity(),
        session.getStatus());
  }
}
