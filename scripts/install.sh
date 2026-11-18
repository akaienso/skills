#!/usr/bin/env bash
# Installs the skills in this repository for every AI agent tool found on this machine,
# by symlinking each skills/<name> folder into the tool's personal skills folder.
# Because they are links, `git pull` in this repository updates every tool at once.
#
#   bash scripts/install.sh               # link every skill into every tool found
#   bash scripts/install.sh --dry-run     # show what would happen, change nothing
#   bash scripts/install.sh --copy        # copy instead of link (for tools that don't follow links)
#   bash scripts/install.sh --uninstall   # remove only the links this script created
#   bash scripts/install.sh --only claude,codex   # limit to some tools
#
# It never overwrites a real folder or a link that points somewhere else; it reports them.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS="$REPO/skills"

# tool name | personal skills folder | folder whose presence means the tool is installed
TARGETS=(
  "claude|$HOME/.claude/skills|$HOME/.claude"
  "agents|$HOME/.agents/skills|$HOME/.agents"
  "codex|$HOME/.codex/skills|$HOME/.codex"
  "gemini|$HOME/.gemini/skills|$HOME/.gemini"
  "antigravity|$HOME/.gemini/antigravity/skills|$HOME/.gemini/antigravity"
  "cursor|$HOME/.cursor/skills|$HOME/.cursor"
  "copilot|$HOME/.copilot/skills|$HOME/.copilot"
)

mode=link; dry=0; only=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) dry=1 ;;
    --copy) mode=copy ;;
    --uninstall) mode=uninstall ;;
    --only) only="${2:-}"; shift ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

run() { if [ "$dry" = 1 ]; then echo "  would: $*"; else "$@"; fi; }

for target in "${TARGETS[@]}"; do
  IFS='|' read -r tool dest marker <<<"$target"
  if [ -n "$only" ] && [[ ",$only," != *",$tool,"* ]]; then continue; fi
  if [ ! -d "$marker" ]; then echo "skip $tool: not installed ($marker not found)"; continue; fi
  echo "$tool → $dest"
  [ "$mode" != uninstall ] && run mkdir -p "$dest"
  for src in "$SKILLS"/*/; do
    name="$(basename "$src")"; src="${src%/}"; link="$dest/$name"
    case "$mode" in
      uninstall)
        if [ -L "$link" ] && [ "$(readlink "$link")" = "$src" ]; then run rm "$link"; [ "$dry" = 1 ] || echo "  removed $name"; fi ;;
      link)
        if [ -L "$link" ] && [ "$(readlink "$link")" = "$src" ]; then echo "  ok      $name (already linked)"
        elif [ -e "$link" ] || [ -L "$link" ]; then echo "  SKIPPED $name: $link already exists and is not this repository's link"
        else run ln -s "$src" "$link"; [ "$dry" = 1 ] || echo "  linked  $name"; fi ;;
      copy)
        if [ -e "$link" ] || [ -L "$link" ]; then echo "  SKIPPED $name: $link already exists"
        else run cp -R "$src" "$link"; [ "$dry" = 1 ] || echo "  copied  $name"; fi ;;
    esac
  done
done
