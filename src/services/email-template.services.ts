import EmailTemplateModel from '../models/email-templates.model'

export let defaultEventInviteStaticBody = `
<p style="margin-left:0px;"><span style="color: rgb(24,24,24);font-size: 14px;">Please login to our event system to be able to</span></p>
<ul>
<li><span style="font-size: 14px;">Manage your profile</span></li>
<li><span style="font-size: 14px;">Set up 1-1 Meetings</span></li>
<li><span style="font-size: 14px;">View the event agenda</span></li>
<li><span style="font-size: 14px;">Get travel and hotel booking advice and offers</span></li>
<li><span style="font-size: 14px;">and so much more!</span></li>
</ul>
`

export class EmailTemplateServices {
  static defaultEventInviteStaticBody = defaultEventInviteStaticBody

  static getEventInviteTemplateContent = async (params: {
    user_type: string
    template_type: string
    event_id: string
  }) => {
    let emailTemplate = await EmailTemplateModel.findOne({
      event: params?.event_id,
      user_type: params?.user_type,
      template_type: params?.template_type,
    }).lean()

    if (!emailTemplate) {
      return defaultEventInviteStaticBody
    }
	console.log("welcome");
	return defaultEventInviteStaticBody
    return emailTemplate?.metadata?.body_content
  }
}
