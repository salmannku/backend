enum LedgerTransactionType {
  Initialize = 'INIT',
  Transaction = 'TX',
  Mint = 'MINT',
  Burn = 'BURN',
}

enum WalletType {
  Index = 'INDEX',
  System = 'SYSTEM',
  User = 'USER',
  Expert = 'EXPERT',
  Open = 'OPEN',
}

export class EconomySystemWallets {
  static freeCredits = 'free-credits'
  static questionEscrow = 'question-escrow'
}

class MyloCreditTransactionTypes {
  static CREDITED = 'credited'
  static DEBITED = 'debited'
  static CREDIT_FREE_CREDITS = 'CREDIT_FREE_CREDITS'
  static DEBIT_FREE_CREDITS = 'DEBIT_FREE_CREDITS'
}

enum MyloCreditTransactionType {
  CREDITED = 'credited',
  DEBITED = 'debited',
}

class MyloCreditTransactionFlows {
  static QUESTION = 'question'
  static PAYMENT = 'payment'
  static REFFERRAL = 'refferral'
}

enum MyloCreditTransactionFlow {
  QUESTION = 'question',
  PAYMENT = 'payment',
  REFFERRAL = 'refferral',
}

class QuestionStatus {
  static DRAFT = 'draft'
  static FINALIZED = 'finalized'
  static PENDING = 'pending'
  static INCOMING = 'incoming'
  static ACCEPTED = 'accepted'
  static ACTIVE = 'active'
  static REJECTED = 'rejected'
  static UNANSWERED = 'unanswered'
  static INAPPROPRIATE = 'INAPPROPRIATE'
  
  // If user cancels/withdraw the question ask process then the status for the question will became cancelled
  static CANCELLED = 'cancelled'
}

enum QuestionsStatus {
  DRAFT = 'draft',
  FINALIZED = 'finalized',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ACTIVE = 'active',
}

enum AdminApproval {
  PENDING = 'pending',
  APPROVED = 'accepted',
  REJECTED = 'rejected',
}

class AnsweredFrom {
  static ADMIN = 'admin'
  static EXPERT = 'expert'
}

enum AnswersFrom {
  ADMIN = 'admin',
  EXPERT = 'expert',
}

export enum AnswerStatus {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  TRASH = 'TRASH',
}

class UserStatus {
  static PENDING = 'pending'
  static INACTIVE = 'inactive'
  static TERMINATED = 'terminated'
  static BLOCKED = 'blocked'
  static ACTIVE = 'active'
}

enum UsersStatus {
  PENDING = 'pending',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  BLOCKED = 'blocked',
  ACTIVE = 'active',
}

class Role {
  static USER = 'user'
  static ADMIN = 'admin'
  static EXPERT = 'expert'
  static PRE_LAUNCH = 'pre_launch'
}

enum Roles {
  USER = 'user',
  ADMIN = 'admin',
  EXPERT = 'expert',
  PRE_LAUNCH = 'pre_launch',
}

class Status {
  static ACTIVE = 'active'
  static INACTIVE = 'inactive'
}

enum Statues {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

class ProfileTitleTemplate {
  static TEMPLATE_0 = 'template_0'
  static TEMPLATE_1 = 'template_1'
  static TEMPLATE_2 = 'template_2'
  static TEMPLATE_3 = 'template_3'
}

enum ProfileTitleTemplates {
  TEMPLATE_0 = 'template_0',
  TEMPLATE_1 = 'template_1',
  TEMPLATE_2 = 'template_2',
  TEMPLATE_3 = 'template_3',
}

class AddressType {
  PAYMENT = 'payment'
  EXPERT = 'expert'
}

enum AddressTypes {
  PAYMENT = 'payment',
  EXPERT = 'expert',
}

class ExpertStatus {
  static PENDING = 'pending'
  static ACCEPTED = 'accepted'
  static ACTIVE = 'active'
  static INACTIVE = 'inactive'
  static REJECTED = 'rejected'
  static ON_HOLD = 'on_hold'
  static BLOCKED = 'blocked'
  static LEGACY = 'legacy'
}

enum ExpertsStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
}

class RecordType {
  static OLD = 'old'
  static NEW = 'new'
}

enum RecordTypes {
  OLD = 'old',
  NEW = 'new',
}

class InternalRates {
  static PERCENTS = 'PERCENTS '
}

