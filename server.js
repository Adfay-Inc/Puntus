const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
console.log('Configurando CORS para desarrollo...');
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS - Origin recibido:', origin);
    
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) {
      console.log('CORS - Permitiendo request sin origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'https://tudominio.com'
    ];
    
    console.log('CORS - Orígenes permitidos:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      console.log('CORS - Origin permitido:', origin);
      return callback(null, true);
    }
    
    console.log('CORS - Origin NO permitido:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
// Middleware adicional para preflight requests
app.options('*', (req, res) => {
  console.log('OPTIONS request recibido para:', req.url);
  console.log('Origin del OPTIONS:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
testConnection();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scrims', require('./routes/scrims'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/match-results', require('./routes/match-results'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Puntus API funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;