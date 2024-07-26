/**
 * Typescript interfaces
 *
 */

interface IGenerateExpertQuestionDetailsRoom {
  question_id: string
}

interface IGenerateCategorizationRoomForQuestion {
  question_id: string
}

interface IGenerateIncomingQuestionRoomPerForCategory {
  category_id: string
}

export class SocketNamespaces {
  static experts = 'experts'
  static users = 'users'
}

export class SocketRooms {
  static experts = {
    errorRoom: 'room:expert:errors_room',
    incomingQuestions: 'room:expert:incoming_questions',
    generateExpertIncomingQuestionsRoom: ({ userId }: { userId: string }) => {
      return `${this.experts.incomingQuestions}:${userId}`
    },
    generateExpertQuestionDetailsRoom: ({
      question_id,
    }: IGenerateExpertQuestionDetailsRoom) => {
      return `room:expert:question_details_${question_id}`
    },
    generateIncomingQuestionRoomForCategory: ({
      category_id,
    }: IGenerateIncomingQuestionRoomPerForCategory) => {
      return `room:expert:incoming_questions:category_${category_id}`
    },
  }

  static users = {
    errorRoom: 'room:user:errors_room',

    /**
     * General purpose room for the given user
     *
     * Room syntax: room:user:${userId}
     *
     * We can user this room to send the general messages to user like errors messages, notifications, and more
     * @param userId
     * @returns room:user:${userId}
     */
    generateUserRoom: ({ userId }: { userId: string }) => `room:user:${userId}`,

    incomingQuestions: 'room:user:incoming_questions',
    generateExpertIncomingQuestionsRoom: ({ userId }: { userId: string }) => {
      return `${this.experts.incomingQuestions}:${userId}`
    },

    /**
     * Generate question details room for the given user
     *
     * @param question_id
     * @returns room:user:question_details_${question_id}
     */
    generateQuestionDetailsRoom: ({
      question_id,
    }: IGenerateExpertQuestionDetailsRoom) => {
      return `room:user:question_details:${question_id}`
    },
    generateIncomingQuestionRoomForCategory: ({
      category_id,
    }: IGenerateIncomingQuestionRoomPerForCategory) => {
      return `room:user:incoming_questions:category_${category_id}`
    },

    generateCategorizationRoomForQuestion: ({
      question_id,
    }: IGenerateCategorizationRoomForQuestion) => {
      return `room:question:categorization:${question_id}`
    },
  }
}

export class SocketEvents {
  static experts = {
    getIncomingQuestions: 'expert:get_incoming_questions',
    refetchIncomingQuestions: 'expert:refetch_incoming_questions',
    refreshIncomingQuestions: 'expert:refresh_incoming_questions',
    refetchIncomingQuestionDetails: 'expert:refetch_incoming_question_details',
    joinQuestionDetailsRoom: 'expert:join_question_details_room',
    leaveQuestionDetailsRoom: 'expert:leave_question_details_room',
    joinIncomingQuestionsListRoom: 'expert:join_incoming_questions_list_room',
    leaveIncomingQuestionsListRoom: 'expert:leave_incoming_questions_list_room',
    joinIncomingQuestionsRoom: 'expert:join_incoming_questions_room',
    leaveIncomingQuestionsRoom: 'expert:leave_incoming_questions_room',
    updateIncomingQuestion: 'expert:update_incoming_question',
    directQuestionIsAdded: 'expert:direct_question_is_added',
    updatedIncomingQuestionStats: 'expert:update_incoming_question_stats',
    error: 'error',

    errors: {
      joinQuestionDetailsRoom: 'error:expert:join_question_details_room',
    },
  }

  static users = {
    joinQuestionDetailsRoom: 'user:join_question_details_room',
    leaveQuestionDetailsRoom: 'user:leave_question_details_room',
    updateQuestionDetails: 'user:update_question_details',
    questionDetailsUpdated: 'user:question_details_updated',
    questionIsAcceptedByExpert: 'user:question_accepted_by_expert',
    answerSubmittedForQuestion: 'user:answer_submitted_for_question',
    updateQuestionList: 'user:update_question_list',
    questionViewsUpdated: 'user:question_views_updated',
    error: 'error',

    errors: {
      joinQuestionDetailsRoom: 'error:user:join_question_details_room',
    },
  }

  static categorizer = {
    joinCategorizerRoomForQuestion:
      'categorizer:join_categorization_room_for_question',
    leaveCategorizerRoomForQuestion:
      'categorizer:leave_categorization_room_for_question',
    categorize: 'categorize',
    result: 'result',
    categorization_success: 'categorization_success',
    categorization_failed: 'categorization_failed',
  }
}

export class SocketErrorEvents {
  static argumentsValidationError = 'error:arguments:validation'
}

export class SocketErrors {
  static argumentsValidationError = 'error:arguments:validation'
}
