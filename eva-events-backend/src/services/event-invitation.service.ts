import { CommonEnums } from '../enums/common.enums'
import EventInvitesModel from '../models/event-invites.model'

export class EventInvitationServices {
  static checkEventInvitationForUser = async ({
    user_id,
    user_type = CommonEnums.users.delegate,
    event_id,
  }: {
    user_id: string
    user_type?: string
    event_id: string
  }) => {
    const invitation = await EventInvitesModel.find({
      user_id,
      event_id,
      user_type,
    })
      .lean()
      .select('_id last_login')

    if (!invitation?.length) {
      return {
        success: false,
      }
    }

    delete (invitation as any)?.[0]?.invitation_password

    return {
      success: true,
      invitation,
      invitation_data: invitation?.[0],
    }
  }

  static deleteInvitesForUser = async ({
    users,
    event_id,
  }: {
    users: { user_id: string; user_type: string }[]
    event_id: string
  }) => {
    let deletePromises: any[] = []

    users.forEach((invite) => {
      deletePromises.push(() =>
        EventInvitesModel.deleteMany({
          user_id: invite.user_id,
          user_type: invite.user_type,
          event_id,
        })
      )
    })

    await Promise.all(deletePromises.map((_promise) => _promise()))

    return true
  }

  static changeEmailForInvites = async (params: {
    new_email: string
    old_email: string
  }) => {
    const eventInvites = await EventInvitesModel.find({
      invitation_username: params.old_email,
    })

    if (!eventInvites.length) return true

    let updateEmailPromises: any[] = []

    const updateEmail = async (invite: any) => {
      invite.invitation_username = params.new_email
      await invite.save()
      return true
    }

    eventInvites.forEach((invite) => {
      updateEmailPromises.push(() => updateEmail(invite))
    })

    await Promise.all(updateEmailPromises.map((_promise) => _promise()))

    return true
  }
}
