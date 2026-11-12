# EduHub 요구사항

## 개요
임직원이 사내 교육과정을 조회·신청하고, 정원이 차면 대기자로 등록되는 시스템.
- 사용자: 임직원(수강생), 교육 담당자(관리자)

## 기술 스택
- 백엔드: Java 21, Spring Boot 3, Spring Data JPA, Flyway, springdoc-openapi, PostgreSQL
- 프론트엔드: React 18 + TypeScript, Module Federation(shell, course-mfe, enrollment-mfe), MUI, Axios
- 빌드: Gradle(Kotlin DSL), npm workspaces

## 3-3. 기능 요구사항

| ID | 요구사항 | 사용자 | 우선순위 | 주차 |
|---|---|---|---|---|
| FR-01 | 교육과정 목록을 조회하고 제목·분류로 검색한다 (페이지 단위) | 임직원 | 필수 | 2 |
| FR-02 | 과정 상세와 회차(일정, 장소, 정원, 남은 자리)를 조회한다 | 임직원 | 필수 | 2 |
| FR-03 | 관리자는 과정과 회차를 등록·수정·종료한다 | 관리자 | 필수 | 2 |
| FR-04 | 회차에 수강 신청한다. 같은 회차에 중복 신청할 수 없다 | 임직원 | 필수 | 3 |
| FR-05 | 정원이 차면 대기자로 등록되고 대기 순번을 알려 준다 | 임직원 | 필수 | 3 |
| FR-06 | 신청을 취소하면 대기 1순위가 자동으로 신청 확정된다 | 임직원 | 필수 | 3 |
| FR-07 | 내 신청 내역(확정, 대기, 취소, 수료)을 조회한다 | 임직원 | 필수 | 4 |
| FR-08 | 관리자는 회차별 신청자·대기자 명단을 보고 수료 처리한다 | 관리자 | 보통 | 4 |
| FR-09 | 신청 확정·대기 승급 시 알림을 남긴다 (처음에는 로그·DB 기록) | 임직원 | 선택 | 5 |

---

## 3-4. 비기능 요구사항

| ID | 분류 | 요구사항 | 확인 방법 |
|---|---|---|---|
| NFR-01 | **정합성** | 동시에 100명이 마지막 1자리에 신청해도 정원을 넘지 않는다 | 동시성 테스트 |
| NFR-02 | **성능** | 과정 목록 API는 데이터 1만 건에서 응답 300ms 이내, N+1 쿼리 없음 | 쿼리 로그, 성능 테스트 |
| NFR-03 | **보안** | 로그인한 사용자만 신청 가능, 본인 신청만 취소 가능, 비밀 정보는 저장소에 두지 않음 | 테스트, 비밀 검사 |
| NFR-04 | **API 계약** | 모든 API는 OpenAPI 문서가 있고, 프론트 클라이언트는 스펙에서 생성한다 | Swagger UI, 생성 스크립트 |
| NFR-05 | **품질** | 서비스 계층 테스트 커버리지 70% 이상, CI에서 빌드·테스트·포맷 검사 | CI 결과 |
| NFR-06 | **운영성** | 개발·테스트·운영 설정 분리, 사람이 직접 실행할 수 있는 빌드·배포·롤백 절차 문서 | 런북, 핫픽스 훈련 |
| NFR-07 | **유지보수성** | 도메인별 패키지(course, enrollment), 계층 규칙 준수, 화면은 MFE로 분리 | 리뷰, 아키텍처 테스트 |
| NFR-08 | **이해도** | 팀원 누구나 AI 없이 구조와 핵심 파일의 역할을 설명할 수 있다 | 발표 시 확인 |

