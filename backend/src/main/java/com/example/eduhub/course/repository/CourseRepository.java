package com.example.eduhub.course.repository;

import com.example.eduhub.course.domain.Course;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** 교육과정 저장소. 회차는 {@link Course}를 통해 함께 저장된다. */
public interface CourseRepository
    extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

  /** 회차를 한 번에 불러온다 (NFR-02, N+1 방지). */
  @EntityGraph(attributePaths = "sessions")
  Optional<Course> findWithSessionsById(Long id);

  /** 여러 과정의 회차 수를 쿼리 한 번으로 센다 (NFR-02, N+1 방지). 회차가 없는 과정은 결과에 없다. */
  @Query(
      """
      select s.course.id as courseId, count(s) as sessionCount
      from CourseSession s
      where s.course.id in :courseIds
      group by s.course.id
      """)
  List<SessionCount> countSessionsByCourseIds(@Param("courseIds") Collection<Long> courseIds);
}
