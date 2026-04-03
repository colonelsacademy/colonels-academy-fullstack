#!/usr/bin/env sh
# Installs git hooks for this repo.
# Runs automatically via the `prepare` lifecycle on `pnpm install`.
# Safe to re-run; skipped when .git is absent (e.g. in CI).

set -e

if [ ! -d ".git" ]; then
  echo "setup-hooks: no .git directory found, skipping hook installation."
  exit 0
fi

mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env sh
# Auto-format staged files with Biome before every commit.
# If Biome rewrites any files, they are re-staged automatically so the
# commit reflects the formatted result.

pnpm biome:format

# Re-stage any files that Biome just rewrote.
git diff --name-only | xargs -r git add
EOF

chmod +x .git/hooks/pre-commit

echo "setup-hooks: pre-commit hook installed at .git/hooks/pre-commit"
