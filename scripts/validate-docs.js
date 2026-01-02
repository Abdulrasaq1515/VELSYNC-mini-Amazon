#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates documentation completeness and link validity
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

class DocumentationValidator {
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

  // Check if URL is valid
  async checkUrl(url) {
    return new Promise((resolve) => {
      const client = url.startsWith('https:') ? https : http;
      
      const request = client.get(url, (response) => {
        resolve({
          url,
          status: response.statusCode,
          valid: response.statusCode >= 200 && response.statusCode < 400
        });
      });

      request.on('error', () => {
        resolve({
          url,
          status: 0,
          valid: false
        });
      });

      request.setTimeout(5000, () => {
        request.destroy();
        resolve({
          url,
          status: 0,
          valid: false
        });
      });
    });
  }

  // Extract URLs from markdown content
  extractUrls(content) {
    const urlRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const urls = [];
    let match;

    while ((match = urlRegex.exec(content)) !== null) {
      const [, text, url] = match;
      if (url.startsWith('http')) {
        urls.push({ text, url });
      }
    }

    return urls;
  }

  // Validate README.md completeness
  validateReadmeCompleteness() {
    this.log('Validating README.md completeness...', 'info');

    if (!fs.existsSync('README.md')) {
      this.addIssue('README.md is missing');
      return;
    }

    try {
      const content = fs.readFileSync('README.md', 'utf-8');
      
      // Required sections
      const requiredSections = [
        'Features',
        'Tech Stack',
        'Getting Started',
        'Installation',
        'Environment Variables',
        'MongoDB',
        'Stripe',
        'Cloudinary',
        'Development',
        'Deployment',
        'Security',
      ];

      for (const section of requiredSections) {
        if (content.toLowerCase().includes(section.toLowerCase())) {
          this.addPassed(`README includes ${section} section`);
        } else {
          this.addWarning(`README missing ${section} section`);
        }
      }

      // Check for placeholder values documentation
      if (content.includes('.env.example')) {
        this.addPassed('README references .env.example');
      } else {
        this.addWarning('README should reference .env.example');
      }

      // Check for setup instructions
      if (content.includes('npm install') || content.includes('yarn install')) {
        this.addPassed('README includes installation instructions');
      } else {
        this.addIssue('README missing installation instructions');
      }

    } catch (error) {
      this.addIssue(`Could not validate README.md: ${error.message}`);
    }
  }

  // Validate .env.example documentation
  validateEnvDocumentation() {
    this.log('Validating .env.example documentation...', 'info');

    if (!fs.existsSync('.env.example')) {
      this.addIssue('.env.example is missing');
      return;
    }

    try {
      const content = fs.readFileSync('.env.example', 'utf-8');
      const lines = content.split('\n');
      
      let hasComments = false;
      let hasServiceLinks = false;
      let undocumentedVars = [];

      for (const line of lines) {
        if (line.startsWith('#')) {
          hasComments = true;
          if (line.includes('http')) {
            hasServiceLinks = true;
          }
        } else if (line.includes('=') && !line.startsWith('#')) {
          const [key] = line.split('=');
          
          // Check if this variable has documentation (comment above or inline)
          const lineIndex = lines.indexOf(line);
          const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
          
          if (!prevLine.startsWith('#') && !line.includes('#')) {
            undocumentedVars.push(key);
          }
        }
      }

      if (hasComments) {
        this.addPassed('.env.example includes documentation comments');
      } else {
        this.addWarning('.env.example should include documentation comments');
      }

      if (hasServiceLinks) {
        this.addPassed('.env.example includes service setup links');
      } else {
        this.addWarning('.env.example should include links to service setup guides');
      }

      if (undocumentedVars.length === 0) {
        this.addPassed('All environment variables are documented');
      } else {
        this.addWarning(`Undocumented environment variables: ${undocumentedVars.join(', ')}`);
      }

    } catch (error) {
      this.addIssue(`Could not validate .env.example: ${error.message}`);
    }
  }

