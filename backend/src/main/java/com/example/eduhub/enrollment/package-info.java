/**
 * 수강 신청 도메인. 신청, 대기, 취소, 수료와 알림을 담당한다 (FR-04~09, D-01~03).
 *
 * <p>의존 규칙: course 도메인을 참조할 수 있다. 반대 방향은 금지한다.
 *
 * <p>내부 구조: controller, service, repository, domain(엔티티), dto
 */
package com.example.eduhub.enrollment;
