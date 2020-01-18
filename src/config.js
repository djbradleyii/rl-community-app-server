module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    //CLIENT_ORIGIN: 'https://rl-community-app.now.sh',
    //CLIENT_ORIGIN: 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dbradley:password@localhost/rl-community-app',
    TEST_DATABASE_URL: 'postgresql://dbradley:password@localhost/rl-community-app-test',
  }