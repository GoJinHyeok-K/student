#!/usr/bin/env bash
# .claude/hooks/stop-test.sh — Stop: 백엔드가 바뀌었으면 테스트 실행, 실패하면 계속 고치게 한다
INPUT="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0

# Stop 훅 때문에 이미 한 번 더 진행 중이면 반복하지 않는다 (무한 반복 방지)
[ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -z "$(git status --porcelain -- backend/src 2>/dev/null)" ] && exit 0
[ -f backend/gradlew ] || exit 0   # 빌드 도구가 없으면 테스트할 수 없으므로 넘어간다

if ! OUT="$(cd backend && ./gradlew test -q 2>&1)"; then
  FAILS="$(printf '%s\n' "$OUT" | grep -E 'FAILED|Exception' | head -20)"
  jq -n --arg r "백엔드 테스트가 실패했습니다. 원인을 고친 뒤 마무리하세요.
$FAILS" '{decision: "block", reason: $r}'
fi
exit 0
