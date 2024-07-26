import moment from 'moment'
import Expert from '../models/experts.model'
import Question from '../models/questions.model'
import { AdminApproval, QuestionStatus } from '../utils/enums'
import schedule from 'node-schedule'
import { expertNamespace } from '../sockets/experts/questions.socket'
import { SocketEvents, SocketRooms } from '../sockets/socket.enums'
import { sendSocketResponse } from '../helpers/common'

interface IAssignedExpertsCounts {
  question: any
}

interface IAssignedExperts {
  question: any
}

interface IGetIncomingQuestionForExpert {
  expert: any
  page: number
  limit: number
}

interface IGetDetailsForIncomingQuestion {
  question_id: string
}

interface IExpertAcceptQuestion {
  question_id: string
}

interface IUpdateIncomingQuestionAfterTimeout {
  question_id: string
  timeout?: number
}

export class QuestionServices {
  static assignedExpertsCounts = async ({
    question,
  }: IAssignedExpertsCounts) => {
    return await Expert.find({
      // $or: [
      //   {
      //     _id: {
      //       $in: question?.assigned_experts_by_admin ?? [],
      //     },
      //   },
      //   {
      //     _id: {
      //       $nin: question?.removed_experts_by_admin ?? [],
      //     },
      //   },
      // ],
      _id: {
        $nin: question?.removed_experts_by_admin ?? [],
      },
      categories: {
        $in: question?.categories ?? [],
      },
      // [answersField]: { $exists: false },

      // $where: `this.answers.length<${question?.required_answers}`,
    }).count()
  }

  static assignedExperts = async ({ question }: IAssignedExperts) => {
    return await Expert.find({
      _id: {
        $nin: question?.removed_experts_by_admin ?? [],
      },
      categories: {
        $in: question?.categories ?? [],
      },
    })
      .select('_id first_name last_name categories email')
      .lean()
  }

  /**
   * getIncomingQuestionForExpert
   *
   * Reference | Incoming questions on experts side
   * https://docs.google.com/document/d/1pPIAAtD-4fRYgAu6zji5ENzNCDEhk_0l58tMiJwLGeg/edit#heading=h.rvaj4z5sztsa
   *
   */

  static getIncomingQuestionsForExpert = async ({
    expert,
    page = 1,
    limit = 10,
  }: IGetIncomingQuestionForExpert) => {
    const [questions, _counts] = await Promise.all([
      Question.find({
        // categories: { $elemMatch: { $in: expert?.categories } },
        $or: [
          {
            categories: {
              $in: expert?.categories,
            },
            admin_approval: AdminApproval.APPROVED,
            removed_experts_by_admin: {
              $nin: [expert?._id],
            },
            direct_routing: false,
            direct_to_experts: {
              $nin: [expert?._id],
            },
          },
          {
            direct_to_experts: {
              $in: [expert?._id],
            },
            direct_routing: true,
          },
        ],
        $where: `this.answers.length<this.required_answers`,
      })
        .limit(limit)
        .skip(limit * (page - 1))
        .populate('categories')
        .sort({
          createdAt: 'desc',
        })
        .select('_id question answers categories direct_routing createdAt')
        .lean(),
      Question.find({
        $or: [
          {
            categories: {
              $in: expert?.categories,
            },
            admin_approval: AdminApproval.APPROVED,
            removed_experts_by_admin: {
              $nin: [expert?._id],
            },
            direct_routing: false,
            direct_to_experts: {
              $nin: [expert?._id],
            },
          },
          {
            direct_to_experts: {
              $in: [expert?._id],
            },
            direct_routing: true,
          },
        ],
        $where: `this.answers.length<this.required_answers`,
      }).count(),
    ])

    return {
      docs: questions,
      counts: _counts,
      limit,
      page,
    }
  }

  static getActiveQuestionsForExpert = async ({
    expert,
    page = 1,
    limit = 10,
  }: IGetIncomingQuestionForExpert) => {
    const [questions, _counts] = await Promise.all([
      Question.find({
        $or: [
          {
            categories: {
              $in: expert?.categories,
            },
            direct_routing: false,
          },
          {
            direct_to_experts: {
              $in: [expert?._id],
            },
            direct_routing: true,
          },
        ],

        status: QuestionStatus.ACTIVE,
      })
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({
          createdAt: 'desc',
        })
        .select('_id question answers categories createdAt'),
      Question.find({
        $or: [
          {
            categories: {
              $in: expert?.categories,
            },
            direct_routing: false,
          },
          {
            direct_to_experts: {
              $in: [expert?._id],
            },
            direct_routing: true,
          },
        ],
        status: QuestionStatus.ACTIVE,
      }).count(),
    ])

    return {
      docs: questions,
      counts: _counts,
      limit,
      page,
    }
  }

  static getDetailsForIncomingQuestion = async ({
    question_id,
  }: IGetDetailsForIncomingQuestion) => {
    const question = await Question.findById(question_id)
      .populate('user')
      .populate('categories')
      .lean()

    return question
  }

  static expertAcceptQuestion = async ({
    question_id,
  }: IExpertAcceptQuestion) => {
    const question = await Question.findById(question_id)

    return question
  }

  static updateIncomingQuestionAfterTimeout = async ({
    timeout = 2,
    question_id,
  }: IUpdateIncomingQuestionAfterTimeout) => {
    const dateAfter = moment().add(timeout, 'hour')
    // const dateAfter = moment().add(5, 's')

    console.log('Triggered: ', moment().toISOString())
    console.log('Job is started for question with id:', question_id)

    let jobId = `incoming_question_${question_id}`

    try {
      schedule.cancelJob(jobId)
    } catch (err) {
      console.log(`Job with id ${jobId}, is not scheduled`)
    }

    const job = schedule.scheduleJob(
      jobId,
      dateAfter.toISOString(),
      async () => {
        console.log(
          'Job execution is started for question with id: ',
          question_id
        )
        console.log('at: ', moment().toISOString())

        const question = await Question.findByIdAndUpdate(question_id, {})

        if (!question) {
          console.log('Question id: ', question_id)
          console.log('Question not found')
          console.log('Question update failed')
          return
        }

        let answers = question?.answers

        question.status = QuestionStatus.ACTIVE

        if (answers?.length === 0) {
          question.status = QuestionStatus.UNANSWERED
        }

        question.save()

        const expertSocket = expertNamespace

        const questionDetailsRoom =
          SocketRooms.experts.generateExpertQuestionDetailsRoom({
            question_id: question_id,
          })

        await expertSocket.to(questionDetailsRoom).emit(
          SocketEvents.experts.updateIncomingQuestion,
          sendSocketResponse({
            success: true,
          })
        )

        schedule.cancelJob(jobId)

        console.log('Question is updated')
        console.log('Job execution is done: ', question_id)
        console.log('Done: ', moment().toISOString())
      }
    )
  }

  static getUnansweredQuestionsForExpert = async ({
    expert,
    page = 1,
    limit = 10,
  }: IGetIncomingQuestionForExpert) => {
    const options = {
      page: page,
      limit: limit,
      select: '_id question answers categories createdAt direct_routing',
      populate: "categories"
    }

    const rec = await (Question as any).paginate(
      {
        status: QuestionStatus.UNANSWERED,
        categories: {
          $in: expert?.categories,
        },
      },
      options
    )

    return rec
  }
}
