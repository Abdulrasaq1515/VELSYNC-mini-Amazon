// Security Scanner exports
export {
  SecurityScanner,
  scanRepositoryForSecrets,
  scanFileForSecrets,
} from './security-scanner';

// File Analyzer exports
export {
  FileAnalyzer,
  analyzeRepositoryFiles,
  analyzeFile,
} from './file-analyzer';

// Type exports
export type {
  SecurityScanResult,
  SensitivePattern,
  ScanConfig,
  FileScanResult,
  FileClassification,
} from './security-scanner.types';

export type {
  FileAnalysisResult,
} from './file-analyzer';

// Existing exports (if any)
export * from './api-response';
export * from './error-handler';
export * from './helpers';