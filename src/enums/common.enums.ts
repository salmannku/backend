export class CommonEnums {
  static ACTIVE = 'active'
  static PENDING = 'pending'
  static DISABLED = 'disabled'
  static DRAFT = 'draft'
  static BINNED = 'binned'

  static status = {
    DRAFT: 'draft',
    BINNED: 'binned',
    DISABLED: 'disabled',
    ACTIVE: 'active',
    DEACTIVE: 'deactive',
  }

  static users = {
    ADMIN: 'admin',
    exhibitor: 'exhibitor',
    delegate: 'delegate',
    sponsor: 'sponsor',
    speaker: 'speaker',
    media_partner: 'media_partners',

    admin_label: 'Admin',
    exhibitor_label: 'Exhibitor',
    delegate_label: 'Delegate',
    sponsor_label: 'Sponsor',
    speaker_label: 'Speaker',
    media_partner_label: 'Media Partner',
  }

  static auth = {
    LOGIN: 'login',
    LOGOUT: 'logout',
  }

  static profileSurveyOptionTypes = {
    CHECKBOX: 'checkbox',
    INPUT: 'input',
  }

  static exhibitionInfo = {
    general_information: 'general_information',
    exhibition_stand_information: 'exhibition_stand_information',
    additional_orders: 'additional_orders',
    shipping_information: 'shipping_information',
    exhibitor_insurance: 'exhibitor_insurance',
    product_demos: 'product_demos',
    parking: 'parking',
    deadlines: 'deadlines',
    raising_your_profile: 'raising_your_profile',
    marketing_graphics: 'marketing_graphics',
  }

  static meetingStatus = {
    pending: 'pending',
    accepted: 'accepted',
    declined: 'declined',
    cancelled: 'cancelled',
    rescheduled: 'rescheduled',

    pending_label: 'Pending',
    accepted_label: 'Confirmed',
    declined_label: 'Declined',
    cancelled_label: 'Cancelled',
    rescheduled_label: 'Rescheduled',
  }

  static emailTypes = {
    meetingRequest: 'meeting_request',
    meetingRequestConfirmed: 'meeting_request_confirmed',
    meetingCancellation: 'meeting_cancellation',
    meetingRescheduledByRequestor: 'meeting_rescheduled_by_requestor',
    meeting_is_declined_by_user: 'meeting_is_declined_by_user',
    meeting_is_declined_confirmation_to_user:
      'meeting_is_declined_confirmation_to_user',
    event_invite_to_user: 'event_invite_to_user',
    admin_reset_password: 'admin_reset_password',
    meeting_cancelation_report_to_admin: 'meeting_cancelation_report_to_admin',
    meeting_is_cancelled_by_requestor_user_report_email_to_admin:
      'meeting_is_cancelled_by_requestor_user_report_email_to_admin',
  }

  static dbOperationTypes = {
    delete: 'delete',
    update: 'update',
    create: 'create',
  }

  static uploadPaths = {
    images: `public/images`,
    static: `public/static`,
    docs: `public/documents`,
  }
}
