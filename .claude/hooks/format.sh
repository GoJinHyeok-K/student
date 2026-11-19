#!/usr/bin/env bash
# PostToolUse(Edit|Write) 훅: 수정된 파일을 자동 포맷한다.
# 어떤 경우에도 Claude 작업을 막지 않도록 항상 exit 0.

input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0

file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -z "$file_path" ] && exit 0

# Windows 경로(E:\a\b) → 슬래시로 통일
file_path="${file_path//\\//}"

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
project_dir="${project_dir//\\//}"

case "$file_path" in
  *.java)
    backend="$project_dir/backend"
    if [ -x "$backend/gradlew" ] || [ -f "$backend/gradlew" ]; then
      (cd "$backend" && ./gradlew spotlessApply -q) >/dev/null 2>&1 || true
    fi
    ;;
  *.ts|*.tsx)
    frontend="$project_dir/frontend"
    prettier="$frontend/node_modules/.bin/prettier"
    if [ -e "$prettier" ]; then
      (cd "$frontend" && "$prettier" --write "$file_path") >/dev/null 2>&1 || true
    fi
    ;;
esac

exit 0
