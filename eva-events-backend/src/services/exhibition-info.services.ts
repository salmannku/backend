import ExhibitionInfoModel from '../models/exhibition-info.model'

export class ExhibitionInfoServices {
  static createExhibitionInfo = async ({ event_id }: { event_id: string }) => {
    try {
      const record = await ExhibitionInfoModel.create({
        event: event_id,
      })

      if (!record) {
        return {
          success: false,
          message: 'Exhibition info not created, please try again!',
        }
      }

      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
        message: 'Exhibition info not created, please try again!',
      }
    }
  }
}
