// server/utils/apiDocGenerator.js - API documentation generator for DISMS
const fs = require('fs').promises;
const path = require('path');

class APIDocumentationGenerator {
  constructor() {
    this.apiEndpoints = [];
    this.schemas = {};
    this.examples = {};
  }

  // Register API endpoint
  registerEndpoint(endpoint) {
    this.apiEndpoints.push({
      method: endpoint.method,
      path: endpoint.path,
      description: endpoint.description,
      access: endpoint.access,
      parameters: endpoint.parameters || [],
      requestBody: endpoint.requestBody || null,
      responses: endpoint.responses || {},
      examples: endpoint.examples || {},
      tags: endpoint.tags || []
    });
  }

  // Register schema
  registerSchema(name, schema) {
    this.schemas[name] = schema;
  }

  // Generate OpenAPI specification
  generateOpenAPISpec() {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'DISMS API',
        description: 'Digital Identity & Sovereign Management System API for Cameroon',
        version: '1.0.0',
        contact: {
          name: 'DISMS Team',
          email: 'support@disms.cm'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
          description: 'Development server'
        },
        {
          url: 'https://api.disms.cm',
          description: 'Production server'
        }
      ],
      security: [
        {
          bearerAuth: []
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: this.generateSchemas(),
        responses: this.generateCommonResponses()
      },
      paths: this.generatePaths(),
      tags: this.generateTags()
    };

    return spec;
  }

  // Generate schemas section
  generateSchemas() {
    return {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['citizen', 'issuer', 'verifier'] },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              dateOfBirth: { type: 'string', format: 'date' },
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  postalCode: { type: 'string' },
                  country: { type: 'string' }
                }
              }
            }
          },
          verification: {
            type: 'object',
            properties: {
              emailVerified: { type: 'boolean' },
              phoneVerified: { type: 'boolean' },
              identityVerified: { type: 'boolean' },
              verificationLevel: { type: 'integer', minimum: 0, maximum: 5 }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Credential: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          issuerId: { type: 'string', format: 'uuid' },
          type: { 
            type: 'string', 
            enum: ['identity', 'education', 'employment', 'financial', 'health', 'government'] 
          },
          status: { 
            type: 'string', 
            enum: ['pending', 'verified', 'rejected', 'revoked'] 
          },
          data: { type: 'object' },
          metadata: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              issuer: { type: 'string' },
              issuedAt: { type: 'string', format: 'date-time' },
              expirationDate: { type: 'string', format: 'date-time' }
            }
          },
          blockchain: {
            type: 'object',
            properties: {
              transactionHash: { type: 'string' },
              blockNumber: { type: 'integer' },
              merkleRoot: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      VerificationRequest: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          credentialOwnerId: { type: 'string', format: 'uuid' },
          requesterId: { type: 'string', format: 'uuid' },
          credentialType: { type: 'string' },
          requestedAttributes: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          purpose: { type: 'string' },
          status: { 
            type: 'string', 
            enum: ['pending', 'approved', 'rejected'] 
          },
          requestedAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      ShareSession: {
        type: 'object',
        properties: {
          shareId: { type: 'string', format: 'uuid' },
          credentialId: { type: 'string', format: 'uuid' },
          shareType: { type: 'string', enum: ['qr', 'link'] },
          revealedAttributes: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          expiresAt: { type: 'string', format: 'date-time' },
          maxUses: { type: 'integer', minimum: 1 },
          currentUses: { type: 'integer', minimum: 0 },
          qrCode: { type: 'string', description: 'Base64 encoded QR code image' },
          shareUrl: { type: 'string', format: 'uri' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    };
  }

  // Generate common responses
  generateCommonResponses() {
    return {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Success' }
          }
        }
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Email is required'
                }
              ]
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Authentication required'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Insufficient permissions'
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Resource not found'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Internal server error'
            }
          }
        }
      }
    };
  }

  // Generate paths section
  generatePaths() {
    const paths = {};

    // Group endpoints by path
    this.apiEndpoints.forEach(endpoint => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        description: endpoint.description,
        tags: endpoint.tags,
        security: endpoint.access === 'Public' ? [] : [{ bearerAuth: [] }],
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: {
          '200': { $ref: '#/components/responses/Success' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
          ...endpoint.responses
        }
      };
    });

    return paths;
  }

  // Generate tags section
  generateTags() {
    return [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Credentials',
        description: 'Digital credential management'
      },
      {
        name: 'Verification',
        description: 'Credential verification operations'
      },
      {
        name: 'Sharing',
        description: 'Credential sharing and selective disclosure'
      },
      {
        name: 'Biometric',
        description: 'Biometric authentication'
      },
      {
        name: 'Blockchain',
        description: 'Blockchain integration'
      }
    ];
  }

  // Generate HTML documentation
  async generateHTMLDoc() {
    const spec = this.generateOpenAPISpec();
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DISMS API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/docs/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;

    return html;
  }

  // Save documentation files
  async saveDocumentation(outputDir = './docs') {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Generate and save OpenAPI spec
      const spec = this.generateOpenAPISpec();
      await fs.writeFile(
        path.join(outputDir, 'openapi.json'),
        JSON.stringify(spec, null, 2)
      );

      // Generate and save HTML documentation
      const html = await this.generateHTMLDoc();
      await fs.writeFile(
        path.join(outputDir, 'index.html'),
        html
      );

      console.log(`API documentation saved to ${outputDir}`);
      return true;
    } catch (error) {
      console.error('Error saving documentation:', error);
      return false;
    }
  }
}

// Export singleton instance
const apiDocGenerator = new APIDocumentationGenerator();

module.exports = {
  apiDocGenerator,
  APIDocumentationGenerator
};
