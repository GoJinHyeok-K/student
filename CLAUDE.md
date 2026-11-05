# CLAUDE.md

이 파일은 저장소 전체에 적용되는 Claude Code(claude.ai/code) 작업 규칙이다. 폴더별 규칙은 `backend/CLAUDE.md`, `frontend/CLAUDE.md`에 있다.

# EduHub 작업 규칙

사내 교육과정 조회·수강 신청 시스템.
백엔드는 Spring Boot 3.5(Java 21), 프론트엔드는 React + Module Federation(아직 코드 없음).

## 디렉터리 지도
- `backend/`: Spring Boot API 서버 (규칙: `backend/CLAUDE.md`)
- `frontend/`: React 프론트엔드, 아직 코드 없음 (규칙: `frontend/CLAUDE.md`)
- `docs/requirements.md`: 요구사항(FR-xx, NFR-xx)과 결정 사항(D-xx)
- `scripts/init-local-db.sql`: 로컬 DB 준비 스크립트
- `docker-compose.yml`: 개발용 PostgreSQL 16
- `.env.example`: 환경 변수 이름 목록 (실제 값은 `.env`)

## 실행 명령
Gradle 명령은 `backend/`에서 실행한다 (PowerShell은 `.\gradlew`).
- 로컬 DB 준비: `psql -U postgres -f scripts/init-local-db.sql` (eduhub 계정, eduhub / eduhub_test DB 생성)
- Docker로 개발 DB 실행: 저장소 루트에서 `docker compose up -d` (로컬 PostgreSQL과 같은 5432 포트, D-05)
- 빌드·테스트: `./gradlew test`
- 전체 검사(포맷, 커버리지 포함): `./gradlew check`
- 실행: `./gradlew bootRun` (기본 프로필 dev) → `http://localhost:8080/api/health`, `/swagger-ui.html`, `/api-docs`

## 공통 규칙
### 기준 문서
- 요구사항은 `docs/requirements.md`를 기준으로 한다 (FR-xx, NFR-xx, 결정 사항 D-xx)
- 새로 정한 규칙이나 정책은 `docs/requirements.md`의 결정 사항에 D-xx로 추가한다
- 설정·빌드 파일의 주석은 관련 NFR 번호를 단다 (예: `# NFR-02: ...`). 새 설정도 같은 방식을 따른다

### 커밋
- 커밋 메시지는 Conventional Commits 형식을 쓴다 (예: `feat(backend): ...`, `docs: ...`, `build(backend): ...`)
### 브랜치
- `main`에 직접 커밋하지 않는다. 작업 브랜치에서 커밋하고 PR로 합친다
- 브랜치 이름은 `<종류>/<설명>` 형식이다 (예: `feature/week1-skeleton`, `chore/claude-md-split`)

### 비밀 정보
- 비밀 정보는 코드와 설정 파일에 쓰지 않는다. 환경 변수와 `.env`(커밋 금지)만 사용한다
- 새 환경 변수를 추가하면 `.env.example`에 이름만 추가한다
