import { IUser, IAdmin, IMasterAdmin } from './common'

export interface ISendVerificationOtpMail {
  user: IUser
  otp: number
}

export interface IsendApprovedMail {
  user: IAdmin
}

export interface IsendDeclinedMail {
  user: IAdmin
}

export interface ISendVerificationLinkMail {
  user: IAdmin
  super_admin: IMasterAdmin
  u_id: string
  s_id: string
}

export interface ISendAddMyloCredits {
  user: IUser
}

export interface ISendRefferralAddMyloCredits {
  user: IUser
  email: string
}

export interface ISendAppointmentMail {
  expertEmail: string
  expertName: string
  date: string
  time: string
  clientName: string
  clientEmail: string
}

export interface ISendApprovedAppointmentMail {
  userEmail:string
  expertEmail: string
  expertName: string
  date: string
  time: string
  userName: string
  agenda:string
}

export interface ISendCancelAppointmentMail {
  userEmail:string
  expertName: string
  date: string
  time: string
  userName: string
  rejectReason:string
}