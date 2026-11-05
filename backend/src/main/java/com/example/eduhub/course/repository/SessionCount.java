package com.example.eduhub.course.repository;

/** 과정별 회차 수 집계 결과 (FR-01 목록의 회차 수). */
public interface SessionCount {

  Long getCourseId();

  long getSessionCount();
}
