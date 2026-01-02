#!/usr/bin/env node

/**
 * Security Validation Script for GitHub Deployment
 * Scans repository for sensitive data and validates security measures
 */

const fs = require('fs');
const path = require('path');

// Security patterns to check for
const SECURITY_PATTERNS = {
  apiKeys: [
    /sk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live keys
    /sk_test_[a-zA-Z0-9]{24,}/g,  // Stripe test keys (should be placeholders)
    /pk_live_[a-zA-Z0-9]{24,}/g,  // Stripe publishable live keys
    /pk_test_[a-zA-Z0-9]{24,}/g,  // Stripe publishable test keys (should be placeholders)
    /whsec_[a-zA-Z0-9]{32,}/g,    // Stripe webhook secrets
    /AKIA[0-9A-Z]{16}/g,          // AWS access keys
    /AIza[0-9A-Za-z\\-_]{35}/g,   // Google API keys
  ],
  secrets: [
    /[a-zA-Z0-9]{32,}/g,          // Generic long strings (potential secrets)
    /secret[_-]?key[s]?[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{16,}['""]?/gi,
    /api[_-]?key[s]?[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{16,}['""]?/gi,
  ],
  databases: [
    /mongodb(\+srv)?:\/\/[^\s'"",;]+/gi,
    /postgres(ql)?:\/\/[^\s'"",;]+/gi,
  ],
};

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.env\.example/,
  /scripts\/validate-security\.js/,
  /src\/lib\/utils\/security-scanner/,
];

// Files that should exist
const REQUIRED_FILES = [
  '.env.example',
  '.gitignore',
  'README.md',
  'package.json',
];

// Files that should NOT exist (debug/temp files)
const FORBIDDEN_FILES = [
  'DEBUG-HOME-KITCHEN.md',
  'ERROR-HELP.md',
  'FIX-500-ERROR.md',
  'FIX-NO-PRODUCTS.md',
  'TROUBLESHOOTING.md',
  'TROUBLESHOOTING-CART.md',
  'QUICK-FIX.md',
  'CHANGES-LATEST.md',
  'GUEST-CART-FEATURE.md',
  'README-SIMPLE.md',
  'QUICKSTART.md',
  'SETUP.md',
  'START-HERE.md',
];

class SecurityValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      error: '❌ ERROR',
      warning: '⚠️  WARNING',
      success: '✅ PASSED',
      info: 'ℹ️  INFO'
    }[type];
    
    console.log(`[${timestamp}] ${prefix}: ${message}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addPassed(message) {
    this.passed.push(message);
    this.log(message, 'success');
  }

  // Check if file should be scanned
  shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    const validExtensions = ['.ts', '.js', '.tsx', '.jsx', '.json', '.env', '.md', '.yml', '.yaml'];
    
    if (!validExtensions.includes(ext) && ext !== '') {
      return false;
    }

    return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  // Get all files recursively
  getAllFiles(dirPath, files = []) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
        this.getAllFiles(fullPath, files);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Scan file for sensitive patterns
  scanFileForSecrets(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const issues = [];

      Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
        patterns.forEach(pattern => {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            // Skip if it's a placeholder pattern
            if (this.isPlaceholder(match[0])) {
              continue;
            }
            
            // Skip if it's a false positive
            if (this.isFalsePositive(filePath, match[0])) {
              continue;
            }

            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
              file: filePath,
              line: lineNumber,
              pattern: match[0],
              category,
            });
          }
        });
      });

      return issues;
    } catch (error) {
      this.addWarning(`Could not scan file ${filePath}: ${error.message}`);
      return [];
    }
  }

  // Check if a value is a placeholder
  isPlaceholder(value) {
    const placeholderPatterns = [
      /your[_-]?.*[_-]?(key|secret|name|url)/i,
      /pk_test_your_stripe/i,
      /sk_test_your_stripe/i,
      /whsec_your_stripe/i,
      /localhost/i,
      /example\.com/i,
      /your-database-name/i,
      /your-nextauth-secret/i,
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  // Check if this is a false positive (npm hashes, config values, etc.)
  isFalsePositive(filePath, value) {
    // Skip npm package-lock.json integrity hashes
    if (filePath.includes('package-lock.json')) {
      return true;
    }
    
    // Skip TypeScript config values
    if (filePath.includes('tsconfig.json')) {
      return true;
    }
    
    // Skip common config values that look like secrets but aren't
    const configPatterns = [
      /forceConsistentCasing/i,
      /noImplicitReturns/i,
      /noFallthroughCases/i,
    ];
    
    return configPatterns.some(pattern => pattern.test(value));
  }

  // Validate required files exist
  validateRequiredFiles() {
    this.log('Checking required files...', 'info');
    
    for (const file of REQUIRED_FILES) {
      if (fs.existsSync(file)) {
        this.addPassed(`Required file exists: ${file}`);
      } else {
        this.addIssue(`Missing required file: ${file}`);
      }
    }
  }

  // Validate forbidden files don't exist
  validateForbiddenFiles() {
    this.log('Checking for forbidden files...', 'info');
    
    for (const file of FORBIDDEN_FILES) {
      if (fs.existsSync(file)) {
        this.addIssue(`Forbidden file still exists: ${file}`);
      } else {
        this.addPassed(`Forbidden file properly removed: ${file}`);
      }
    }
  }

  // Validate .env.example has placeholders
  validateEnvExample() {
    this.log('Validating .env.example...', 'info');
    
    if (!fs.existsSync('.env.example')) {
      this.addIssue('.env.example file is missing');
      return;
    }

    try {
      const content = fs.readFileSync('.env.example', 'utf-8');
      const lines = content.split('\n');
      
      let hasPlaceholders = false;
      let hasRealSecrets = false;

      for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          
          if (value && value.trim()) {
            if (this.isPlaceholder(value)) {
              hasPlaceholders = true;
            } else if (value.length > 20 && !value.includes('localhost') && !value.includes('example')) {
              hasRealSecrets = true;
              this.addIssue(`Potential real secret in .env.example: ${key}`);
            }
          }
        }
      }

      if (hasPlaceholders) {
        this.addPassed('.env.example contains proper placeholder values');
      }

      if (!hasRealSecrets) {
        this.addPassed('.env.example contains no real secrets');
      }
    } catch (error) {
      this.addIssue(`Could not validate .env.example: ${error.message}`);
    }
  }

  // Validate .gitignore coverage
  validateGitignore() {
    this.log('Validating .gitignore...', 'info');
    
    if (!fs.existsSync('.gitignore')) {
      this.addIssue('.gitignore file is missing');
      return;
    }

    try {
      const content = fs.readFileSync('.gitignore', 'utf-8');
      const requiredPatterns = [
        '.env',
        'node_modules',
        '.next',
        '*.log',
        '.DS_Store',
        'dist',
        'build',
      ];

      for (const pattern of requiredPatterns) {
        if (content.includes(pattern)) {
          this.addPassed(`.gitignore includes ${pattern}`);
        } else {
          this.addWarning(`.gitignore missing pattern: ${pattern}`);
        }
      }
    } catch (error) {
      this.addIssue(`Could not validate .gitignore: ${error.message}`);
    }
  }

  // Main validation function
  async validate() {
    this.log('Starting security validation...', 'info');
    this.log('='.repeat(50), 'info');

    // Check required and forbidden files
    this.validateRequiredFiles();
    this.validateForbiddenFiles();
    this.validateEnvExample();
    this.validateGitignore();

    // Scan all files for secrets
    this.log('Scanning files for sensitive data...', 'info');
    const allFiles = this.getAllFiles('.');
    let totalScanned = 0;
    let totalIssues = 0;

    for (const file of allFiles) {
      if (this.shouldScanFile(file)) {
        totalScanned++;
        const fileIssues = this.scanFileForSecrets(file);
        
        if (fileIssues.length > 0) {
          totalIssues += fileIssues.length;
          for (const issue of fileIssues) {
            this.addIssue(`Sensitive data in ${issue.file}:${issue.line} - ${issue.category}: ${issue.pattern.substring(0, 20)}...`);
          }
        }
      }
    }

    if (totalIssues === 0) {
      this.addPassed(`Scanned ${totalScanned} files - no sensitive data found`);
    }

    // Generate report
    this.generateReport();
  }

  generateReport() {
    this.log('='.repeat(50), 'info');
    this.log('SECURITY VALIDATION REPORT', 'info');
    this.log('='.repeat(50), 'info');

    this.log(`✅ Passed: ${this.passed.length}`, 'success');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'warning');
    this.log(`❌ Issues: ${this.issues.length}`, 'error');

    if (this.issues.length === 0) {
      this.log('🎉 Repository is ready for GitHub deployment!', 'success');
      process.exit(0);
    } else {
      this.log('🚨 Repository has security issues that must be fixed before deployment!', 'error');
      this.log('Please address the issues above and run validation again.', 'error');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new SecurityValidator();
validator.validate().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});