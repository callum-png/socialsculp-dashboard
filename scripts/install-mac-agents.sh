#!/bin/bash
# Install Claude Agent Mission Control LaunchAgents on macOS
# Run this once after cloning the repo to set up the reporter + command poller

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "=== Claude Agent Mission Control — macOS Agent Installer ==="
echo ""

# Check for CLAUDE_REPORTER_SECRET
if [ -z "$CLAUDE_REPORTER_SECRET" ]; then
  echo "ERROR: CLAUDE_REPORTER_SECRET is not set."
  echo ""
  echo "You need to set this env var. It must match the CLAUDE_REPORTER_SECRET"
  echo "in your SocialSculp dashboard's Vercel environment variables."
  echo ""
  echo "To set it permanently, add to your ~/.zshrc or ~/.bashrc:"
  echo "  export CLAUDE_REPORTER_SECRET=\"your-secret-here\""
  echo ""
  echo "Then re-run this script."
  exit 1
fi

# Make scripts executable
chmod +x "$SCRIPT_DIR/openclaw-reporter.sh"
chmod +x "$SCRIPT_DIR/openclaw-command-poller.sh"

# Ensure log directory exists
mkdir -p "$HOME/.claude-agent/logs"

# Update plists with the correct script paths (in case repo is cloned elsewhere)
REPORTER_PLIST="$SCRIPT_DIR/ai.claude.reporter.plist"
POLLER_PLIST="$SCRIPT_DIR/ai.claude.command-poller.plist"

# Copy plists to LaunchAgents
cp "$REPORTER_PLIST" "$LAUNCH_AGENTS_DIR/"
cp "$POLLER_PLIST" "$LAUNCH_AGENTS_DIR/"

# Inject the reporter secret into the plists
# We add it to EnvironmentVariables in each plist
for PLIST in "$LAUNCH_AGENTS_DIR/ai.claude.reporter.plist" "$LAUNCH_AGENTS_DIR/ai.claude.command-poller.plist"; do
  # Use plutil to add the env var
  /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:CLAUDE_REPORTER_SECRET string $CLAUDE_REPORTER_SECRET" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Set :EnvironmentVariables:CLAUDE_REPORTER_SECRET $CLAUDE_REPORTER_SECRET" "$PLIST"
done

# Unload if already loaded (ignore errors)
launchctl unload "$LAUNCH_AGENTS_DIR/ai.claude.reporter.plist" 2>/dev/null || true
launchctl unload "$LAUNCH_AGENTS_DIR/ai.claude.command-poller.plist" 2>/dev/null || true

# Load the agents
launchctl load "$LAUNCH_AGENTS_DIR/ai.claude.reporter.plist"
launchctl load "$LAUNCH_AGENTS_DIR/ai.claude.command-poller.plist"

echo ""
echo "Done! LaunchAgents installed and loaded:"
echo "  - ai.claude.reporter (every 60s)"
echo "  - ai.claude.command-poller (every 5s)"
echo ""
echo "Logs at:"
echo "  ~/.claude-agent/logs/reporter.log"
echo "  ~/.claude-agent/logs/command-poller.log"
echo ""
echo "To verify: launchctl list | grep ai.claude"
echo "To stop:   launchctl unload ~/Library/LaunchAgents/ai.claude.reporter.plist"