## 결정 사항
- D-01: 신청 취소는 회차 시작 1일 전까지 가능하다 (FR-06)
- D-02: 대기 인원은 정원의 50%까지 받는다 (FR-05)
- D-03: 수료 처리는 관리자만 한다 (FR-08)
- D-04: 인증은 자체 로그인(아이디·비밀번호) + 서버 세션 쿠키 방식, 역할은 USER/ADMIN 두 가지. 회원가입은 범위 밖이며 계정은 시드 데이터로 넣는다. 사내 SSO 도입 시 OIDC로 교체할 수 있게 인증 설정을 분리한다 (NFR-03)
- D-05: 개발 DB 접속 정보는 `.env`의 `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`이고 `localhost:5432`에 붙는다. 로컬 PostgreSQL이나 `docker-compose.yml`의 postgres:16 중 하나를 쓴다. 테스트 DB는 Testcontainers 대신 로컬 PostgreSQL의 테스트용 DB(`TEST_DB_*`)를 쓴다 (NFR-06)
- D-06: 과정과 회차의 상태는 `OPEN`(모집 중), `CLOSED`(종료) 두 가지다. 상태는 엔티티의 `close()` 같은 메서드로만 바꾼다 (FR-03)
- D-07: 과정 목록은 기본 20건씩 `id` 내림차순으로 돌려주고, `CLOSED` 과정과 회차도 포함해 `status`로 구분한다. 남은 자리는 수강 신청(FR-04) 전까지 정원과 같다 (FR-01, FR-02)
- D-08: 프론트 개발 서버(3001)는 CORS 설정 대신 Vite 프록시로 `/api` 요청을 백엔드(8080)에 넘긴다. 운영 배포 방식은 6주차 MFE 구성 때 다시 정한다. 과정 목록의 분류 선택지는 분류 API가 생기기 전까지 화면에 고정한다 (FR-01, NFR-04)
- D-09: course-mfe 안의 화면 전환(목록 → 상세)은 라우터 없이 선택한 과정 id 상태로 한다. 목록은 숨기기만 하므로 상세에서 돌아와도 검색어·분류·페이지가 유지된다. URL 라우팅은 6주차 shell 구성 때 shell 라우터와 함께 정한다. 상세의 회차는 시작일 순으로 보여 주고, 모집 중인데 남은 자리가 0이면 '마감'으로 표시한다 (FR-02, NFR-07)
- D-10: 관리자 API는 `/api/v1/admin/courses` 아래에 두고(등록 `POST`, 수정 `PUT`, 종료 `POST .../close`), 목록·상세 조회는 임직원 API를 같이 쓴다. 과정을 종료하면 모집 중인 회차도 함께 종료된다. 종료된 과정·회차는 수정하거나 회차를 추가할 수 없고 다시 열 수 없다(409 ProblemDetail). 이미 종료된 것을 다시 종료해도 오류가 아니다. 회차 정원은 1~1000명이다. ADMIN 권한 검사(D-04)는 인증을 붙일 때 `/api/v1/admin/**` 경로 규칙으로 걸고, 그 전까지 관리 화면은 course-mfe의 '과정 관리' 탭으로 누구나 열 수 있다 (FR-03, NFR-03)
- D-11: Claude Code 팀 권한은 `.claude/settings.json`으로 공유한다 (JSON이라 주석을 달 수 없어 근거는 여기에 둔다).
  - allow: 테스트·검사·포맷·빌드(`./gradlew test|check|spotlessApply|spotlessCheck|build`, `npm test`, `npm run test|typecheck|build|lint`), API 클라이언트 생성(`npm run generate:api`), 읽기 전용 git(`status`, `diff`, `log`, `show`)
  - ask: `git push`, `npm install`, `docker`
  - deny: `.env`와 `.env.*`의 읽기·수정(하위 폴더와 워크트리 사본 포함, `.env.example`은 `!` 예외로 허용), `~/.ssh`, 운영 설정 `application-prod.yml` 읽기, 강제 푸시(`--force`, `-f`가 어느 위치에 있든), `main` 직접 푸시, DB 초기화·삭제(`./gradlew flywayClean`, `docker compose down -v`, `docker volume rm`), 원격 접속(`ssh`), DB 직접 접속(`psql`)
  - `psql`을 막으므로 로컬 DB 준비(`psql -U postgres -f scripts/init-local-db.sql`)와 DB 직접 조회는 사람이 한다
  - Windows에서는 Bash 규칙이 PowerShell 도구에 적용되지 않으므로 같은 규칙을 `PowerShell(...)`로도 둔다 (Gradle은 `.\gradlew`)
  - 개인 설정(기본 모드, 로컬 서버 명령)은 `.claude/settings.local.json`, 워크트리(`.claude/worktrees/`)와 개인 경로가 들어가는 `.claude/launch.json`은 커밋하지 않는다
  - 회사 공통 금지(bypass 모드 금지 등)는 관리 설정 몫이며 이 저장소에서 정하지 않는다 (NFR-03)
- D-12: 동시성 테스트(NFR-01)도 Testcontainers 대신 D-05의 로컬 PostgreSQL 테스트 DB(`TEST_DB_*`)에서 돌린다. 실제 PostgreSQL이라 행 잠금·격리 수준 동작은 같고, 개발 PC에 Docker가 없어도 된다. 4회차 자료의 "Docker Desktop + Testcontainers" 준비는 이 저장소에서는 따르지 않는다.
  - 동시성 테스트는 여러 스레드가 같은 데이터를 봐야 하므로 `@DataJpaTest`의 테스트 트랜잭션 롤백을 쓸 수 없다. 데이터를 커밋해서 준비하고, 테스트가 끝나면 직접 지운다 (다른 테스트와 겹치지 않게 테스트 전용 제목·id로 구분)
  - 커넥션 풀이 동시 요청 수보다 작으면 대기만 길어지고 경합이 약해지므로, 테스트는 풀 크기와 스레드 수를 함께 정한다
  - CI를 붙일 때는 CI의 PostgreSQL 서비스 컨테이너를 테스트 DB로 쓴다. 그때 Testcontainers로 바꿀지 다시 정한다 (NFR-01, NFR-05, NFR-06)
