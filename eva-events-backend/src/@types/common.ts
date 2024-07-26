export interface IUser {
  first_name?: string
  last_name?: string
  phone?: string
  destination?: string
  email?: string
  role?: string
  mylo_credits?: number
  mylo_credits_renewal_date?: string
  mylo_credits_last_renew_date?: string
  is_email_verified?: boolean
  is_phone_verified?: boolean
  status?: string
  varified?: boolean
}

export interface IAdmin {
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  destination?: string
  profile_image?: string
  email?: string
  role?: string
  verified_by?: string
  status?: string
  varified?: boolean
}

export interface IMasterAdmin {
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  destination?: string
  profile_image?: string
  email?: string
  role?: string
  verified_by?: string
  status?: string
  varified?: boolean
}
