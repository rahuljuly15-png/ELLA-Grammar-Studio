import type { BackendFramework, EntityDefinition, EndpointDefinition, RepoAnalysis, RepoMetadata } from '../types';

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  const clean = input.trim();
  if (!clean) return null;

  // Match full GitHub URL e.g. https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?/);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, ''),
    };
  }

  // Match owner/repo
  const shortMatch = clean.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/, ''),
    };
  }

  return null;
}

export async function fetchRepoFromGitHub(
  owner: string,
  repo: string,
  githubToken?: string
): Promise<RepoAnalysis> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (githubToken) {
    headers.Authorization = `token ${githubToken.trim()}`;
  }

  // 1. Fetch metadata
  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!metaRes.ok) {
    if (metaRes.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
    }
    if (metaRes.status === 403) {
      throw new Error(
        'GitHub API rate limit reached (60 req/hr for unauthenticated IP). You can provide a GitHub personal token in the settings or test with pre-built repositories.'
      );
    }
    throw new Error(`GitHub error: ${metaRes.statusText}`);
  }
  const metaData = await metaRes.json();

  // 2. Fetch root contents
  let fileNames: string[] = [];
  try {
    const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
    if (contentsRes.ok) {
      const items = await contentsRes.json();
      if (Array.isArray(items)) {
        fileNames = items.map((i: any) => i.name);
      }
    }
  } catch {
    // Continue if contents call fails
  }

  // 3. Fetch README
  let readmeSnippet = '';
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, Accept: 'application/vnd.github.v3.raw' },
    });
    if (readmeRes.ok) {
      const fullReadme = await readmeRes.text();
      readmeSnippet = fullReadme.slice(0, 1500);
    }
  } catch {
    // Continue
  }

  // 4. Detect Framework and Architecture
  let framework: BackendFramework = 'Generic Backend';
  let database = 'Database / Data Store';
  let authStrategy = 'Bearer Token / Session Auth';
  const detectedFiles: string[] = [...fileNames];

  const lowerFiles = fileNames.map((f) => f.toLowerCase());
  const lowerReadme = readmeSnippet.toLowerCase();

  if (
    lowerFiles.includes('requirements.txt') ||
    lowerFiles.includes('pyproject.toml') ||
    metaData.language === 'Python'
  ) {
    if (lowerReadme.includes('fastapi') || lowerFiles.some((f) => f.includes('main.py'))) {
      framework = 'FastAPI';
      database = 'PostgreSQL / SQLite via SQLAlchemy or SQLModel';
      authStrategy = 'OAuth2 Bearer JWT Tokens';
    } else if (lowerReadme.includes('django') || lowerFiles.includes('manage.py')) {
      framework = 'Django / DRF';
      database = 'PostgreSQL / MySQL via Django ORM';
      authStrategy = 'Django Session & Token Auth';
    } else {
      framework = 'Flask';
      database = 'SQLAlchemy ORM';
      authStrategy = 'JWT / Session Cookie';
    }
  } else if (
    lowerFiles.includes('package.json') ||
    metaData.language === 'TypeScript' ||
    metaData.language === 'JavaScript'
  ) {
    if (lowerReadme.includes('nestjs') || lowerFiles.some((f) => f.includes('nest'))) {
      framework = 'NestJS';
      database = 'Prisma / TypeORM with PostgreSQL';
      authStrategy = 'Passport.js JWT Guard';
    } else {
      framework = 'Express / Node.js';
      database = 'MongoDB / PostgreSQL (Prisma/Sequelize)';
      authStrategy = 'JWT Bearer Token';
    }
  } else if (lowerFiles.includes('go.mod') || metaData.language === 'Go') {
    framework = 'Go (Gin/Fiber)';
    database = 'PostgreSQL / GORM';
    authStrategy = 'HMAC JWT Token';
  } else if (lowerFiles.includes('pom.xml') || lowerFiles.includes('build.gradle')) {
    framework = 'Spring Boot';
    database = 'Spring Data JPA / Hibernate';
    authStrategy = 'Spring Security OAuth2 / JWT';
  }

  // 5. Generate inferred entities & endpoints based on repo context
  const primarySlug = repo.replace(/[-_](api|backend|server|service|core|app)$/i, '').toLowerCase();
  const entityName = primarySlug.charAt(0).toUpperCase() + primarySlug.slice(1);

  const entities: EntityDefinition[] = [
    {
      id: primarySlug || 'records',
      name: `${entityName} Management`,
      singular: entityName || 'Item',
      plural: `${entityName}s` || 'Items',
      iconName: 'Database',
      fields: [
        { name: 'id', type: 'string', label: 'ID', isId: true, mockValue: 'rec_01' },
        { name: 'name', type: 'string', label: 'Name / Title', required: true, mockValue: `Primary ${entityName} Instance` },
        { name: 'status', type: 'badge', label: 'Status', options: ['Active', 'Pending', 'Archived'], mockValue: 'Active' },
        { name: 'priority', type: 'badge', label: 'Priority', options: ['High', 'Normal', 'Low'], mockValue: 'Normal' },
        { name: 'created_at', type: 'date', label: 'Created At', mockValue: new Date().toISOString().split('T')[0] },
      ],
      sampleData: [
        {
          id: 'rec_01',
          name: `Sample ${entityName} A`,
          status: 'Active',
          priority: 'High',
          created_at: '2026-03-01',
        },
        {
          id: 'rec_02',
          name: `Sample ${entityName} B`,
          status: 'Pending',
          priority: 'Normal',
          created_at: '2026-03-14',
        },
        {
          id: 'rec_03',
          name: `Sample ${entityName} C`,
          status: 'Active',
          priority: 'Low',
          created_at: '2026-03-22',
        },
      ],
    },
    {
      id: 'activity',
      name: 'Audit & Activity Logs',
      singular: 'Log',
      plural: 'Logs',
      iconName: 'Activity',
      fields: [
        { name: 'id', type: 'string', label: 'Log ID', isId: true, mockValue: 'log_901' },
        { name: 'event', type: 'string', label: 'Event Type', required: true, mockValue: 'RESOURCE_UPDATED' },
        { name: 'user', type: 'string', label: 'Triggered By', mockValue: 'system_admin' },
        { name: 'timestamp', type: 'date', label: 'Timestamp', mockValue: new Date().toISOString() },
      ],
      sampleData: [
        { id: 'log_901', event: 'INSTANCE_CREATED', user: 'admin', timestamp: '2026-03-24 10:14:02' },
        { id: 'log_902', event: 'SCHEMA_SYNC', user: 'system', timestamp: '2026-03-24 11:00:15' },
      ],
    },
  ];

  const endpoints: EndpointDefinition[] = [
    {
      id: 'ep_list',
      method: 'GET',
      path: `/api/v1/${primarySlug}`,
      summary: `Fetch paginated list of ${entityName}s with query filters`,
      entityId: primarySlug,
      parameters: [
        { name: 'page', in: 'query', type: 'integer' },
        { name: 'limit', in: 'query', type: 'integer' },
        { name: 'search', in: 'query', type: 'string' },
      ],
      responseSample: {
        results: entities[0].sampleData,
        total: entities[0].sampleData.length,
      },
    },
    {
      id: 'ep_create',
      method: 'POST',
      path: `/api/v1/${primarySlug}`,
      summary: `Create a new ${entityName} entry`,
      entityId: primarySlug,
      requestBody: {
        name: `New ${entityName}`,
        status: 'Active',
        priority: 'Normal',
      },
      responseSample: {
        id: 'rec_04',
        name: `New ${entityName}`,
        status: 'Active',
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'ep_health',
      method: 'GET',
      path: '/healthz',
      summary: 'System health check and database connectivity prober',
      responseSample: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    },
  ];

  const metadata: RepoMetadata = {
    owner: metaData.owner?.login || owner,
    repo: metaData.name || repo,
    fullName: metaData.full_name || `${owner}/${repo}`,
    description: metaData.description || 'Custom Backend API Repository',
    stars: metaData.stargazers_count || 0,
    forks: metaData.forks_count || 0,
    openIssues: metaData.open_issues_count || 0,
    language: metaData.language || 'Code',
    defaultBranch: metaData.default_branch || 'main',
    topics: metaData.topics || [],
    updatedAt: metaData.updated_at || new Date().toISOString(),
    htmlUrl: metaData.html_url || `https://github.com/${owner}/${repo}`,
  };

  return {
    metadata,
    framework,
    database,
    authStrategy,
    detectedFiles,
    entities,
    endpoints,
    readmeSummary: readmeSnippet ? readmeSnippet.slice(0, 300) + '...' : undefined,
    suggestedTheme: 'indigo',
    frontendRecommendation: {
      recommendedViews: [
        `${entityName} Management Table`,
        'Create & Edit Form Drawer',
        'API Inspector & Swagger Console',
        'Activity & Audit Trail',
      ],
      primaryEntity: entityName,
      keyFeatures: [
        `Searchable data grid for ${entityName} with sortable columns`,
        'Pre-validated form dialog for new records',
        'Bearer token injection playground for API testing',
        'Clean responsive layout with Dark/Light theme support',
      ],
    },
  };
}

