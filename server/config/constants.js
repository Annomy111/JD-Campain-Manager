module.exports = {
  jwt: {
    expiresIn: '24h',
    defaultSecret: 'your-secret-key'
  },
  cache: {
    defaultTTL: 300, // 5 minutes
    shortTTL: 60,    // 1 minute
    mediumTTL: 1800  // 30 minutes
  },
  validation: {
    password: {
      minLength: 6,
      maxLength: 128
    }
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  errorMessages: {
    auth: {
      invalidCredentials: 'Ungültige Anmeldedaten',
      userExists: 'Benutzer existiert bereits',
      serverError: 'Server Fehler'
    }
  },
  session: {
    defaultSecret: 'your-session-secret'
  },
  mongodb: {
    defaultUri: 'mongodb://localhost:27017/your-db-name'
  }
};