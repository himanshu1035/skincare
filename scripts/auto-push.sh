#!/usr/bin/env bash
# Auto-commit and push helper for the skincare repo.
#
# Usage:
#   ./scripts/auto-push.sh                # auto-generated commit message
#   ./scripts/auto-push.sh "my message"   # custom commit message
#
# Behaviour:
#   - Runs from the repo root (script resolves its own location).
#   - Skips silently if the working tree has no changes.
#   - Stages everything tracked + new files (respects .gitignore).
#   - Pushes to the current branch's upstream. If no upstream is set, sets one
#     against `origin/<current-branch>`.
#   - Never force-pushes. Never amends. Never touches `git config`.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)"
cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[auto-push] not inside a git repo, skipping" >&2
  exit 0
fi

# Bail out cleanly if there is nothing to push.
if [ -z "$(git status --porcelain)" ]; then
  echo "[auto-push] working tree clean, nothing to commit"
  # Still attempt to push in case of unpushed commits.
  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    AHEAD="$(git rev-list --count '@{u}'..HEAD || echo 0)"
    if [ "${AHEAD:-0}" -gt 0 ]; then
      echo "[auto-push] $AHEAD local commit(s) ahead of upstream, pushing"
      git push
    fi
  fi
  exit 0
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
TIMESTAMP="$(date +'%Y-%m-%d %H:%M:%S %z')"
DEFAULT_MSG="chore: auto-sync ${TIMESTAMP}"
MSG="${1:-$DEFAULT_MSG}"

echo "[auto-push] staging changes on branch '$BRANCH'"
git add -A

# git diff --cached --quiet exits 1 when there are staged changes.
if git diff --cached --quiet; then
  echo "[auto-push] nothing staged after git add, skipping commit"
  exit 0
fi

echo "[auto-push] committing: $MSG"
git commit -m "$MSG"

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  echo "[auto-push] pushing to existing upstream"
  git push
else
  echo "[auto-push] no upstream set, pushing to origin/$BRANCH"
  git push -u origin "$BRANCH"
fi

echo "[auto-push] done"
