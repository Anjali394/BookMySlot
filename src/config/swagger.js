const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BookMySlot API',
    version: '1.0.0',
    description:
      'A production-style REST API for appointment and slot booking. Built with Node.js, Express, Prisma, and PostgreSQL (Neon).',
    contact: { name: 'Anjali Singh' },
  },
  servers: [
    { url: 'https://book-my-slot-peach.vercel.app', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Local Development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer' },
          message: { type: 'string' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Anjali Singh' },
          email: { type: 'string', format: 'email', example: 'anjali@test.com' },
          password: { type: 'string', example: 'Test1234' },
          role: { type: 'string', enum: ['CUSTOMER', 'PROVIDER'], example: 'CUSTOMER' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'anjali@test.com' },
          password: { type: 'string', example: 'Test1234' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Providers', description: 'Provider profiles & business management' },
    { name: 'Clinics', description: 'Clinic & availability management' },
    { name: 'Slots', description: 'Slot generation & listing' },
    { name: 'Bookings', description: 'Booking workflow — create, confirm, cancel' },
    { name: 'Admin', description: 'Admin — manage users, providers, bookings, system stats' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Auth'],
        summary: 'Health check',
        responses: { 200: { description: 'API is running' } },
      },
    },

    // ── AUTH ──────────────────────────────────────────────────────────────
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
        },
        responses: {
          201: { description: 'User registered, tokens returned' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive tokens',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
        },
        responses: {
          200: { description: 'Login successful, tokens returned' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'New tokens returned' }, 401: { description: 'Invalid refresh token' } },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and invalidate refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Logged out successfully' } },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get logged-in user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile' }, 401: { description: 'Unauthorized' } },
      },
    },

    // ── PROVIDERS ─────────────────────────────────────────────────────────
    '/api/v1/providers': {
      get: {
        tags: ['Providers'],
        summary: 'List all providers (public)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Cardiology' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'List of providers with pagination' } },
      },
    },
    '/api/v1/providers/register-business': {
      post: {
        tags: ['Providers'],
        summary: 'Register business profile (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['businessName', 'category'],
                properties: {
                  bio: { type: 'string', example: 'Experienced cardiologist' },
                  businessName: { type: 'string', example: 'Raj Heart Clinic' },
                  category: { type: 'string', example: 'Cardiology' },
                  phone: { type: 'string', example: '9876543210' },
                  address: { type: 'string', example: 'Mumbai, India' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Business registered' }, 409: { description: 'Already exists' } },
      },
    },
    '/api/v1/providers/me': {
      get: {
        tags: ['Providers'],
        summary: 'Get own provider profile (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Provider profile' } },
      },
      put: {
        tags: ['Providers'],
        summary: 'Update provider bio (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { bio: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Profile updated' } },
      },
    },
    '/api/v1/providers/business': {
      put: {
        tags: ['Providers'],
        summary: 'Update business details (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Business updated' } },
      },
    },
    '/api/v1/providers/{id}': {
      get: {
        tags: ['Providers'],
        summary: 'Get provider by ID (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Provider details' }, 404: { description: 'Not found' } },
      },
    },

    // ── CLINICS ───────────────────────────────────────────────────────────
    '/api/v1/clinics': {
      post: {
        tags: ['Clinics'],
        summary: 'Create a clinic (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'address'],
                properties: {
                  name: { type: 'string', example: 'Branch 1' },
                  address: { type: 'string', example: 'Andheri, Mumbai' },
                  phone: { type: 'string', example: '9999999999' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Clinic created' } },
      },
    },
    '/api/v1/clinics/my/list': {
      get: {
        tags: ['Clinics'],
        summary: 'Get my clinics (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of clinics' } },
      },
    },
    '/api/v1/clinics/{id}': {
      get: {
        tags: ['Clinics'],
        summary: 'Get clinic by ID (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Clinic details' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Clinics'],
        summary: 'Update clinic (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Clinic updated' } },
      },
    },
    '/api/v1/clinics/{id}/availability': {
      get: {
        tags: ['Clinics'],
        summary: 'Get clinic availability (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Availability list' } },
      },
      post: {
        tags: ['Clinics'],
        summary: 'Add working hours for a day (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['dayOfWeek', 'startTime', 'endTime', 'slotDuration'],
                properties: {
                  dayOfWeek: { type: 'string', enum: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] },
                  startTime: { type: 'string', example: '09:00' },
                  endTime: { type: 'string', example: '17:00' },
                  slotDuration: { type: 'integer', example: 30 },
                  capacity: { type: 'integer', example: 3 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Availability added' }, 409: { description: 'Day already configured' } },
      },
    },
    '/api/v1/clinics/{id}/availability/{availabilityId}': {
      delete: {
        tags: ['Clinics'],
        summary: 'Remove availability for a day (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'availabilityId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Availability removed' } },
      },
    },

    // ── SLOTS ─────────────────────────────────────────────────────────────
    '/api/v1/slots': {
      get: {
        tags: ['Slots'],
        summary: 'List slots for a clinic on a date (public)',
        parameters: [
          { name: 'clinicId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-06-28' } },
        ],
        responses: { 200: { description: 'Slots with available capacity' } },
      },
    },
    '/api/v1/slots/generate': {
      post: {
        tags: ['Slots'],
        summary: 'Generate slots for a date (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['clinicId', 'date'],
                properties: {
                  clinicId: { type: 'string' },
                  date: { type: 'string', example: '2026-06-28' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Slots generated' }, 400: { description: 'No availability for this day' } },
      },
    },
    '/api/v1/slots/{id}/block': {
      patch: {
        tags: ['Slots'],
        summary: 'Block or unblock a slot (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isBlocked'],
                properties: { isBlocked: { type: 'boolean', example: true } },
              },
            },
          },
        },
        responses: { 200: { description: 'Slot updated' } },
      },
    },

    // ── BOOKINGS ──────────────────────────────────────────────────────────
    '/api/v1/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking (CUSTOMER only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slotId'],
                properties: {
                  slotId: { type: 'string' },
                  notes: { type: 'string', example: 'First appointment' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created with PENDING_CONFIRMATION status' },
          400: { description: 'Slot full or blocked' },
        },
      },
    },
    '/api/v1/bookings/my': {
      get: {
        tags: ['Bookings'],
        summary: 'Get my bookings (CUSTOMER only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Customer booking history with pagination' } },
      },
    },
    '/api/v1/bookings/provider': {
      get: {
        tags: ['Bookings'],
        summary: 'Get all bookings for my clinics (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Provider booking list with pagination' } },
      },
    },
    '/api/v1/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking by ID (owner or provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking details with status history' }, 404: { description: 'Not found' } },
      },
    },
    '/api/v1/bookings/{id}/cancel': {
      patch: {
        tags: ['Bookings'],
        summary: 'Cancel a booking (CUSTOMER or PROVIDER)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { reason: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Booking cancelled' }, 400: { description: 'Cannot cancel at this status' } },
      },
    },
    '/api/v1/bookings/{id}/status': {
      patch: {
        tags: ['Bookings'],
        summary: 'Confirm or reject a booking (PROVIDER only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['CONFIRMED', 'REJECTED'] },
                  reason: { type: 'string', example: 'Confirmed by doctor' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Booking status updated' }, 400: { description: 'Already processed' } },
      },
    },
    // ── ADMIN ──────────────────────────────────────────────────────────────
    '/api/v1/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get system stats (ADMIN only)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Total users, bookings, providers, clinics, slots' } },
      },
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Paginated user list' } },
      },
    },
    '/api/v1/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get user by ID (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User details with booking count' }, 404: { description: 'Not found' } },
      },
    },
    '/api/v1/admin/users/{id}/suspend': {
      patch: {
        tags: ['Admin'],
        summary: 'Suspend or activate a user (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isActive'],
                properties: { isActive: { type: 'boolean', example: false } },
              },
            },
          },
        },
        responses: { 200: { description: 'User suspended or activated' } },
      },
    },
    '/api/v1/admin/providers': {
      get: {
        tags: ['Admin'],
        summary: 'List all providers (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Paginated provider list' } },
      },
    },
    '/api/v1/admin/bookings': {
      get: {
        tags: ['Admin'],
        summary: 'List all bookings (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'CANCELLED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Paginated booking list' } },
      },
    },
  },
};

module.exports = swaggerSpec;
