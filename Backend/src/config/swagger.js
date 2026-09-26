const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Centralized Healthcare Record System (CHRS) API',
      version: '1.0.0',
      description: 'Central API that hospitals connect to in order to register patients, push medical records and pull a patient\'s history across facilities.\n\n' +
        '**Authentication**\n' +
        '- Hospital systems: send the API key issued when the hospital was registered in the `x-api-key` header (use the "Authorize" button, apiKeyAuth).\n' +
        '- CHRS dashboard users (admin/provider/patient): send the JWT from `/api/auth/login` or `/api/auth/demo-login` as `Authorization: Bearer <token>`.',
      contact: {
        name: 'API Support',
        email: 'support@chrs.com'
      }
    },
    servers: [
      {
        // Relative URL: "Try it out" calls whichever host is serving these docs (localhost or EC2)
        url: '/',
        description: 'Current server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Hospital API key, issued by an admin when the hospital is registered'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'provider', 'admin'] },
            name: { type: 'string' },
            identifier: { type: 'string' }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nin: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            dateOfBirth: { type: 'string' },
            bloodType: { type: 'string' },
            allergies: { type: 'array', items: { type: 'string' } },
            recentVisits: { type: 'array', items: { $ref: '#/components/schemas/Visit' } }
          }
        },
        Visit: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            date: { type: 'string' },
            hospital: { type: 'string' },
            doctor: { type: 'string' },
            diagnosis: { type: 'string' },
            status: { type: 'string' },
            recordType: { type: 'string', enum: ['diagnosis', 'lab', 'prescription', 'imaging', 'procedure'] },
            notes: { type: 'string' },
            vitals: {
              type: 'object',
              properties: {
                bloodPressure: { type: 'string' },
                temperature: { type: 'number' },
                heartRate: { type: 'number' },
                weight: { type: 'number' }
              }
            },
            labResults: { type: 'object' },
            prescriptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  drug: { type: 'string' },
                  dosage: { type: 'string' }
                }
              }
            },
            imagingFindings: { type: 'string' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            time: { type: 'string' },
            read: { type: 'boolean' }
          }
        },
        Hospital: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['government', 'private'] },
            state: { type: 'string' },
            address: { type: 'string' },
            registrationCode: { type: 'string' },
            apiKeyPrefix: { type: 'string', description: 'First characters of the API key, for identification only' },
            isActive: { type: 'boolean' },
            lastActivityAt: { type: 'string', format: 'date-time' },
            staffCount: { type: 'number' },
            activeStaffCount: { type: 'number' }
          }
        },
        HospitalInput: {
          type: 'object',
          required: ['name', 'state'],
          properties: {
            name: { type: 'string', example: 'General Hospital, Ikeja' },
            type: { type: 'string', enum: ['government', 'private'] },
            state: { type: 'string', example: 'Lagos' },
            address: { type: 'string' }
          }
        },
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            hospitalId: { type: 'string' },
            licenseNumber: { type: 'string', description: 'MDCN (doctor) or RON (nurse) number' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['doctor', 'nurse'] },
            isActive: { type: 'boolean' },
            revokedAt: { type: 'string', format: 'date-time' }
          }
        },
        AccessRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            patientName: { type: 'string' },
            patientNin: { type: 'string' },
            hospitalId: { type: 'string' },
            hospitalName: { type: 'string' },
            doctorName: { type: 'string' },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            reviewedBy: { type: 'string' },
            reviewedAt: { type: 'string', format: 'date-time' },
            reviewNote: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AdminStats: {
          type: 'object',
          properties: {
            totalPatients: { type: 'number' },
            totalRecords: { type: 'number' },
            totalHospitals: { type: 'number' },
            activeHospitals: { type: 'number' },
            totalStaff: { type: 'number' },
            activeStaff: { type: 'number' },
            pendingAccessRequests: { type: 'number' },
            hospitals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  state: { type: 'string' },
                  status: { type: 'string', enum: ['syncing', 'idle', 'offline'] },
                  lastActivityAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        AIRecommendation: {
          type: 'object',
          properties: {
            diagnosis: { type: 'string' },
            confidence: { type: 'number' },
            reasoning: { type: 'string' },
            prognosis: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
            differentialDiagnosis: { type: 'array', items: { type: 'string' } }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'provider', 'admin'] },
            name: { type: 'string' },
            identifier: { type: 'string' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'role', 'name'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'provider', 'admin'] },
            name: { type: 'string' },
            identifier: { type: 'string' },
            phoneNumber: { type: 'string' },
            nin: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
