const express = require('express');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'config.json');
let config = { port: 3000, staticDir: 'public' };
if (fs.existsSync(configPath)) {
  config = Object.assign(config, JSON.parse(fs.readFileSync(configPath, 'utf-8')));
}

const app = express();

// Serve static assets
app.use(express.static(path.join(__dirname, config.staticDir)));

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the ExpressJS Static Server</h1>');
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
