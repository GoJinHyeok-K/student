-- 로컬 개발용 계정과 DB를 만든다. 여러 번 실행해도 안전하다.
-- 실행: psql -U postgres -f scripts/init-local-db.sql
-- 비밀번호는 실행할 때 입력받는다. 이 파일에 비밀번호를 쓰지 않는다.

\prompt 'eduhub 계정에 쓸 비밀번호: ' pw

SELECT format('CREATE ROLE eduhub LOGIN PASSWORD %L', :'pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'eduhub')
\gexec

SELECT 'CREATE DATABASE eduhub OWNER eduhub'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'eduhub')
\gexec

SELECT 'CREATE DATABASE eduhub_test OWNER eduhub'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'eduhub_test')
\gexec

\echo 완료: .env 의 POSTGRES_PASSWORD, TEST_DB_PASSWORD 에 같은 비밀번호를 넣는다.
