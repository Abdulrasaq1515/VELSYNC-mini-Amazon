/**
 * File Content Analysis Functions
 * Provides utilities for analyzing file content during GitHub deployment preparation
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileClassification } from './security-scanner.types';

export interface FileAnalysisResult {
  filePath: string;
  fileType: 'essential' | 'sensitive' | 'temporary' | 'documentation' | 'unknown';
  size: number;
  lastModified: Date;
  contentType: string;
  hasSecrets: boolean;
}

export class FileAnalyzer {
  private essentialPatterns: RegExp[] = [
    /^package\.json$/,
    /^package-lock\.json$/,
    /^tsconfig\.json$/,
    /^next\.config\.js$/,
    /^tailwind\.config\./,
    /^jest\.config\./,
    /^\.gitignore$/,
    /^\.prettierrc$/,
    /^\.prettierignore$/,
    /^eslintrc\./,
    /^docker-compose\.yml$/,
    /^\.dockerignore$/,
    /^postcss\.config\.js$/,
    /^next-env\.d\.ts$/,
    /^README\.md$/,
    /^src\//,
    /^public\//,
    /^scripts\//,
    /^github\/workflows\//,
  ];

  private temporaryPatterns: RegExp[] = [
    /^DEBUG-/,
    /^ERROR-HELP/,
    /^FIX-.*\.md$/,
    /^TROUBLESHOOTING.*\.md$/,
    /^QUICK-FIX/,
    /^GUEST-CART-FEATURE/,
    /^CHANGES-LATEST/,
    /\.log$/,
    /\.tmp$/,
    /\.temp$/,
    /~$/,
    /\.swp$/,
    /\.DS_Store$/,
    /Thumbs\.db$/,
  ];

  private sensitivePatterns: RegExp[] = [
    /^\.env$/,
    /^\.env\.local$/,
    /^\.env\.production$/,
    /^\.env\.development$/,
    /private.*key/i,
    /secret/i,
    /credential/i,
  ];

  private documentationPatterns: RegExp[] = [
    /^README.*\.md$/,
    /^SETUP\.md$/,
    /^QUICKSTART\.md$/,
    /^README-SIMPLE\.md$/,
    /^START-HERE\.md$/,
    /^CHANGES\.md$/,
    /\.md$/,
  ];

  /**
   * Analyze a single file and classify it
   */
  public async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    try {
      const stats = await fs.promises.stat(filePath);
      const fileName = path.basename(filePath);
      const relativePath = path.relative(process.cwd(), filePath);
      
      let contentType = 'unknown';
      let hasSecrets = false;

      // Determine content type based on extension
      const ext = path.extname(filePath).toLowerCase();
      switch (ext) {
        case '.ts':
        case '.tsx':
          contentType = 'typescript';
          break;
        case '.js':
        case '.jsx':
          contentType = 'javascript';
          break;
        case '.json':
          contentType = 'json';
          break;
        case '.md':
          contentType = 'markdown';
          break;
        case '.env':
          contentType = 'environment';
          hasSecrets = true;
          break;
        case '.yml':
        case '.yaml':
          contentType = 'yaml';
          break;
        default:
          contentType = 'text';
      }

      // Classify file type
      const fileType = this.classifyFile(relativePath, fileName);

      return {
        filePath: relativePath,
        fileType,
        size: stats.size,
        lastModified: stats.mtime,
        contentType,
        hasSecrets,
      };
    } catch (error) {
      throw new Error(`Failed to analyze file ${filePath}: ${error}`);
    }
  }

  /**
   * Classify a file based on its path and name
   */
  private classifyFile(relativePath: string, fileName: string): 'essential' | 'sensitive' | 'temporary' | 'documentation' | 'unknown' {
    // Check if it's a temporary file
    if (this.temporaryPatterns.some(pattern => pattern.test(fileName) || pattern.test(relativePath))) {
      return 'temporary';
    }

    // Check if it's a sensitive file
    if (this.sensitivePatterns.some(pattern => pattern.test(fileName) || pattern.test(relativePath))) {
      return 'sensitive';
    }

    // Check if it's documentation
    if (this.documentationPatterns.some(pattern => pattern.test(fileName))) {
      return 'documentation';
    }

    // Check if it's essential
    if (this.essentialPatterns.some(pattern => pattern.test(relativePath) || pattern.test(fileName))) {
      return 'essential';
    }

    return 'unknown';
  }

  /**
   * Analyze all files in a directory and classify them
   */
  public async analyzeDirectory(directoryPath: string): Promise<FileClassification> {
    const files = await this.getAllFiles(directoryPath);
    const classification: FileClassification = {
      essential: [],
      sensitive: [],
      temporary: [],
      documentation: [],
    };

    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file);
        
        switch (analysis.fileType) {
          case 'essential':
            classification.essential.push(analysis.filePath);
            break;
          case 'sensitive':
            classification.sensitive.push(analysis.filePath);
            break;
          case 'temporary':
            classification.temporary.push(analysis.filePath);
            break;
          case 'documentation':
            classification.documentation.push(analysis.filePath);
            break;
        }
      } catch (error) {
        console.warn(`Skipping file ${file}: ${error}`);
      }
    }

    return classification;
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const traverse = async (currentPath: string) => {
      try {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          // Skip node_modules, .git, .next, etc.
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await traverse(fullPath);
          } else if (entry.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Cannot read directory ${currentPath}: ${error}`);
      }
    };

    await traverse(dirPath);
    return files;
  }

  /**
   * Check if a directory should be skipped during analysis
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    return skipDirs.includes(dirName);
  }

  /**
   * Read and analyze file content for specific patterns
   */
  public async analyzeFileContent(filePath: string): Promise<{
    lineCount: number;
    hasImports: boolean;
    hasExports: boolean;
    hasSecretPatterns: boolean;
    encoding: string;
  }> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      return {
        lineCount: lines.length,
        hasImports: /^import\s+/m.test(content),
        hasExports: /^export\s+/m.test(content),
        hasSecretPatterns: this.hasSecretPatterns(content),
        encoding: 'utf-8',
      };
    } catch (error) {
      // Try reading as binary if UTF-8 fails
      try {
        await fs.promises.readFile(filePath);
        return {
          lineCount: 0,
          hasImports: false,
          hasExports: false,
          hasSecretPatterns: false,
          encoding: 'binary',
        };
      } catch {
        throw new Error(`Cannot read file ${filePath}: ${error}`);
      }
    }
  }

  /**
   * Check if content contains potential secret patterns
   */
  private hasSecretPatterns(content: string): boolean {
    const secretPatterns = [
      /sk_live_/,
      /sk_test_/,
      /pk_live_/,
      /pk_test_/,
      /whsec_/,
      /mongodb:\/\//,
      /postgres:\/\//,
      /password\s*[:=]/i,
      /secret\s*[:=]/i,
      /api[_-]?key\s*[:=]/i,
    ];

    return secretPatterns.some(pattern => pattern.test(content));
  }
}

/**
 * Convenience function to analyze a directory
 */
export async function analyzeRepositoryFiles(repositoryPath: string): Promise<FileClassification> {
  const analyzer = new FileAnalyzer();
  return await analyzer.analyzeDirectory(repositoryPath);
}

/**
 * Convenience function to analyze a single file
 */
export async function analyzeFile(filePath: string): Promise<FileAnalysisResult> {
  const analyzer = new FileAnalyzer();
  return await analyzer.analyzeFile(filePath);
}