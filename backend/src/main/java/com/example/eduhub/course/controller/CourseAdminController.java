package com.example.eduhub.course.controller;

import com.example.eduhub.course.dto.CourseDetailResponse;
import com.example.eduhub.course.dto.CourseRequest;
import com.example.eduhub.course.dto.SessionRequest;
import com.example.eduhub.course.dto.SessionResponse;
import com.example.eduhub.course.service.CourseCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자용 과정·회차 등록, 수정, 종료 API (FR-03).
 *
 * <p>목록·상세 조회는 {@link CourseController}를 같이 쓴다. ADMIN 권한 검사는 인증(D-04)을 붙일 때 {@code
 * /api/v1/admin/**} 경로 규칙으로 건다 (D-10).
 */
@Tag(name = "CourseAdmin", description = "교육과정 관리 (관리자)")
@RestController
@RequestMapping("/api/v1/admin/courses")
@ApiResponse(
    responseCode = "400",
    description = "입력값이 잘못됨",
    content =
        @Content(
            mediaType = "application/problem+json",
            schema = @Schema(implementation = ProblemDetail.class)))
@ApiResponse(
    responseCode = "404",
    description = "과정 또는 회차가 없음",
    content =
        @Content(
            mediaType = "application/problem+json",
            schema = @Schema(implementation = ProblemDetail.class)))
@ApiResponse(
    responseCode = "409",
    description = "종료된 과정·회차라서 바꿀 수 없음",
    content =
        @Content(
            mediaType = "application/problem+json",
            schema = @Schema(implementation = ProblemDetail.class)))
public class CourseAdminController {

  private final CourseCommandService courseCommandService;

  public CourseAdminController(CourseCommandService courseCommandService) {
    this.courseCommandService = courseCommandService;
  }

  @Operation(operationId = "createCourse", summary = "과정 등록 (모집 중 상태로 만든다)")
  @ApiResponse(responseCode = "201", description = "등록 성공")
  @PostMapping
  public ResponseEntity<CourseDetailResponse> createCourse(
      @Valid @RequestBody CourseRequest request) {
    CourseDetailResponse created = courseCommandService.createCourse(request);
    return ResponseEntity.created(URI.create("/api/v1/courses/" + created.id())).body(created);
  }

  @Operation(operationId = "updateCourse", summary = "과정 수정 (제목, 분류, 소개)")
  @ApiResponse(responseCode = "200", description = "수정 성공")
  @PutMapping("/{courseId}")
  public CourseDetailResponse updateCourse(
      @PathVariable Long courseId, @Valid @RequestBody CourseRequest request) {
    return courseCommandService.updateCourse(courseId, request);
  }

  @Operation(operationId = "closeCourse", summary = "과정 종료 (모집 중인 회차도 함께 종료)")
  @ApiResponse(responseCode = "200", description = "종료 성공")
  @PostMapping("/{courseId}/close")
  public CourseDetailResponse closeCourse(@PathVariable Long courseId) {
    return courseCommandService.closeCourse(courseId);
  }

  @Operation(operationId = "addSession", summary = "회차 추가")
  @ApiResponse(responseCode = "201", description = "추가 성공")
  @PostMapping("/{courseId}/sessions")
  public ResponseEntity<SessionResponse> addSession(
      @PathVariable Long courseId, @Valid @RequestBody SessionRequest request) {
    SessionResponse created = courseCommandService.addSession(courseId, request);
    return ResponseEntity.created(URI.create("/api/v1/courses/" + courseId)).body(created);
  }

  @Operation(operationId = "updateSession", summary = "회차 수정 (시작일, 장소, 정원)")
  @ApiResponse(responseCode = "200", description = "수정 성공")
  @PutMapping("/{courseId}/sessions/{sessionId}")
  public SessionResponse updateSession(
      @PathVariable Long courseId,
      @PathVariable Long sessionId,
      @Valid @RequestBody SessionRequest request) {
    return courseCommandService.updateSession(courseId, sessionId, request);
  }

  @Operation(operationId = "closeSession", summary = "회차 종료")
  @ApiResponse(responseCode = "200", description = "종료 성공")
  @PostMapping("/{courseId}/sessions/{sessionId}/close")
  public SessionResponse closeSession(@PathVariable Long courseId, @PathVariable Long sessionId) {
    return courseCommandService.closeSession(courseId, sessionId);
  }
}
