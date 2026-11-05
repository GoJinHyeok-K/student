package com.example.eduhub.course.controller;

import com.example.eduhub.common.web.PageResponse;
import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseSummaryResponse;
import com.example.eduhub.course.service.CourseQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 교육과정 조회 API (FR-01, FR-02). */
@Tag(name = "Course", description = "교육과정 조회")
@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

  private final CourseQueryService courseQueryService;

  public CourseController(CourseQueryService courseQueryService) {
    this.courseQueryService = courseQueryService;
  }

  // operationId는 생성 클라이언트의 메서드 이름이 된다 (courseApi.getCourses)
  @Operation(operationId = "getCourses", summary = "과정 목록 조회 (제목 검색, 분류 필터, 페이지)")
  @GetMapping
  public PageResponse<CourseSummaryResponse> search(
      @Parameter(description = "제목 검색어 (부분 일치, 대소문자 무시)") @RequestParam(required = false)
          String keyword,
      @Parameter(description = "분류 (정확히 일치)") @RequestParam(required = false) String category,
      @ParameterObject @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return courseQueryService.search(keyword, category, pageable);
  }

  @Operation(operationId = "getCourse", summary = "과정 상세 조회 (회차 목록 포함)")
  @ApiResponse(responseCode = "200", description = "조회 성공")
  @ApiResponse(
      responseCode = "404",
      description = "과정이 없음",
      content =
          @Content(
              mediaType = "application/problem+json",
              schema = @Schema(implementation = ProblemDetail.class)))
  @GetMapping("/{id}")
  public CourseDetailResponse getDetail(@PathVariable Long id) {
    return courseQueryService.getDetail(id);
  }
}
