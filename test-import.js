try {
    const api = require('@ecom/api/openapi');
    console.log('Success:', api.openApiDocument ? 'Document found' : 'Document missing');
} catch (e) {
    console.error('Failed to load @ecom/api/openapi:', e.message);
}
