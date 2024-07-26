// import {
//   sendSocketValidationError,
//   sendSocketResponse,
// } from '../../helpers/common'
// import { verifyToken } from '../../middlewares/authenticateRequest.middleware'
// import Category from '../../models/categories.model'
// import Question from '../../models/questions.model'
// import { QuestionServices } from '../../services/question.services'
// import { AppSocketServer } from '../../types/socketTypes'
// import { Role } from '../../utils/enums'
// import ResponseCodes from '../../utils/responseCodes'
// import { SocketEvents, SocketNamespaces, SocketRooms } from '../socket.enums'
// import { ExpertSocketValidations } from '../validations/experts.sockets.validations'
// import { UserSocketValidations } from '../validations/users.sockets.validations'
// import { ObjectId } from 'mongodb'

// const CreateObjectId: any = ObjectId

// export let userSocketNamespace: any = null

// export const registerUserSockets = (io: AppSocketServer) => {
//   userSocketNamespace = io.of(`/${SocketNamespaces.users}`)

//   userSocketNamespace.use(async (socket: any, next: any) => {
//     const jwt =
//       socket.handshake.headers?.access_token || socket.handshake.auth.token

//     if (!jwt) return next(new Error(ResponseCodes.ACCESS_TOKEN_REQUIRED))

//     const decodedToken = await verifyToken(jwt)

//     if (!decodedToken.success)
//       return next(new Error(ResponseCodes.UNAUTHORIZED))

//     socket.data.user = decodedToken.user

//     if (socket.data.user) {
//       if (socket.data.user.role === Role.USER) {
//         socket.join(SocketRooms.users.errorRoom)
//         socket.join(
//           SocketRooms.users.generateUserRoom({
//             userId: decodedToken?.user?._id?.toString(),
//           })
//         )
//       }
//     }
//     next()
//   })

//   userSocketNamespace.on('connection', (socket: any) => {
//     // Join the room room:user:question_details_${question_id}
//     socket.on(
//       `${SocketEvents.users.joinQuestionDetailsRoom}` as any,
//       async (args: any) => {
//         /**
//          * args
//          * Object:
//          * {
//          *  question_id: string,
//          *
//          * }
//          */
//         const expert = socket.data?.user

//         try {
//           const { value, error } =
//             UserSocketValidations.joinQuestionDetailsRoom.validate(args)

//           if (error || !value) {
//             return userSocketNamespace
//               .to(
//                 SocketRooms.users.generateUserRoom({
//                   userId: expert._id,
//                 })
//               )
//               .emit(
//                 'error',
//                 sendSocketValidationError({
//                   error: true,
//                   required: {
//                     question_id: 'string',
//                   },
//                   message: 'Arguments are invalid',
//                 })
//               )
//           }

//           const { question_id } = args

//           const room = SocketRooms.users.generateQuestionDetailsRoom({
//             question_id,
//           })

//           await socket.join(room)
//         } catch (err) {
//           return userSocketNamespace
//             .to(
//               SocketRooms.users.generateUserRoom({
//                 userId: expert._id,
//               })
//             )
//             .emit(
//               'error',
//               sendSocketResponse({
//                 message:
//                   'Something went wrong, please refresh the page, failed while joining the rooms!',
//                 errors: { fnc: 'joinQuestionDetailsRoom', err },
//                 response_code: ResponseCodes.failedWhileJoiningTheRoom(
//                   SocketEvents.users.joinQuestionDetailsRoom
//                 ),
//                 success: false,
//               })
//             )
//         }
//       }
//     )

//     // Leave room:user:question_details_${question_id} room
//     socket.on(
//       `${SocketEvents.users.leaveQuestionDetailsRoom}` as any,
//       async (args: any) => {
//         /**
//          * args
//          * Object:
//          * {
//          *  question_id: string,
//          *
//          * }
//          */

//         const expert = socket.data?.user

//         try {
//           const { value, error } =
//             UserSocketValidations.joinQuestionDetailsRoom.validate(args)

//           if (error || !value) {
//             return userSocketNamespace
//               .to(
//                 SocketRooms.users.generateUserRoom({
//                   userId: expert._id,
//                 })
//               )
//               .emit(
//                 'error',
//                 sendSocketValidationError({
//                   error: true,
//                   required: {
//                     question_id: 'string',
//                   },
//                   message: 'Arguments are invalid',
//                 })
//               )
//           }

//           const { question_id } = args

//           const room = SocketRooms.users.generateQuestionDetailsRoom({
//             question_id,
//           })

//           await socket.leave(room)
//         } catch (err) {
//           return userSocketNamespace
//             .to(
//               SocketRooms.users.generateUserRoom({
//                 userId: expert._id,
//               })
//             )
//             .emit(
//               'error',
//               sendSocketResponse({
//                 message:
//                   'Something went wrong, please refresh the page, failed while joining the rooms!',
//                 errors: { fnc: 'leaveQuestionDetailsRoom', err },
//                 response_code: ResponseCodes.failedWhileLeavingTheRoom(
//                   SocketEvents.users.leaveQuestionDetailsRoom
//                 ),
//                 success: false,
//               })
//             )
//         }
//       }
//     )

