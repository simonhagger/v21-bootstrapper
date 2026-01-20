#!/bin/bash

# Post-bootstrap verification script for Unix/Linux/macOS
# Validates workspace readiness and makes first commit

set -e

WORKSPACE=$(pwd)
FAILED=0
PASSED=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${CYAN}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          POST-BOOTSTRAP VERIFICATION SCRIPT                ║"
echo "║                                                            ║"
echo "║  This script validates that your Angular workspace is     ║"
echo "║  ready for development.                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Workspace: $WORKSPACE"
echo ""

# Step 1: Build
log_info "Building Angular application..."
if pnpm build &> /dev/null; then
    log_success "Build passed"
else
    log_error "Build failed (CRITICAL)"
    exit 1
fi

# Step 2: Type Check
log_info "Type checking TypeScript..."
if pnpm typecheck &> /dev/null; then
    log_success "Type check passed"
else
    log_error "Type check failed (CRITICAL)"
    exit 1
fi

# Step 3: Linting
log_info "Linting code..."
if pnpm lint > /dev/null 2>&1; then
    log_success "Linting passed"
else
    log_error "Linting failed (CRITICAL)"
    exit 1
fi

# Step 4: Format Check
log_info "Checking code formatting..."
if pnpm format:check > /dev/null 2>&1; then
    log_success "Format check passed"
else
    log_error "Format check failed (CRITICAL)"
    exit 1
fi

# Step 5: Tests
log_info "Running unit tests..."
if pnpm test &> /dev/null; then
    log_success "Tests passed"
else
    log_warn "Tests failed (non-critical)"
fi

# Step 6: Verification Gates
log_info "Running all verification gates..."
if pnpm verify > /dev/null 2>&1; then
    log_success "Verification gates passed"
else
    log_error "Verification gates failed (CRITICAL)"
    exit 1
fi

# Step 7: Initialize Git
if [ ! -d ".git" ]; then
    log_info "Initializing git repository..."
    git init > /dev/null 2>&1
    git config user.email "dev@example.com"
    git config user.name "Developer"
    log_success "Git initialized"
fi

# Step 8: First Commit
log_info "Making first commit..."
if git diff --quiet && git diff --cached --quiet; then
    log_warn "No changes to commit"
else
    git add .
    git commit -m "chore: initial bootstrap commit" > /dev/null 2>&1
    log_success "First commit created"
fi

# Summary
echo ""
echo "=============================================================="
echo -e "${CYAN}VERIFICATION SUMMARY${NC}"
echo "=============================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical checks passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}  ($WARNINGS non-critical warning(s))${NC}"
    fi
    echo -e "\n${GREEN}✓ Project is ready for development!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Start development: pnpm start"
    echo "  2. Generate features: pnpm gen:feature FeatureName"
    echo "  3. Check documentation: Review README.md and AI_AGENT_GUIDE.md"
    echo ""
else
    echo -e "\n${RED}✗ $FAILED critical check(s) failed${NC}"
    echo ""
    echo -e "${RED}Please fix the errors above and run verification again:${NC}"
    echo "  ./verify-post-bootstrap.sh"
    echo ""
    exit 1
fi
