
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is up and running' });
});

app.head('/health', (req, res) => {
  res.status(200).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log('Press Ctrl+C to stop');
});
