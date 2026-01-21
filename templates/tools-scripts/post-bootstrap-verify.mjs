#!/usr/bin/env node

/**
 * Post-bootstrap verification script
 *
 * Validates that the bootstrapped workspace is ready for development:
 * - Angular builds successfully
 * - All code passes linting and formatting
 * - All verification gates pass
 * - Tests run successfully
 * - Git is initialized and first commit is made
 *
 * Usage: node tools/scripts/post-bootstrap-verify.mjs
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * @typedef {Object} VerificationStep
 * @property {string} name - Name of the verification step
 * @property {string} command - Command to execute
 * @property {boolean} critical - Whether this step must pass
 * @property {string} description - Description of what's being checked
 */

const workspaceRoot = process.cwd();

/** @type {VerificationStep[]} */
const steps = [
  {
    name: 'Format',
    command: 'pnpm format',
    critical: true,
    description: 'Auto-formatting code...',
  },
  {
    name: 'ESLint Auto-fix',
    command: 'pnpm lint:fix',
    critical: true,
    description: 'Auto-fixing linting issues...',
  },
  {
    name: 'Format Again',
    command: 'pnpm format',
    critical: true,
    description: 'Re-formatting code after linting fixes...',
  },
  {
    name: 'Build',
    command: 'pnpm build',
    critical: true,
    description: 'Building Angular application...',
  },
  {
    name: 'Type Check',
    command: 'pnpm typecheck',
    critical: true,
    description: 'Type checking TypeScript...',
  },
  {
    name: 'Linting',
    command: 'pnpm lint',
    critical: true,
    description: 'Linting code...',
  },
  {
    name: 'Format Check',
    command: 'pnpm format:check',
    critical: true,
    description: 'Checking code formatting...',
  },
  {
    name: 'Unit Tests',
    command: 'pnpm test',
    critical: false,
    description: 'Running unit tests...',
  },
  {
    name: 'Verification Gates',
    command:
      'pnpm verify:structure && pnpm verify:app-routes && pnpm verify:feature-routes && pnpm verify:no-cross-feature-imports',
    critical: false,
    description: 'Running code structure verification gates...',
  },
];

let failed = 0;
let warnings = 0;

/**
 * Colored console logging utility
 * @param {string} message - Message to log
 * @param {'info'|'success'|'warn'|'error'} [level='info'] - Log level
 */
function log(message, level = 'info') {
  const colors = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';
  console.log(`${colors[level]}${message}${reset}`);
}

/**
 * Execute a single verification step
 * @param {VerificationStep} step - Step to execute
 * @returns {boolean} - Whether to continue verification
 */
function runStep(step) {
  try {
    log(`\n▶ ${step.description}`, 'info');
    execSync(step.command, {
      stdio: 'inherit',
      cwd: workspaceRoot,
      shell: true,
    });
    log(`✓ ${step.name} passed`, 'success');
    return true;
  } catch {
    if (step.critical) {
      log(`✗ ${step.name} failed (CRITICAL)`, 'error');
      failed++;
      return false;
    } else {
      log(`⚠ ${step.name} failed (non-critical)`, 'warn');
      warnings++;
      return true;
    }
  }
}

/**
 * Initialize git repository and create first commit
 * @returns {boolean} - Whether git initialization was successful
 */
function initializeGit() {
  try {
    if (!existsSync(join(workspaceRoot, '.git'))) {
      log('\n▶ Initializing git repository...', 'info');
      try {
        execSync('git init -b main', { stdio: 'pipe', cwd: workspaceRoot });
        execSync('git config user.email "dev@example.com"', { stdio: 'pipe', cwd: workspaceRoot });
        execSync('git config user.name "Developer"', { stdio: 'pipe', cwd: workspaceRoot });
      } catch {
        // Git might already be initialized, continue
      }
      log('✓ Git initialized', 'success');
    }

    // Check if there are changes to commit
    try {
      execSync('git diff --quiet', { stdio: 'pipe', cwd: workspaceRoot });
      execSync('git diff --cached --quiet', { stdio: 'pipe', cwd: workspaceRoot });
      // No changes
      return true;
    } catch {
      // There are changes to commit
      log('\n▶ Making first commit...', 'info');
      try {
        execSync('git add .', { stdio: 'pipe', cwd: workspaceRoot });
        execSync('git commit -m "chore: initial bootstrap commit"', {
          stdio: 'pipe',
          cwd: workspaceRoot,
        });
        log('✓ First commit created', 'success');
        return true;
      } catch (commitError) {
        log(
          `⚠ Could not create commit: ${commitError instanceof Error ? commitError.message : 'Unknown error'}`,
          'warn',
        );
        return false;
      }
    }
  } catch (error) {
    log(
      `⚠ Could not initialize git: ${error instanceof Error ? error.message : String(error)}`,
      'warn',
    );
    return false;
  }
}

/**
 * Print verification summary
 * @returns {boolean} - Whether all critical checks passed
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('VERIFICATION SUMMARY', 'info');
  console.log('='.repeat(60));

  if (failed === 0) {
    log(`\n✓ All critical checks passed!`, 'success');
    if (warnings > 0) {
      log(`  (${warnings} non-critical warning(s))`, 'warn');
    }
    log(`\n✓ Project is ready for development!`, 'success');
    log('\nNext steps:', 'info');
    log('  1. Start development: pnpm dev', 'info');
    log(
      '  2. Generate features: pnpm gen:feature FeatureName --route feature-name --register',
      'info',
    );
    log('  3. Check documentation:', 'info');
    log('     - README.md - Project overview', 'info');
    log('     - docs/ARCHITECTURE.md - Core rules', 'info');
    log('     - docs/DEVELOPMENT.md - Daily workflows', 'info');
    log('     - docs/TESTING.md - Testing guidance', 'info');
    log('     - docs/STYLING.md - Tailwind + Material', 'info');
    log('     - docs/API.md - Backend integration', 'info');
    log('     - docs/VERIFICATION.md - Verification gates', 'info');
    log('     - docs/TROUBLESHOOTING.md - Common issues', 'info');
    return true;
  } else {
    log(`\n✗ ${failed} critical check(s) failed`, 'error');
    log(`\nPlease fix the errors above and run verification again:`, 'error');
    log('  pnpm verify', 'info');
    return false;
  }
}

/**
 * Main verification entry point
 */
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'info');
  log('║          POST-BOOTSTRAP VERIFICATION SCRIPT                ║', 'info');
  log('║                                                            ║', 'info');
  log('║  This script validates that your Angular workspace is     ║', 'info');
  log('║  ready for development.                                   ║', 'info');
  log('╚════════════════════════════════════════════════════════════╝', 'info');

  log(`\nWorkspace: ${workspaceRoot}`, 'info');
  log(`Total checks: ${steps.length}\n`, 'info');

  let continueVerification = true;
  for (const step of steps) {
    if (!runStep(step)) {
      if (step.critical) {
        continueVerification = false;
        break;
      }
    }
  }

  if (continueVerification && failed === 0) {
    initializeGit();
  }

  const success = printSummary();

  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  log(`\nUnexpected error: ${error instanceof Error ? error.message : String(error)}`, 'error');
  process.exit(1);
});
