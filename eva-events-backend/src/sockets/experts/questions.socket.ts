import {
  sendSocketResponse,
  sendSocketValidationError,
} from '../../helpers/common'
import { verifyToken } from '../../middlewares/authenticateRequest.middleware'
import { QuestionServices } from '../../services/question.services'
import { AppSocketServer } from '../../types/socketTypes'
import { Role } from '../../utils/enums'
import ResponseCodes from '../../utils/responseCodes'
import { SocketEvents, SocketNamespaces, SocketRooms } from '../socket.enums'
import { ExpertSocketValidations } from '../validations/experts.sockets.validations'

export class ExpertQuestionsSockets {
  // io =
}

export let expertNamespace: any = null

export const registerExpertQuestionsSockets = (io: AppSocketServer) => {
  expertNamespace = io.of(`/${SocketNamespaces.experts}`)

  expertNamespace.use(async (socket: any, next: any) => {
    const jwt =
      socket.handshake.headers?.access_token || socket.handshake.auth.token

    if (!jwt) return next(new Error(ResponseCodes.ACCESS_TOKEN_REQUIRED))

    const decodedToken = await verifyToken(jwt)

    if (!decodedToken.success)
      return next(new Error(ResponseCodes.UNAUTHORIZED))

    socket.data.user = decodedToken.user

    if (socket.data.user) {
      if (socket.data.user.role === Role.EXPERT) {
        socket.join(`${SocketRooms.experts.incomingQuestions}`)
        const room = `${SocketRooms.experts.generateExpertIncomingQuestionsRoom(
          { userId: socket.data?.user?._id.toString() }
        )}`
        socket.join(room)
        socket.join(SocketRooms.experts.errorRoom)

        // socket.join(`${socket.data.user.role}:${socket.data.user.user_id}`)
      }
    }
    next()
  })

  expertNamespace.on('connection', (socket: any) => {
    socket.on(
      `${SocketEvents.experts.getIncomingQuestions}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         *  page: number,
         *  limit: number
         * }
         */

        const expert = socket.data?.user

        const { value, error } =
          ExpertSocketValidations.getIncomingQuestions.validate(args)

        if (error) {
          return expertNamespace
            .to(
              SocketRooms.experts.generateExpertIncomingQuestionsRoom({
                userId: expert._id,
              })
            )
            .emit(
              'error',
              sendSocketValidationError({
                error: true,
                required: {
                  page: 'number',
                  limit: 'number',
                },
                message: 'Arguments are invalid',
              })
            )
        }

        const { page, limit } = args

        const incomingQuestions =
          await QuestionServices.getIncomingQuestionsForExpert({
            expert,
            page,
            limit,
          })

        const room = `${SocketRooms.experts.generateExpertIncomingQuestionsRoom(
          { userId: socket.data?.user?._id.toString() }
        )}`

        expertNamespace.to(room).emit(
          SocketEvents.experts.refreshIncomingQuestions as any,
          sendSocketResponse({
            success: true,
            data: incomingQuestions,
          })
        )
      }
    )

    // Join the room room:expert:incoming_questions:{question_id}
    socket.on(
      `${SocketEvents.experts.joinQuestionDetailsRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         *  question_id: string,
         *
         * }
         */

        const expert = socket.data?.user

        const { value, error } =
          ExpertSocketValidations.joinQuestionDetailsRoom.validate(args)

        if (error || !value) {
          return expertNamespace
            .to(
              SocketRooms.experts.generateExpertIncomingQuestionsRoom({
                userId: expert._id,
              })
            )
            .emit(
              'error',
              sendSocketValidationError({
                error: true,
                required: {
                  question_id: 'string',
                },
                message: 'Arguments are invalid',
              })
            )
        }

        const { question_id } = args

        const room = SocketRooms.experts.generateExpertQuestionDetailsRoom({
          question_id,
        })

        await socket.join(room)
      }
    )

    // Lave the room room:expert:incoming_questions:{question_id}
    socket.on(
      `${SocketEvents.experts.leaveQuestionDetailsRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         *  question_id: string,
         *
         * }
         */

        const expert = socket.data?.user

        const { value, error } =
          ExpertSocketValidations.joinQuestionDetailsRoom.validate(args)

        if (error || !value) {
          return expertNamespace
            .to(
              SocketRooms.experts.generateExpertIncomingQuestionsRoom({
                userId: expert._id,
              })
            )
            .emit(
              'error',
              sendSocketValidationError({
                error: true,
                required: {
                  question_id: 'string',
                },
                message: 'Arguments are invalid',
              })
            )
        }

        const { question_id } = args

        const room = SocketRooms.experts.generateExpertQuestionDetailsRoom({
          question_id,
        })

        await socket.leave(room)
      }
    )

    // Join expert to room:expert:incoming_questions:category_${category_id} room

    socket.on(
      `${SocketEvents.experts.joinIncomingQuestionsListRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         * }
         */
        try {
          const expert = socket.data?.user
          const categories = expert.categories

          categories.map((_id: any) => {
            socket.join(
              SocketRooms.experts.generateIncomingQuestionRoomForCategory({
                category_id: _id.toString(),
              })
            )
          })

          console.log(socket.rooms)
        } catch (err) {
          return expertNamespace.to(SocketRooms.experts.errorRoom).emit(
            'error',
            sendSocketResponse({
              message:
                'Something went wrong, please refresh the page, failed while joining the rooms!',
              errors: { fnc: 'joinIncomingQuestionsListRoom', err },
              response_code: ResponseCodes.failedWhileJoiningTheRoom(
                SocketEvents.experts.joinIncomingQuestionsListRoom
              ),
              success: false,
            })
          )
        }
      }
    )

    // Leave expert from room:expert:incoming_questions:category_${category_id} room

    socket.on(
      `${SocketEvents.experts.leaveIncomingQuestionsListRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         * }
         */
        try {
          const expert = socket.data?.user
          const categories = expert.categories

          categories.map((_id: any) => {
            socket.leave(
              SocketRooms.experts.generateIncomingQuestionRoomForCategory({
                category_id: _id.toString(),
              })
            )
          })

          console.log(socket.rooms)
        } catch (err) {
          return expertNamespace.to(SocketRooms.experts.errorRoom).emit(
            'error',
            sendSocketResponse({
              message:
                'Something went wrong, please refresh the page, failed while joining the rooms!',
              errors: { fnc: 'leaveIncomingQuestionsListRoom', err },
              response_code: ResponseCodes.failedWhileJoiningTheRoom(
                SocketEvents.experts.leaveIncomingQuestionsListRoom
              ),
              success: false,
            })
          )
        }
      }
    )

    // join expert to expert:join_incoming_questions_room room
    socket.on(
      `${SocketEvents.experts.joinIncomingQuestionsRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         * }
         */
        try {
          const expert = socket.data?.user

          socket.join(
            SocketRooms.experts.generateExpertIncomingQuestionsRoom({
              userId: expert?._id?.toString(),
            })
          )

          console.log('rooms: ', socket?.rooms)
        } catch (err) {
          return expertNamespace.to(SocketRooms.experts.errorRoom).emit(
            'error',
            sendSocketResponse({
              message:
                'Something went wrong, please refresh the page or report the issue, failed while joining the rooms!',
              errors: { fnc: 'joinIncomingQuestionsRoom', err },
              response_code: ResponseCodes.failedWhileJoiningTheRoom(
                SocketEvents.experts.joinIncomingQuestionsRoom
              ),
              success: false,
            })
          )
        }
      }
    )

    // Leave expert from expert:join_incoming_questions_room room
    socket.on(
      `${SocketEvents.experts.leaveIncomingQuestionsRoom}` as any,
      async (args: any) => {
        /**
         * args
         * Object:
         * {
         * }
         */

        try {
          const expert = socket.data?.user

          socket.leave(
            SocketRooms.experts.generateExpertIncomingQuestionsRoom({
              userId: expert?._id?.toString(),
            })
          )

          console.log('rooms: ', socket?.rooms)
        } catch (err) {
          return expertNamespace.to(SocketRooms.experts.errorRoom).emit(
            'error',
            sendSocketResponse({
              message:
                'Something went wrong, please refresh the page or report the issue, failed while leaving the rooms!',
              errors: { fnc: 'leaveIncomingQuestionsRoom', err },
              response_code: ResponseCodes.failedWhileLeavingTheRoom(
                SocketEvents.experts.leaveIncomingQuestionsRoom
              ),
              success: false,
            })
          )
        }
      }
    )
  })
}
