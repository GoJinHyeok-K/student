---
name: eduhub-api
description: EduHub 백엔드에 REST API를 추가하거나 바꿀 때 쓴다. 새 엔드포인트, 기존 API의 요청·응답·검증·오류 변경, 새 기능(FR-xx)의 백엔드 구현, 엔티티·테이블 추가가 해당된다. Flyway부터 프론트 API 클라이언트 재생성까지의 팀 절차와 규칙을 담았다.
---

# EduHub API 추가 절차

기준 예시는 `backend/src/main/java/com/example/eduhub/course`다. 막히면 같은 층의 course 코드를 먼저 본다.
요구사항(FR·NFR)과 결정(D-xx)은 `docs/requirements.md`가 기준이다. 새 규칙을 정하면 D-xx로 추가한다.

## 1. Flyway 마이그레이션 (스키마가 바뀔 때만)
- `backend/src/main/resources/db/migration/V{다음 번호}__{설명}.sql`. 이미 적용된 V 파일은 고치지 않는다
- 첫 줄 주석에 관련 FR·D 번호, 상태 값은 `CHECK` 제약, 조회 조건에는 인덱스(`-- NFR-02` 주석)
- `ddl-auto: validate`이므로 엔티티와 컬럼 이름·길이·NULL 여부가 정확히 맞아야 기동된다

## 2. 엔티티 (`<도메인>/domain`)
- setter 없음. 생성은 정적 팩토리(`Course.create`), 상태 변경은 의미 있는 메서드(`close()`, `update(...)`)로만 (D-06)
- 상태 규칙 위반은 엔티티가 검사해 `ConflictException`(409)을 던진다. 서비스에서 if로 흩뜨리지 않는다
- 연관관계는 `FetchType.LAZY`. 자식은 부모 메서드로만 추가(`course.addSession`)
- enum은 `@Enumerated(EnumType.STRING)`

## 3. DTO (`<도메인>/dto`)
- 모두 Java `record`. 엔티티를 API에 그대로 내보내지 않는다 (ArchUnit 검사)
- 응답: 정적 팩토리 `of(...)` / `from(entity)`로 변환
- 요청: Bean Validation(`@NotBlank`, `@Size(max = 컬럼 길이)`, `@NotNull`, `@Min`/`@Max`)과 `@Schema(example = ...)`
- 공백 정리 같은 입력 정규화는 요청 record의 메서드로 둔다 (`trimmedTitle()`)
- 목록은 `common.web.PageResponse<T>`로 감싼다 (Spring `Page`를 그대로 내보내지 않음)

## 4. Repository (`<도메인>/repository`)
- `JpaRepository` 상속. 선택 조건 검색은 `Specification`으로 조립한다
  (`:param is null or ...` JPQL은 PostgreSQL에서 null 타입 추론이 실패하므로 금지)
- N+1 금지 (NFR-02): 단건+자식은 `@EntityGraph`, 목록의 집계는 `in :ids` + `group by` 쿼리 한 번

## 5. Service (`<도메인>/service`)
- 조회는 `XxxQueryService` + 클래스에 `@Transactional(readOnly = true)`
- 변경은 `XxxCommandService` + 클래스에 `@Transactional`. 변경 후 응답은 QueryService를 재사용해 만든다
- `open-in-view: false`이므로 지연 로딩과 DTO 변환은 서비스 트랜잭션 안에서 끝낸다
- 없으면 `common.exception.NotFoundException`(404). 새 id가 응답에 필요하면 `flush()` 후 변환
- 의존 방향: Controller → Service → Repository. enrollment는 course를 참조 가능, 반대는 금지

## 6. Controller (`<도메인>/controller`)
- 경로 `/api/v1/...`, 관리자 API는 `/api/v1/admin/...` (D-10)
- 클래스에 `@Tag`, 메서드마다 `@Operation(operationId = "...", summary = "...")`
  (operationId가 생성 클라이언트의 메서드 이름이 된다, NFR-04)
- 오류 응답은 `@ApiResponse(responseCode, content = application/problem+json, ProblemDetail)`로 문서화
- 등록은 `ResponseEntity.created(URI)`로 201 + Location. 요청 본문은 `@Valid @RequestBody`
- 예외 → 상태: 검증 실패 400(스프링 기본 ProblemDetail), `NotFoundException` 404, `ConflictException` 409
  (`common.exception.GlobalExceptionHandler`). 새 예외는 common에 두고 핸들러에 등록

## 7. 테스트 (`@DisplayName`은 한국어로 동작을 쓴다)
- 엔티티 규칙: 순수 단위 테스트 (`CourseTest`), DB 없음
- Controller: `@WebMvcTest` + `MockMvcTester` + `@MockitoBean` 서비스. 상태 코드, JSON 본문,
  400(검증 실패 시 서비스 미호출 `verifyNoInteractions`), 404·409 ProblemDetail 확인
- Service: `@DataJpaTest` + `@AutoConfigureTestDatabase(replace = NONE)` + `@ActiveProfiles("test")`
  + `@Import(서비스들)`. H2 금지, 로컬 PostgreSQL 테스트 DB(D-05). 저장 확인은 `em.flush(); em.clear();` 후 다시 조회
- 서비스 패키지 라인 커버리지 70% 이상 (NFR-05)

## 8. 프론트 API 클라이언트
- 백엔드를 띄운 상태에서 `frontend/`에서 `npm run generate:api`. `packages/api-client/src`는 손으로 고치지 않는다
- 화면은 생성 클라이언트를 `src/api/courseApi.ts` 같은 한 곳에서 만들고, 커스텀 훅(`src/hooks/useXxx.ts`)으로 감싸서 쓴다

## 검증 (모두 `backend/`에서, PowerShell은 `.\gradlew`)
1. `./gradlew spotlessApply test` 통과 (PostgreSQL 테스트 DB가 떠 있어야 한다)
2. 커밋 전 `./gradlew check` (포맷, ArchUnit, 커버리지)
3. 프론트를 바꿨으면 `frontend/`에서 `npm test`, `npm run typecheck -w apps/course-mfe`
