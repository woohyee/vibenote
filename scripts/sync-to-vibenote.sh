#!/bin/bash
# Vibe Note 프로젝트 동기화 스크립트
# 사용법: 아무 프로젝트 디렉토리에서 실행하면 프로젝트 정보를 Vibe Note에 전송
#
# 설정 필요:
#   export VIBENOTE_URL="https://your-vibenote.vercel.app"  (또는 http://localhost:3000)
#   export VIBENOTE_API_KEY="your-secret-key"
#   export VIBENOTE_UID="your-firebase-uid"

VIBENOTE_URL="${VIBENOTE_URL:-http://localhost:3000}"
VIBENOTE_API_KEY="${VIBENOTE_API_KEY:-}"
VIBENOTE_UID="${VIBENOTE_UID:-}"

if [ -z "$VIBENOTE_API_KEY" ] || [ -z "$VIBENOTE_UID" ]; then
  echo "❌ VIBENOTE_API_KEY와 VIBENOTE_UID 환경변수를 설정하세요"
  echo "   export VIBENOTE_API_KEY='your-key'"
  echo "   export VIBENOTE_UID='your-firebase-uid'"
  exit 1
fi

# 프로젝트 이름 (디렉토리명)
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")

# 기술 스택 감지
TECH_STACK="[]"

detect_stack() {
  local stack=()

  # Node.js / JavaScript 프레임워크
  if [ -f "package.json" ]; then
    local pkg=$(cat package.json)
    echo "$pkg" | grep -q '"next"' && stack+=("Next.js")
    echo "$pkg" | grep -q '"react"' && stack+=("React")
    echo "$pkg" | grep -q '"vue"' && stack+=("Vue")
    echo "$pkg" | grep -q '"svelte"' && stack+=("Svelte")
    echo "$pkg" | grep -q '"express"' && stack+=("Express")
    echo "$pkg" | grep -q '"firebase"' && stack+=("Firebase")
    echo "$pkg" | grep -q '"supabase"' && stack+=("Supabase")
    echo "$pkg" | grep -q '"tailwindcss"' && stack+=("Tailwind")
    echo "$pkg" | grep -q '"typescript"' && stack+=("TypeScript")
    echo "$pkg" | grep -q '"prisma"' && stack+=("Prisma")
  fi

  # Flutter/Dart
  [ -f "pubspec.yaml" ] && stack+=("Flutter")

  # Python
  [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] && stack+=("Python")
  [ -f "manage.py" ] && stack+=("Django")

  # Go
  [ -f "go.mod" ] && stack+=("Go")

  # Rust
  [ -f "Cargo.toml" ] && stack+=("Rust")

  # Docker
  [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ] && stack+=("Docker")

  # JSON 배열로 변환
  local json="["
  local first=true
  for item in "${stack[@]}"; do
    if [ "$first" = true ]; then
      first=false
    else
      json+=","
    fi
    json+="\"$item\""
  done
  json+="]"
  echo "$json"
}

TECH_STACK=$(detect_stack)

# Git 레포 URL
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
# SSH → HTTPS 변환
REPO_URL=$(echo "$REPO_URL" | sed 's|git@github.com:|https://github.com/|' | sed 's|\.git$||')

# 배포 URL 감지
DEPLOY_URL=""
[ -f "vercel.json" ] && DEPLOY_URL="https://${PROJECT_NAME}.vercel.app"

# 도메인 감지
DOMAIN=""
if [ -f "firebase.json" ]; then
  # firebase hosting에서 도메인 추출 시도
  DOMAIN=$(grep -o '"site":\s*"[^"]*"' firebase.json 2>/dev/null | head -1 | sed 's/"site":\s*"//;s/"//')
  [ -n "$DOMAIN" ] && DOMAIN="${DOMAIN}.web.app"
fi

echo "📦 프로젝트: $PROJECT_NAME"
echo "🛠  기술스택: $TECH_STACK"
echo "📂 레포: $REPO_URL"
echo "🌐 배포: $DEPLOY_URL"
echo "🔗 도메인: $DOMAIN"
echo ""
echo "→ $VIBENOTE_URL 에 전송중..."

# API 호출
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${VIBENOTE_URL}/api/sync-project" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${VIBENOTE_API_KEY}" \
  -d "{
    \"uid\": \"${VIBENOTE_UID}\",
    \"projectName\": \"${PROJECT_NAME}\",
    \"techStack\": ${TECH_STACK},
    \"repoUrl\": \"${REPO_URL}\",
    \"deployUrl\": \"${DEPLOY_URL}\",
    \"domain\": \"${DOMAIN}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 동기화 완료! $BODY"
else
  echo "❌ 실패 (HTTP $HTTP_CODE): $BODY"
fi
