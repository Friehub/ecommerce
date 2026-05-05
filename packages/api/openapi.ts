import { OpenAPIV3 } from 'openapi-types';
import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from './root';

export const openApiDocument: OpenAPIV3.Document = generateOpenApiDocument(appRouter, {
  title: 'Jumia Clone API',
  description: 'OpenAPI documentation for the Modular Ecommerce Infrastructure',
  version: '1.0.0',
  baseUrl: (process.env.API_URL || 'http://localhost:4000') + '/api',
});