class QuestionActionType {
  static CREATED = 'CREATED'
  static PUBLISHED = 'PUBLISHED'
  static ASSIGNED_TO_EXPERT = 'ASSIGNED_TO_EXPERT'
  static EXPERT_ACCEPTED_THE_QUESTION = 'EXPERT_ACCEPTED_THE_QUESTION'
  static EXPERT_STARTED_COMPOSING_ANSWER = 'EXPERT_STARTED_COMPOSING_ANSWER'
  static EXPERT_EXITED_FROM_ANSWERING_CONSOLE =
    'EXPERT_EXITED_FROM_ANSWERING_CONSOLE'
  static EXPERT_STARTED_WRITING_ANSWER = 'EXPERT_STARTED_WRITING_ANSWER'
  static REJECTED_BY_EXPERT = 'REJECTED_BY_EXPERT'
  static ANSWER_COMPLETED = 'ANSWER_COMPLETED'
  static UNANSWERED_QUESTIONS = 'UNANSWERED_QUESTIONS'
  static CONFORMED_BY_USER = 'CONFORMED_BY_USER'
  static ROUTED_TO_ADMIN = 'ROUTED_TO_ADMIN'
  static UPDATED_CATEGORIES = 'UPDATED_CATEGORIES'
  static REMOVED_ASSIGNED_EXPERTS = 'REMOVED_ASSIGNED_EXPERTS'
  static ROUTING_APPROVED_BY_ADMIN = 'ROUTING_APPROVED_BY_ADMIN'
}

enum QuestionActionTypes {
  CREATED = 'CREATED',
  PUBLISHED = 'PUBLISHED',
  ASSIGNED_TO_EXPERT = 'ASSIGNED_TO_EXPERT',
  EXPERT_ACCEPTED_THE_QUESTION = 'EXPERT_ACCEPTED_THE_QUESTION',
  EXPERT_STARTED_COMPOSING_ANSWER = 'EXPERT_STARTED_COMPOSING_ANSWER',
  EXPERT_EXITED_FROM_ANSWERING_CONSOLE = 'EXPERT_EXITED_FROM_ANSWERING_CONSOLE',
  EXPERT_CANCELLED_ANSWERING = 'EXPERT_CANCELLED_ANSWERING',
  EXPERT_STARTED_WRITING_ANSWER = 'EXPERT_STARTED_WRITING_ANSWER',
  REJECTED_BY_EXPERT = 'REJECTED_BY_EXPERT',
  ANSWER_COMPLETED = 'ANSWER_COMPLETED',
  UNANSWERED_QUESTIONS = 'UNANSWERED_QUESTIONS',
}

class InstituteType {
  static SCHOOL = 'school'
  static COLLEGE = 'college'
}

enum InstituteTypes {
  SCHOOL = 'school',
  COLLEGE = 'college',
}

class PublicationType {
  static ARTICLE = 'article'
}

class PublicationStatus {
  static DRAFT = 'draft'
  static PRIVATE = 'private'
  static PUBLIC = 'public'
}

class AvatarType {
  static PUBLIC = 'public'
  static PRIVATE = 'private'
  static NONE = 'none'
}

class QuestionnaireQuestionType {
  static CITY = 'city'
  static PLAIN_TEXT = 'plain_text'
  static SINGLE_CHOICE = 'single_choice'
  static MULTIPLE_CHOICE = 'multiple_choice'
}

enum QuestionnaireQuestionTypes {
  CITY = 'city',
  PLAIN_TEXT = 'plain_text',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
}

class AppointmentStatus {
  static MATCHING = 'matching'
  static APPROVED = 'approved'
  static REJECTED = 'rejected'
  static UPCOMING = 'upcoming'
  static COMPLETED = 'completed'
}

export class AppGlobals {
  static socketio = 'socketio'
}

export class CreditsPackagesTypes {
  static NEW_USERS = 'NEW_USERS'
  static WEEKLY_RENEWAL = 'WEEKLY_RENEWAL'
  static USER_REFERRALS = 'USER_REFERRALS'
  static USER_ASK_QUESTION = 'USER_ASK_QUESTION'
  static MYLO_COMMISSION_PER_ASKED_QUESTION =
    'MYLO_COMMISSION_PER_ASKED_QUESTION'
}

export {
  AvatarType,
  LedgerTransactionType,
  WalletType,
  MyloCreditTransactionTypes,
  MyloCreditTransactionFlows,
  MyloCreditTransactionFlow,
  MyloCreditTransactionType,
  QuestionStatus,
  QuestionsStatus,
  AnsweredFrom,
  AnswersFrom,
  UserStatus,
  UsersStatus,
  Role,
  Roles,
  Statues,
  Status,
  ProfileTitleTemplate,
  ProfileTitleTemplates,
  AddressType,
  AddressTypes,
  ExpertStatus,
  ExpertsStatus,
  RecordType,
  RecordTypes,
  InstituteType,
  InstituteTypes,
  PublicationType,
  PublicationStatus,
  QuestionActionType,
  QuestionActionTypes,
  QuestionnaireQuestionType,
  QuestionnaireQuestionTypes,
  AdminApproval,
  AppointmentStatus,
  InternalRates,
}
