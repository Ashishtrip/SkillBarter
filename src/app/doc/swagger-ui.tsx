'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

export const SwaggerUI = dynamic<any>(() => import('swagger-ui-react'), {
  ssr: false,
});
