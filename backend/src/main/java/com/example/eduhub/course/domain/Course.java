package com.example.eduhub.course.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * 교육과정 (FR-01~03). 회차는 과정을 통해서만 추가한다.
 *
 * <p>setter를 두지 않는다. 상태는 {@link #close()}로만 바꾼다.
 */
@Entity
@Table(name = "course")
public class Course {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 50)
  private String category;

  @Column(columnDefinition = "text")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CourseStatus status;

  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<CourseSession> sessions = new ArrayList<>();

  protected Course() {}

  private Course(String title, String category, String description) {
    this.title = Objects.requireNonNull(title, "title");
    this.category = Objects.requireNonNull(category, "category");
    this.description = description;
    this.status = CourseStatus.OPEN;
  }

  /** 모집 중(OPEN) 상태의 과정을 만든다. */
  public static Course create(String title, String category, String description) {
    return new Course(title, category, description);
  }

  /** 회차를 추가하고 추가한 회차를 돌려준다. */
  public CourseSession addSession(LocalDate startDate, String place, int capacity) {
    CourseSession session = new CourseSession(this, startDate, place, capacity);
    sessions.add(session);
    return session;
  }

  /** 과정을 종료한다 (FR-03). */
  public void close() {
    this.status = CourseStatus.CLOSED;
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getCategory() {
    return category;
  }

  public String getDescription() {
    return description;
  }

  public CourseStatus getStatus() {
    return status;
  }

  /** 지연 로딩되므로 트랜잭션 안에서만 읽는다 (NFR-02). */
  public List<CourseSession> getSessions() {
    return Collections.unmodifiableList(sessions);
  }
}