export function parseCustomBackendSchema(rawInput: string): RepoAnalysis {
  // Parses custom JSON / OpenAPI / text provided by user
  let parsedObj: any = null;
  try {
    parsedObj = JSON.parse(rawInput);
  } catch {
    // Not JSON, analyze as text
  }

  const defaultMetadata: RepoMetadata = {
    owner: 'custom',
    repo: 'provided-api-spec',
    fullName: 'custom/provided-api-spec',
    description: 'Custom repository specification provided directly by user',
    stars: 1,
    forks: 0,
    openIssues: 0,
    language: 'JSON / OpenAPI',
    defaultBranch: 'main',
    topics: ['custom-spec', 'rest-api'],
    updatedAt: new Date().toISOString(),
    htmlUrl: '#',
    isCustom: true,
  };

  if (parsedObj && (parsedObj.openapi || parsedObj.swagger)) {
    // OpenAPI / Swagger spec!
    const paths = parsedObj.paths || {};
    const endpoints: EndpointDefinition[] = [];
    let idx = 0;

    for (const [pathStr, methods] of Object.entries(paths)) {
      for (const [m, def] of Object.entries(methods as any)) {
        const methodUpper = m.toUpperCase();
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper)) {
          endpoints.push({
            id: `ep_${idx++}`,
            method: methodUpper as any,
            path: pathStr,
            summary: (def as any).summary || (def as any).description || `${methodUpper} ${pathStr}`,
            responseSample: { status: 200, message: 'Success' },
          });
        }
      }
    }

    return {
      metadata: {
        ...defaultMetadata,
        description: parsedObj.info?.title || 'Imported OpenAPI Specification',
      },
      framework: 'REST API',
      database: 'Configured by API',
      authStrategy: parsedObj.components?.securitySchemes ? 'OpenAPI Security Schemes' : 'Bearer JWT',
      detectedFiles: ['openapi.json', 'swagger.json'],
      entities: [
        {
          id: 'custom_items',
          name: 'Primary Schema Entity',
          singular: 'Item',
          plural: 'Items',
          fields: [
            { name: 'id', type: 'string', label: 'ID', isId: true, mockValue: 'item_1' },
            { name: 'name', type: 'string', label: 'Name', required: true, mockValue: 'Sample Record' },
            { name: 'status', type: 'badge', label: 'Status', options: ['Active', 'Draft'], mockValue: 'Active' },
          ],
          sampleData: [{ id: 'item_1', name: 'Sample Record', status: 'Active' }],
        },
      ],
      endpoints,
      suggestedTheme: 'indigo',
      frontendRecommendation: {
        recommendedViews: ['API Route Explorer', 'Data Table', 'Payload Tester'],
        primaryEntity: 'Record',
        keyFeatures: ['Interactive OpenAPI Tester', 'Generated Forms', 'Code Export'],
      },
    };
  }

  // Fallback for custom text
  return {
    metadata: defaultMetadata,
    framework: 'Generic Backend',
    database: 'Relational or Document Store',
    authStrategy: 'API Key / Bearer Token',
    detectedFiles: ['user_input_spec.txt'],
    entities: [
      {
        id: 'records',
        name: 'Custom Records',
        singular: 'Record',
        plural: 'Records',
        fields: [
          { name: 'id', type: 'string', label: 'ID', isId: true, mockValue: 'rec_101' },
          { name: 'title', type: 'string', label: 'Title', required: true, mockValue: 'Custom Record' },
          { name: 'status', type: 'badge', label: 'Status', options: ['Active', 'Pending'], mockValue: 'Active' },
        ],
        sampleData: [{ id: 'rec_101', title: 'Custom Record', status: 'Active' }],
      },
    ],
    endpoints: [
      {
        id: 'ep_custom',
        method: 'GET',
        path: '/api/v1/resource',
        summary: 'Primary resource endpoint',
        responseSample: { status: 'ok', data: [] },
      },
    ],
    suggestedTheme: 'indigo',
    frontendRecommendation: {
      recommendedViews: ['Resource Grid', 'Record Creator', 'API Client'],
      primaryEntity: 'Record',
      keyFeatures: ['Data grid', 'Input validation', 'React TSX component generation'],
    },
  };
}
