// config/default.js
module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/healthmonitor',
    jwtSecret: process.env.JWT_SECRET || 'secret_should_be_longer_in_production',
    jwtExpire: process.env.JWT_EXPIRE || '24h'
  };
  
  