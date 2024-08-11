import { config } from "dotenv"

// Load environment variables from .env file
config();

const configuration = {
    // App configuration
    app: {
        port: process.env.PORT || 5000,
    },
    // Database Configuration
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DB || 'ejemplo'
    },
    jwt: {
        secret: process.env.ACCESS_TOKEN_SECRET || 'secret',
        refresh_secret: process.env.REFRESH_TOKEN_SECRET || 'refresh',
        accessTokenExpiresIn: '1h',
        refreshTokenExpiresIn: '1w'
    },
};

// Exporting configuration
export default configuration;