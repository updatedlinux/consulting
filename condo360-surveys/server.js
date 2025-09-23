const express = require('express');
const cors = require('cors');
require('dotenv').config();
const surveyRoutes = require('./src/routes/surveyRoutes');
const swaggerSetup = require('./swagger/swagger');
require('./src/middleware/cron'); // Load cron jobs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/polls', surveyRoutes);

// Swagger documentation
swaggerSetup(app);

// Health check endpoint
app.get('/polls/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Survey API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Survey API server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/polls/api-docs`);
});