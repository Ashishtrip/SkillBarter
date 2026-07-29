import { createSwaggerSpec } from 'next-swagger-doc';
import 'swagger-ui-react/swagger-ui.css';
import { SwaggerUI } from './swagger-ui';

async function ApiDocPage() {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Skill Barter API',
        version: '1.0.0',
      },
    },
    apiFolder: 'src/app/api',
  });

  return <SwaggerUI spec={spec} />;
}

export default ApiDocPage;
