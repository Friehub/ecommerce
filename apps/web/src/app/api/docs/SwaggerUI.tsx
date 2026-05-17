'use client';

import React, { useEffect } from 'react';
import 'swagger-ui-dist/swagger-ui.css';

export default function SwaggerUI() {
  useEffect(() => {
    const initSwagger = async () => {
      const { SwaggerUIBundle, SwaggerUIStandalonePreset } = await import('swagger-ui-dist');
      SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset,
        ],
        layout: 'StandaloneLayout',
      });
    };
    initSwagger();
  }, []);

  return <div id="swagger-ui" />;
}
