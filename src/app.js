const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BookMySlot API Docs',
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'BookMySlot API is running' });
});

// API routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/providers', require('./routes/provider.routes'));
app.use('/api/v1/clinics', require('./routes/clinic.routes'));
app.use('/api/v1/slots', require('./routes/slot.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));
// app.use('/api/v1/admin', require('./routes/admin.routes'));

// 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
