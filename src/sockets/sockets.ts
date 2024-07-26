// import {
//   registerQuestionStatusHandlers,
//   webQuestionStatus,
// } from './web/questionStatus'
// import ResponseCodes from '../utils/responseCodes'
// import { verifyToken } from '../middlewares/authenticateRequest.middleware'
// import { AppSocketServer } from '../types/socketTypes'
// import { socket_io } from '../server'
// import { QuestionActionType, QuestionStatus, Role } from '../utils/enums'
// import Question from '../models/questions.model'
// import QuestionLog from '../models/question_logs.model'
// import Expert from '../models/experts.model'
// import User from '../models/users.model'
// import { registerExpertQuestionsSockets } from './experts/questions.socket'
// import { registerUserSockets } from './web/web.sockets'
// // import { registerCategorizerSockets } from './categorization/categorization.sockets'

// const authenticate = (io: AppSocketServer) => {
//   io.use(async (socket: any, next: any) => {
//     const jwt = socket.handshake.auth.token
//     console.log('jwt', jwt)

//     const decodedToken = await verifyToken(jwt)

//     if (!decodedToken.success)
//       return next(new Error(ResponseCodes.UNAUTHORIZED))

//     socket.data.user = decodedToken.user
//     if (socket.data.user)
//       socket.join(`${socket.data.user.role}:${socket.data.user.user_id}`)
//     next()
//   })
// }

// const registerSockets = (io: AppSocketServer) => {
//   return
//   // auth middleware
//   authenticate(io)
//   registerUserSockets(io)
//   // registerCategorizerSockets(io)

//   io.on('connection', (socket) => {
//     // web
//     webQuestionStatus(io, socket)
//   })
// }

// const expertSockets = async (socketIo: any) => {
//   const _socket = socket_io
//   const auth = () => {
//     _socket.use(async (socket: any, next: any) => {
//       const jwt = socket.handshake.auth.token
//       // const jwt = socket.handshake.headers.token
//       // console.log('>>>>>>>', jwt)

//       const decodedToken = await verifyToken(jwt)

//       if (!decodedToken.success)
//         return next(new Error(ResponseCodes.UNAUTHORIZED))

//       socket.data.user = decodedToken.user

//       if (socket.data.user)
//         socket.join(`${socket.data.user.user_id}:${socket.id}`)
//       next()
//     })
//   }

//   auth()
//   _socket.on('connection', async (socket: any) => {
//     console.log('Connected to socket.io')
//     socket.on('expertRecord', async (expertId: any) => {
//       if (socket.data.user) {
//         // socket controllers here
//       } else {
//         const errorMessage = ResponseCodes.UNAUTHORIZED
//         socket.emit('error', errorMessage)
//       }
//     })
//   })
// }
// export { registerSockets, expertSockets }
