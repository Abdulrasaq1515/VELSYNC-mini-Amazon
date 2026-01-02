/**
 * Security Scanner Utility for GitHub Deployment Preparation
 * Detects sensitive data patterns in repository files
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  SecurityScanResult, 
  SensitivePattern, 
  ScanConfig, 
  FileScanResult 
} from './security-scanner.types';

export class SecurityScanner {
  private config: ScanConfig;

  constructor(config?: Partial<ScanConfig>) {
    this.config = {
      patterns: {
        apiKeys: [
          /sk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live keys
          /sk_test_[a-zA-Z0-9]{24,}/g,  // Stripe test keys
          /pk_live_[a-zA-Z0-9]{24,}/g,  // Stripe publishable live keys
          /pk_test_[a-zA-Z0-9]{24,}/g,  // Stripe publishable test keys
          /whsec_[a-zA-Z0-9]{32,}/g,    // Stripe webhook secrets
          /AKIA[0-9A-Z]{16}/g,          // AWS access keys
          /[0-9a-zA-Z/+]{40}/g,         // AWS secret keys (base64)
          /AIza[0-9A-Za-z\\-_]{35}/g,   // Google API keys
        ],
        secrets: [
          /[a-zA-Z0-9]{32,}/g,          // Generic long strings (potential secrets)
          /secret[_-]?key[s]?[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{16,}['""]?/gi,
          /api[_-]?key[s]?[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{16,}['""]?/gi,
          /auth[_-]?token[s]?[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{16,}['""]?/gi,
        ],
        credentials: [
          /password[\s]*[:=][\s]*['""]?[^\s'"",;]{8,}['""]?/gi,
          /username[\s]*[:=][\s]*['""]?[^\s'"",;]{3,}['""]?/gi,
          /user[\s]*[:=][\s]*['""]?[^\s'"",;]{3,}['""]?/gi,
        ],
        databases: [
          /mongodb(\+srv)?:\/\/[^\s'"",;]+/gi,
          /postgres(ql)?:\/\/[^\s'"",;]+/gi,
          /mysql:\/\/[^\s'"",;]+/gi,
          /redis:\/\/[^\s'"",;]+/gi,
        ],
        tokens: [
          /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
          /token[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=]{20,}['""]?/gi,
          /jwt[\s]*[:=][\s]*['""]?[a-zA-Z0-9+/=._-]{20,}['""]?/gi,
        ],
      },
      excludePatterns: [
        /node_modules/,
        /\.git/,
        /\.next/,
        /dist/,
        /build/,
        /coverage/,
        /\.env\.example/,
        /\.env\.template/,
      ],
      fileExtensions: ['.ts', '.js', '.tsx', '.jsx', '.json', '.env', '.md', '.yml', '.yaml'],
      ...config,
    };
  }

  /**
   * Scan a single file for sensitive patterns
   */
  public async scanFile(filePath: string): Promise<FileScanResult> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const stats = await fs.promises.stat(filePath);
      const patterns: SensitivePattern[] = [];

      // Check each pattern category
      Object.entries(this.config.patterns).forEach(([category, regexList]) => {
        regexList.forEach((regex) => {
          const matches = content.matchAll(regex);
          for (const match of matches) {
            if (match.index !== undefined) {
              const lineNumber = this.getLineNumber(content, match.index);
              patterns.push({
                file: filePath,
                line: lineNumber,
                pattern: match[0],
                severity: this.getSeverity(category),
                description: `Potential ${category} detected`,
              });
            }
          }
        });
      });

      return {
        filePath,
        hasSecrets: patterns.length > 0,
        patterns,
        fileSize: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      throw new Error(`Failed to scan file ${filePath}: ${error}`);
    }
  }

  /**
   * Scan multiple files or directories
   */
  public async scanDirectory(directoryPath: string): Promise<SecurityScanResult> {
    const allFiles = await this.getAllFiles(directoryPath);
    const scanResults: FileScanResult[] = [];
    const flaggedFiles: string[] = [];
    const allPatterns: SensitivePattern[] = [];

    for (const file of allFiles) {
      if (this.shouldScanFile(file)) {
        try {
          const result = await this.scanFile(file);
          scanResults.push(result);
          
          if (result.hasSecrets) {
            flaggedFiles.push(file);
            allPatterns.push(...result.patterns);
          }
        } catch (error) {
          console.warn(`Skipping file ${file}: ${error}`);
        }
      }
    }

    return {
      sensitiveDataFound: allPatterns.length > 0,
      flaggedFiles,
      flaggedPatterns: allPatterns,
      recommendations: this.generateRecommendations(allPatterns),
      scanTimestamp: new Date(),
    };
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const traverse = async (currentPath: string) => {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.isExcludedPath(fullPath)) {
            await traverse(fullPath);
          }
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    };

    await traverse(dirPath);
    return files;
  }

  /**
   * Check if a file should be scanned based on extension and exclusion patterns
   */
  private shouldScanFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const hasValidExtension = this.config.fileExtensions.includes(ext) || ext === '';
    
    return hasValidExtension && !this.isExcludedPath(filePath);
  }

  /**
   * Check if a path should be excluded from scanning
   */
  private isExcludedPath(filePath: string): boolean {
    return this.config.excludePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Get line number for a given character index in content
   */
  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Determine severity based on pattern category
   */
  private getSeverity(category: string): 'high' | 'medium' | 'low' {
    switch (category) {
      case 'apiKeys':
      case 'secrets':
        return 'high';
      case 'credentials':
      case 'tokens':
        return 'medium';
      case 'databases':
        return 'high';
      default:
        return 'low';
    }
  }

  /**
   * Generate recommendations based on found patterns
   */
  private generateRecommendations(patterns: SensitivePattern[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(patterns.map(p => p.description));

    if (categories.has('Potential apiKeys detected')) {
      recommendations.push('Replace API keys with placeholder values in .env.example');
      recommendations.push('Ensure real API keys are only in .env (which should be gitignored)');
    }

    if (categories.has('Potential secrets detected')) {
      recommendations.push('Replace secret values with descriptive placeholders');
      recommendations.push('Document how to obtain real secrets in README.md');
    }

    if (categories.has('Potential databases detected')) {
      recommendations.push('Replace database URLs with localhost examples');
      recommendations.push('Document database setup instructions');
    }

    if (categories.has('Potential credentials detected')) {
      recommendations.push('Remove hardcoded credentials');
      recommendations.push('Use environment variables for all authentication');
    }

    if (recommendations.length === 0) {
      recommendations.push('No sensitive data detected - repository appears secure');
    }

    return recommendations;
  }
}

/**
 * Convenience function to create and use scanner
 */
export async function scanRepositoryForSecrets(
  repositoryPath: string, 
  config?: Partial<ScanConfig>
): Promise<SecurityScanResult> {
  const scanner = new SecurityScanner(config);
  return await scanner.scanDirectory(repositoryPath);
}

/**
 * Convenience function to scan a single file
 */
export async function scanFileForSecrets(
  filePath: string, 
  config?: Partial<ScanConfig>
): Promise<FileScanResult> {
  const scanner = new SecurityScanner(config);
  return await scanner.scanFile(filePath);
}