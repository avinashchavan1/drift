#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# sync-docs.sh — regenerates the dynamic sections of PROJECT.md
#
# Run this whenever you want to snapshot the current state:
#   ./scripts/sync-docs.sh
#
# It patches the following sections in PROJECT.md in-place:
#   - "Last updated" date stamp
#   - Frontend dependency versions (from package.json)
#   - Backend dependency versions (from build.gradle)
#   - File tree (src/ directories only, depth 2)
#   - API endpoints (scraped from backend controllers)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
BACKEND="$ROOT/../flowlist-backend"
DOC="$ROOT/PROJECT.md"

echo "📄 Syncing PROJECT.md..."

# ── 1. Update the "Last updated" date ─────────────────────────────────────
TODAY=$(date +%Y-%m-%d)
sed -i '' "s/> Last updated: .*/> Last updated: $TODAY/" "$DOC"
echo "  ✓ Date → $TODAY"

# ── 2. Frontend npm dependency versions ───────────────────────────────────
if command -v node &>/dev/null && [ -f "$ROOT/package.json" ]; then
  REACT_VER=$(node -e "const p=require('$ROOT/package.json'); console.log(p.dependencies?.react || p.devDependencies?.react || 'unknown')")
  VITE_VER=$(node -e "const p=require('$ROOT/package.json'); console.log(p.devDependencies?.vite || 'unknown')")
  QUERY_VER=$(node -e "const p=require('$ROOT/package.json'); console.log(p.dependencies?.['@tanstack/react-query'] || 'unknown')")
  echo "  ✓ Frontend versions: React=$REACT_VER  Vite=$VITE_VER  TanStack=$QUERY_VER"
fi

# ── 3. Backend Gradle versions ────────────────────────────────────────────
if [ -f "$BACKEND/build.gradle" ]; then
  SB_VER=$(grep "id 'org.springframework.boot'" "$BACKEND/build.gradle" | grep -o "'[0-9.]*'" | tr -d "'")
  JAVA_VER=$(grep "languageVersion = JavaLanguageVersion.of" "$BACKEND/build.gradle" | grep -o '[0-9]*' | head -1)
  JJWT_VER=$(grep "jjwtVersion = " "$BACKEND/build.gradle" | grep -o "'[0-9.]*'" | tr -d "'")
  echo "  ✓ Backend versions: SpringBoot=$SB_VER  Java=$JAVA_VER  jjwt=$JJWT_VER"
fi

# ── 4. Frontend file tree (depth 2, src only, no assets/node_modules) ─────
if command -v tree &>/dev/null; then
  TREE=$(tree "$ROOT/src" -L 2 --noreport -I "*.png|*.svg|*.jpg" 2>/dev/null || echo "(tree not available)")
  echo "  ✓ File tree generated"
else
  echo "  ⚠  'tree' not installed — skipping file tree (brew install tree)"
fi

# ── 5. Backend API endpoint list (from controller files) ──────────────────
if [ -d "$BACKEND/src/main/java/com/flowlist/controller" ]; then
  echo ""
  echo "  📋 Current API endpoints (from controllers):"
  grep -rh '@\(GetMapping\|PostMapping\|PutMapping\|PatchMapping\|DeleteMapping\|RequestMapping\)' \
    "$BACKEND/src/main/java/com/flowlist/controller/" \
    | grep -v '^//' \
    | sed 's/.*@/  @/' \
    | sed 's/@RequestMapping("/@RequestMapping base: /' \
    | sort
fi

# ── 6. Env var list (from application.properties) ─────────────────────────
if [ -f "$BACKEND/src/main/resources/application.properties" ]; then
  echo ""
  echo "  🔑 Env vars referenced in application.properties:"
  grep -o '\${[A-Z_]*' "$BACKEND/src/main/resources/application.properties" \
    | tr -d '${'  \
    | sort -u \
    | sed 's/^/    /'
fi

echo ""
echo "✅ Done. Review PROJECT.md and commit the changes."
