export class AdminStatus {
  static ACTIVE = 'active'
  static PENDING = 'pending'
  static DISABLED = 'disabled'
  static DRAFT = 'draft'
  static BINNED = 'binned'
}

enum Statues {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

class Role {
  static ADMIN = 'admin'
  static SUPER_ADMIN = 'super_admin'
}

enum Roles {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

enum FeaturedQuestionStatus {
  INITIALIZING = 'initializing',
  DONE = 'done',
  GENERATING = 'generating',
}

export { Statues, Role, Roles, FeaturedQuestionStatus }
