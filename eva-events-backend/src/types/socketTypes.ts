import socketIo from 'socket.io'
import {QuestionStatus} from '../utils/enums'

interface SuccessfulQuestionStatusResponse {
  success: true,
  status: QuestionStatus,
  expert?: string,
  eta?: number,
}

interface FailedQuestionStatusResponse {
  success: false,
  error: string,
}

type QuestionStatusResponse = SuccessfulQuestionStatusResponse | FailedQuestionStatusResponse

export interface ServerToClientEvents {
  'user:question-status': (x: QuestionStatusResponse) => void
}

export interface ClientToServerEvents {
  'user:question-status': ({id}: { id: string }) => Promise<void>
}

export interface InterServerEvents {
  'server:notify-user-question-status': ({id, eta, requester}: { id: string, eta?: number, requester?: string }) => Promise<void>
}

export interface SocketData {
  user: {
    user_id: string,
    email: string
    role: string
  }
}

export type AppSocketServer = socketIo.Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type AppSocket = socketIo.Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
