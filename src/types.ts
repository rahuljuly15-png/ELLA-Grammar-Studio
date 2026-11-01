export type BackendFramework =
  | 'FastAPI'
  | 'Express / Node.js'
  | 'Django / DRF'
  | 'Flask'
  | 'NestJS'
  | 'Go (Gin/Fiber)'
  | 'Spring Boot'
  | 'REST API'
  | 'Generic Backend';

export interface EntityField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'badge' | 'array' | 'object';
  label: string;
  required?: boolean;
  isId?: boolean;
  options?: string[];
  mockValue?: any;
}

export interface EntityDefinition {
  id: string;
  name: string;
  singular: string;
  plural: string;
  iconName?: string;
  fields: EntityField[];
  sampleData: Record<string, any>[];
}

export interface EndpointDefinition {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  entityId?: string;
  category?: string;
  parameters?: { name: string; in: 'path' | 'query' | 'header'; type: string; required?: boolean }[];
  requestBody?: Record<string, any>;
  responseSample: Record<string, any> | Array<Record<string, any>>;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  defaultBranch: string;
  topics: string[];
  updatedAt: string;
  htmlUrl: string;
  isCustom?: boolean;
}

export interface RepoAnalysis {
  metadata: RepoMetadata;
  framework: BackendFramework;
  database: string;
  authStrategy: string;
  detectedFiles: string[];
  entities: EntityDefinition[];
  endpoints: EndpointDefinition[];
  readmeSummary?: string;
  suggestedTheme: 'slate' | 'indigo' | 'emerald' | 'cyan';
  frontendRecommendation: {
    recommendedViews: string[];
    primaryEntity: string;
    keyFeatures: string[];
  };
}
