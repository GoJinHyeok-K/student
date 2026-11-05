package com.example.eduhub.course.repository;

import com.example.eduhub.course.domain.Course;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 교육과정 저장소. 회차는 {@link Course}를 통해 함께 저장된다. */
public interface CourseRepository
    extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

  /** 회차를 한 번에 불러온다 (NFR-02, N+1 방지). */
  @EntityGraph(attributePaths = "sessions")
  Optional<Course> findWithSessionsById(Long id);
}
