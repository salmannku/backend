import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/routes'
import morgan from 'morgan'
import fs from 'node:fs'
import errorHandler from './middlewares/errorHandler.middleware'
import swagger from 'swagger-ui-express'
import YAML from 'yaml'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use(
//   cors({
//     origin: [
//       process?.env?.CORS_WEB_URL,
//       process?.env?.CORS_DEV_WEB_URL,
//       process?.env?.CORS_LOCAL_WEB_URL,
//       process?.env?.CORS_ADMIN_URL,
//       process?.env?.CORS_DEV_ADMIN_URL,
//     ] as any,

//     credentials: true,
//     methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
//   })
// )

app.use(cors())

app.use(express.static('public'))

app.use(morgan('dev'))

app.use(apiRoutes)

app.use(errorHandler)

export default app
