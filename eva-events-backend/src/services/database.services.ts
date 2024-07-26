import ConferenceProgrammeAttendeesModel from '../models/conference-programme-attendees.model'
import NetworkingEventSchedulesModel from '../models/networking-event-schedules.model'

export default class DatabaseServices {
  static deleteConferenceAttendeesForConferenceProgram = async ({
    conference_programme_id,
  }: {
    conference_programme_id: string
  }) => {
    if (!conference_programme_id) return true

    await ConferenceProgrammeAttendeesModel.deleteMany({
      conference_programme: conference_programme_id,
    })

    return true
  }

  static deleteNetworkingEventSchedules = async ({
    networking_event_id,
  }: {
    networking_event_id: string
  }) => {
    if (!networking_event_id) return true

    await NetworkingEventSchedulesModel.deleteMany({
      networking_event: networking_event_id,
    })

    return true
  }
}