//     // For categorization
//     // Join the room:question:categorization:${question_id}
//     socket.on(
//       `${SocketEvents.categorizer.joinCategorizerRoomForQuestion}` as any,
//       async (args: any) => {
//         /**
//          * args
//          * Object:
//          * {
//          *  question_id: string,
//          *
//          * }
//          */
//         const user = socket.data?.user

//         try {
//           const { value, error } =
//             UserSocketValidations.joinCategorizerRoomForQuestion.validate(args)

//           if (error || !value) {
//             return userSocketNamespace
//               .to(
//                 SocketRooms.users.generateUserRoom({
//                   userId: user._id,
//                 })
//               )
//               .emit(
//                 'error',
//                 sendSocketValidationError({
//                   error: true,
//                   required: {
//                     question_id: 'string',
//                   },
//                   message: 'Arguments are invalid',
//                 })
//               )
//           }

//           const { question_id } = args

//           const room = SocketRooms.users.generateCategorizationRoomForQuestion({
//             question_id,
//           })

//           await socket.join(room)

//           console.log('connected rooms: ', socket?.rooms)
//         } catch (err) {
//           return userSocketNamespace
//             .to(
//               SocketRooms.users.generateUserRoom({
//                 userId: user._id,
//               })
//             )
//             .emit(
//               'error',
//               sendSocketResponse({
//                 message:
//                   'Something went wrong, please refresh the page, failed while joining the rooms!',
//                 errors: { fnc: 'joinCategorizerRoomForQuestion', err },
//                 response_code: ResponseCodes.failedWhileJoiningTheRoom(
//                   SocketEvents.categorizer.joinCategorizerRoomForQuestion
//                 ),
//                 success: false,
//               })
//             )
//         }
//       }
//     )

//     // Leave the room:question:categorization:${question_id}
//     socket.on(
//       `${SocketEvents.categorizer.leaveCategorizerRoomForQuestion}` as any,
//       async (args: any) => {
//         /**
//          * args
//          * Object:
//          * {
//          *  question_id: string,
//          *
//          * }
//          */
//         const user = socket.data?.user

//         try {
//           const { value, error } =
//             UserSocketValidations.joinCategorizerRoomForQuestion.validate(args)

//           if (error || !value) {
//             return userSocketNamespace
//               .to(
//                 SocketRooms.users.generateUserRoom({
//                   userId: user._id,
//                 })
//               )
//               .emit(
//                 'error',
//                 sendSocketValidationError({
//                   error: true,
//                   required: {
//                     question_id: 'string',
//                   },
//                   message: 'Arguments are invalid',
//                 })
//               )
//           }

//           const { question_id } = args

//           const room = SocketRooms.users.generateCategorizationRoomForQuestion({
//             question_id,
//           })

//           await socket.leave(room)
//           console.log('connected rooms: ', socket?.rooms)
//         } catch (err) {
//           return userSocketNamespace
//             .to(
//               SocketRooms.users.generateUserRoom({
//                 userId: user._id,
//               })
//             )
//             .emit(
//               'error',
//               sendSocketResponse({
//                 message:
//                   'Something went wrong, please refresh the page, failed while leaving the rooms!',
//                 errors: { fnc: 'leaveCategorizerRoomForQuestion', err },
//                 response_code: ResponseCodes.failedWhileLeavingTheRoom(
//                   SocketEvents.categorizer.leaveCategorizerRoomForQuestion
//                 ),
//                 success: false,
//               })
//             )
//         }
//       }
//     )
//   })
// }

// interface IOnCategorizationSuccess {
//   job_id: string
//   category: string
//   success: boolean
//   category_label: string
// }

// export class UserSocketMethods {
//   static onCategorizationSuccess = async ({
//     job_id,
//     category,
//     success,
//     category_label,
//   }: IOnCategorizationSuccess) => {
//     // TODO

//     // get question using job_id

//     const [question, categoriesFromDbs] = await Promise.all([
//       Question.findOne({
//         categorization_job_id: job_id,
//       }),
//       Category.findById(category),
//     ])

//     if (!categoriesFromDbs || !question) {
//       return
//     }

//     question.categories = []

//     // let categories = question.categories.map((_id) => _id.toString())

//     // if (!categories.includes(category)) {
//     //   categories.push(category)
//     // }

//     question.categories.push(new CreateObjectId(category.trim()))

//     await question.save()

//     const questionRoom =
//       SocketRooms.users.generateCategorizationRoomForQuestion({
//         question_id: question?._id?.toString(),
//       })

//     if (success) {
//       userSocketNamespace.to(questionRoom).emit(
//         SocketEvents.categorizer.categorization_success,
//         sendSocketResponse({
//           success: true,
//           data: { category, category_label, job_id },
//         })
//       )

//       return true
//     }

//     userSocketNamespace.to(questionRoom).emit(
//       SocketEvents.categorizer.categorization_failed,
//       sendSocketResponse({
//         success: false,
//       })
//     )
//   }
// }
