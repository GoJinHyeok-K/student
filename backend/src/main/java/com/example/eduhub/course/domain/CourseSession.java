package com.example.eduhub.course.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.Objects;

/**
 * 교육과정의 회차 (FR-02, FR-03). {@link Course#addSession}으로만 만든다.
 *
 * <p>setter를 두지 않는다. 상태는 {@link #close()}로만 바꾼다.
 */
@Entity
@Table(name = "course_session")
public class CourseSession {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // NFR-02: N:1은 지연 로딩
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(nullable = false, length = 100)
  private String place;

  @Column(nullable = false)
  private int capacity;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CourseSessionStatus status;

  protected CourseSession() {}

  CourseSession(Course course, LocalDate startDate, String place, int capacity) {
    if (capacity <= 0) {
      throw new IllegalArgumentException("정원은 1명 이상이어야 한다: " + capacity);
    }
    this.course = Objects.requireNonNull(course, "course");
    this.startDate = Objects.requireNonNull(startDate, "startDate");
    this.place = Objects.requireNonNull(place, "place");
    this.capacity = capacity;
    this.status = CourseSessionStatus.OPEN;
  }

  /** 회차를 종료한다 (FR-03). */
  public void close() {
    this.status = CourseSessionStatus.CLOSED;
  }

  public Long getId() {
    return id;
  }

  public Course getCourse() {
    return course;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public String getPlace() {
    return place;
  }

  public int getCapacity() {
    return capacity;
  }

  public CourseSessionStatus getStatus() {
    return status;
  }
}
