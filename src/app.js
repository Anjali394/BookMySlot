const express = require('express');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Swagger — serve spec as JSON + UI via CDN (works on Vercel serverless)
app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.get('/api-docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>BookMySlot API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
        deepLinking: true,
      });
    </script>
  </body>
</html>`);
});

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
app.use('/api/v1/admin', require('./routes/admin.routes'));

// 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
