#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶  Building and deploying frontend to Netlify..."
netlify deploy --build --prod

echo "✅  Frontend deployed → https://flowlist-app.netlify.app"
