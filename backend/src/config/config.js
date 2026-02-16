require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'medical_system',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'cle_secrete_jwt_medical_2025_securisee',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true',
    certPath: process.env.SSL_CERT_PATH || './certs/cert.pem',
    keyPath: process.env.SSL_KEY_PATH || './certs/key.pem',
  },
};