  // Validate external links
  async validateExternalLinks() {
    this.log('Validating external links...', 'info');

    const filesToCheck = ['README.md', '.env.example'];
    const allUrls = [];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const urls = this.extractUrls(content);
          allUrls.push(...urls);
        } catch (error) {
          this.addWarning(`Could not read ${file}: ${error.message}`);
        }
      }
    }

    if (allUrls.length === 0) {
      this.addWarning('No external links found to validate');
      return;
    }

    this.log(`Checking ${allUrls.length} external links...`, 'info');

    for (const { text, url } of allUrls) {
      try {
        const result = await this.checkUrl(url);
        
        if (result.valid) {
          this.addPassed(`Link valid: ${text} (${url})`);
        } else {
          this.addWarning(`Link may be invalid: ${text} (${url}) - Status: ${result.status}`);
        }
      } catch (error) {
        this.addWarning(`Could not check link: ${url} - ${error.message}`);
      }
    }
  }

  // Validate placeholder quality
  validatePlaceholderQuality() {
    this.log('Validating placeholder quality...', 'info');

    if (!fs.existsSync('.env.example')) {
      return;
    }

    try {
      const content = fs.readFileSync('.env.example', 'utf-8');
      const lines = content.split('\n');
      
      const placeholderPatterns = [
        { pattern: /your[_-]?.*[_-]?(key|secret|name|url)/i, quality: 'good' },
        { pattern: /localhost/i, quality: 'good' },
        { pattern: /example\.com/i, quality: 'good' },
        { pattern: /your-database-name/i, quality: 'good' },
        { pattern: /changeme/i, quality: 'poor' },
        { pattern: /replace.*this/i, quality: 'poor' },
        { pattern: /^[a-zA-Z0-9]{32,}$/i, quality: 'poor' }, // Long random strings
      ];

      let goodPlaceholders = 0;
      let poorPlaceholders = 0;

      for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [, value] = line.split('=');
          
          if (value && value.trim()) {
            let isGoodPlaceholder = false;
            let isPoorPlaceholder = false;

            for (const { pattern, quality } of placeholderPatterns) {
              if (pattern.test(value)) {
                if (quality === 'good') {
                  isGoodPlaceholder = true;
                } else {
                  isPoorPlaceholder = true;
                }
                break;
              }
            }

            if (isGoodPlaceholder) {
              goodPlaceholders++;
            } else if (isPoorPlaceholder) {
              poorPlaceholders++;
            }
          }
        }
      }

      if (goodPlaceholders > 0) {
        this.addPassed(`Found ${goodPlaceholders} descriptive placeholder values`);
      }

      if (poorPlaceholders > 0) {
        this.addWarning(`Found ${poorPlaceholders} placeholder values that could be more descriptive`);
      }

    } catch (error) {
      this.addWarning(`Could not validate placeholder quality: ${error.message}`);
    }
  }

  // Main validation function
  async validate() {
    this.log('Starting documentation validation...', 'info');
    this.log('='.repeat(50), 'info');

    this.validateReadmeCompleteness();
    this.validateEnvDocumentation();
    this.validatePlaceholderQuality();
    
    // Validate external links (this may take some time)
    await this.validateExternalLinks();

    this.generateReport();
  }

  generateReport() {
    this.log('='.repeat(50), 'info');
    this.log('DOCUMENTATION VALIDATION REPORT', 'info');
    this.log('='.repeat(50), 'info');

    this.log(`✅ Passed: ${this.passed.length}`, 'success');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'warning');
    this.log(`❌ Issues: ${this.issues.length}`, 'error');

    if (this.issues.length === 0) {
      this.log('🎉 Documentation validation completed successfully!', 'success');
      
      if (this.warnings.length > 0) {
        this.log('Consider addressing the warnings above for better documentation quality.', 'warning');
      }
      
      process.exit(0);
    } else {
      this.log('🚨 Documentation has critical issues that should be fixed!', 'error');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new DocumentationValidator();
validator.validate().catch(error => {
  console.error('Documentation validation failed:', error);
  process.exit(1);
});