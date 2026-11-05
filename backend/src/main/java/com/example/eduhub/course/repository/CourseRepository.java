package com.example.eduhub.course.repository;

import com.example.eduhub.course.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;

/** 교육과정 저장소. 회차는 {@link Course}를 통해 함께 저장된다. */
public interface CourseRepository extends JpaRepository<Course, Long> {}
