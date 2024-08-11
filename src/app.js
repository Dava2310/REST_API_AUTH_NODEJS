// Getting express framework
import config from './config.js'
import express from "express"
import responds from './red/responds.js'
import cors from 'cors'

// Importing ROUTES
import userRoutes from './modules/users/routes.js'
import authRoutes from './modules/auth/routes.js'

// Initialization of the app
const app = express()
app.use(cors())
// Configure body parser
app.use(express.json())

// Configuration of the app
app.set('port', config.app.port)

// Including routes
app.use(userRoutes);
app.use(authRoutes)

// Main Route
app.get('/', (req, res) => {
    responds.success(req, res, {message: 'Hello World'}, 200);
})

// Exporting the app so index.js can import it
export default app