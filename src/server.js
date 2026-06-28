require('dotenv').config();
const app = require('./app');
const { PORT } = require('./config/env');

// Export for Vercel serverless
module.exports = app;

// Start server locally when not in serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}
