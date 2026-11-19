#!/usr/bin/env bash
# PreToolUse(Bash) 훅: 운영 환경 접속과 되돌릴 수 없는 명령을 차단한다.
# 차단 시 exit 2 + stderr로 이유와 대안을 Claude에게 전달한다.
# 가벼운 문자열 검사만 한다 (외부 명령 호출은 jq/grep 뿐).
# jq가 없으면 검사할 수 없으므로 통과시키지 않고 막는다 (그냥 두면 보호가 조용히 꺼진다).

command -v jq >/dev/null 2>&1 || { echo "jq가 없어 보호 훅이 검사할 수 없습니다. 사람이 jq를 설치하세요 (Windows: winget install jqlang.jq)." >&2; exit 2; }
input="$(cat)"

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

block() {
  printf '차단됨: %s\n대안: %s\n' "$1" "$2" >&2
  exit 2
}

# 1) 운영 호스트·DB (팀 명명 규칙)
if printf '%s' "$cmd" | grep -qiE 'eduhub-prod|prod-db'; then
  block "운영 환경(eduhub-prod / prod-db) 접속·조작은 Claude가 실행할 수 없습니다." \
        "로컬/개발 환경(dev, local)에서 진행하거나, 운영 작업은 사람이 직접 수행하세요."
fi

# 2) flywayClean
if printf '%s' "$cmd" | grep -qE 'flywayClean'; then
  block "flywayClean은 DB의 모든 객체를 삭제하며 되돌릴 수 없습니다." \
        "새 마이그레이션 파일을 추가하거나 flywayRepair/flywayInfo로 상태를 확인하세요."
fi

# git push 구간만 뽑아 검사 (; & | 로 구분된 각 명령)
pushes="$(printf '%s' "$cmd" | grep -oE 'git[[:space:]]+push([^;&|]*)')"
if [ -n "$pushes" ]; then
  # 3) 강제 푸시 (--force, -f). --force-with-lease는 허용
  if printf '%s\n' "$pushes" | grep -qE '(^|[[:space:]])(--force|-f)([[:space:]]|$)'; then
    block "git push --force / -f 는 원격 이력을 덮어써 되돌리기 어렵습니다." \
          "rebase 후라면 git push --force-with-lease를 쓰거나, 새 커밋으로 되돌리세요(git revert)."
  fi
  # 4) main 직접 푸시 (main, +main, HEAD:main 등)
  if printf '%s\n' "$pushes" | grep -qE '(^|[[:space:]])origin[[:space:]]+([^[:space:]]*:)?\+?main([[:space:]]|$)'; then
    block "main 브랜치로 직접 푸시할 수 없습니다." \
          "작업 브랜치에 푸시한 뒤 PR을 만드세요 (예: git push -u origin <branch>)."
  fi
fi

exit 0
