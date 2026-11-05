# backend/CLAUDE.md

Spring Boot 3.5, Java 21 API 서버. 저장소 공통 규칙은 루트 `CLAUDE.md`를 따른다.

## 빌드와 테스트
모든 Gradle 명령은 `backend/`에서 실행한다 (PowerShell은 `.\gradlew`).
- 빌드·테스트: `./gradlew test`
- 테스트 하나만: `./gradlew test --tests "com.example.eduhub.common.health.HealthControllerTest"` (메서드는 `...HealthControllerTest.returnsUp`)
- 전체 검사(포맷, 커버리지 포함): `./gradlew check`
- 커밋 전에 `./gradlew spotlessApply`로 포맷을 맞춘다 (google-java-format, 2칸 들여쓰기, LF 줄바꿈)
- 커버리지 보고서: `build/reports/jacoco/test/html/index.html`
- 라이브러리 버전은 `gradle/libs.versions.toml`에서만 관리한다. Spring Boot가 관리하는 라이브러리는 버전을 적지 않는다

## 테스트 규칙
- 서비스 계층 라인 커버리지 70% 이상 (JaCoCo가 `com.example.eduhub.*.service` 패키지별로 검사, `./gradlew check`에서 실패 처리)
- DB가 필요한 테스트는 H2가 아니라 실제 PostgreSQL 테스트 DB에 `@ActiveProfiles("test")`로 돌린다. `.env`의 `TEST_DB_*`가 필요하다
- DB가 필요 없는 테스트(`@WebMvcTest` + `MockMvcTester`, ArchUnit)는 DB 없이 돈다
- 테스트 이름은 `@DisplayName`에 한국어로 동작을 쓴다

## 설정
- 프로필: `application.yml`(공통) + `application-dev.yml` / `application-test.yml`. 기본 프로필은 dev
- 접속 정보는 저장소 루트의 `.env`에서 읽는다 (`spring.config.import`가 `backend/`와 루트 둘 다에서 실행되도록 `../.env`와 `.env`를 모두 시도)

## 계층 규칙
- 호출 순서는 Controller, Service, Repository 순으로만 한다. Controller에서 Repository를 직접 호출하지 않는다
- Repository를 쓰지 않는 Controller(예: 헬스 체크)는 Service를 생략할 수 있다
- 도메인 의존: enrollment는 course를 참조할 수 있고, course는 enrollment를 참조하지 않는다
- common은 도메인 패키지를 참조하지 않는다
- 도메인 패키지 내부 구조: `controller`, `service`, `repository`, `domain`(엔티티), `dto`
- `ArchitectureTest`(ArchUnit)가 검사하는 것: Controller→Repository 직접 의존 금지, Controller 메서드의 엔티티 직접 반환 금지(반환 타입 자체만 검사, `List<엔티티>`·`ResponseEntity<엔티티>`는 리뷰로 확인), course→enrollment 금지, common→도메인 금지. 내부 패키지 구조는 검사하지 않으므로 리뷰로 지킨다
- 규칙은 `allowEmptyShould(true)`로 해당 클래스가 아직 없어도 통과한다. 새 규칙을 추가할 때도 같은 방식을 쓴다

## JPA 규칙
- 연관관계는 지연 로딩(`FetchType.LAZY`)으로 둔다
- `open-in-view: false`이므로 지연 로딩은 Service 트랜잭션 안에서 끝내야 한다 (NFR-02, N+1 방지)
- 엔티티를 API 응답으로 그대로 반환하지 않는다. DTO는 Java record로 만든다
- 스키마는 Flyway만 바꾼다 (`src/main/resources/db/migration`, `ddl-auto: validate`). 엔티티를 바꾸면 마이그레이션을 같이 추가한다

## API·OpenAPI 규칙
- 경로는 `/api/...`로 시작한다
- 에러 응답은 ProblemDetail(RFC 9457) 형식을 쓴다 (`spring.mvc.problemdetails.enabled: true`)
- 모든 API에 OpenAPI 설명(`@Tag`, `@Operation`)을 단다. 프론트 클라이언트는 이 스펙에서 생성한다 (NFR-04)
