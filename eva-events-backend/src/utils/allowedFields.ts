export const allowedQualificationUpdateFields = [
  'from',
  'to',
  'description',
  'title',
  'area_of_study',
  'institute',
]

export const allowedQualificationFields = [
  ...allowedQualificationUpdateFields,
  '_id',
  'expert',
]

export const allowedWorkExperienceUpdateFields = [
  'from',
  'to',
  'description',
  'title',
  'company',
  'country',
]

export const allowedWorkExperienceFields = [
  ...allowedWorkExperienceUpdateFields,
  '_id',
  'expert',
]

export const allowedExpertProfileFields = [
  '_id',
  'prefix',
  'show_prefix',
  'first_name',
  'last_name',
  'avatar',
  'avatar_url',
  'categories',
  'tags',
  'brief',
  'summary',
  'work_experience',
  'qualifications',
  'profile_layout',
  'sessions',
  'language',
  'areas_of_knowledge',
  'usual_pricing',
  'meeting_method',
  'profile_location',
  'treatment_approach',
  'specialities_expertise',
  'clientele',
]

export const allowedProfileTitles = [
  ['qualification_title', 'university_name', 'university_location'],
  ['job_title', 'workplace_name', 'workplace_location'],
  [
    'expertise_area',
    'qualification_title',
    'university_name',
    'university_location',
  ],
  ['profession', 'years_of_experience', 'qualification_title'],
  ['free_form'],
]

export const allowedCategoryFields = [
  '_id',
  'name',
  'value',
  'parent',
  'ancestors',
  'is_tag',
]
