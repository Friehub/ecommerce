import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from './root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Jumia Clone API',
  description: 'OpenAPI documentation for the Modular Ecommerce Infrastructure',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
});
