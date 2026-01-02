/**
 * TypeScript interfaces for security scanning results
 * Used for GitHub deployment preparation security validation
 */

export interface SensitivePattern {
  file: string;
  line: number;
  pattern: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface SecurityScanResult {
  sensitiveDataFound: boolean;
  flaggedFiles: string[];
  flaggedPatterns: SensitivePattern[];
  recommendations: string[];
  scanTimestamp: Date;
}

export interface FileClassification {
  essential: string[];      // Core project files to keep
  sensitive: string[];      // Files containing secrets
  temporary: string[];      // Files to remove
  documentation: string[];  // Files to consolidate
}

export interface ScanConfig {
  patterns: {
    apiKeys: RegExp[];
    secrets: RegExp[];
    credentials: RegExp[];
    databases: RegExp[];
    tokens: RegExp[];
  };
  excludePatterns: RegExp[];
  fileExtensions: string[];
}

export interface FileScanResult {
  filePath: string;
  hasSecrets: boolean;
  patterns: SensitivePattern[];
  fileSize: number;
  lastModified: Date;
}