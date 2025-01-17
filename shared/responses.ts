// Only put types in this file, and don't include any server side node_modules.  This file
// is included on the client as well

interface CreateUpdateDelete {
  updatedOn?: string;
  updatedAt?: string;
  creationDate: string;
  deletionDate?: string;
}

export interface AccountResponse extends CreateUpdateDelete {
  id: string;
  email: string;
  quizTemplates?: QuizTemplateResponse[];
  liveQuizzes?: LiveQuizResponse[];
}

export interface QuizTemplateResponse extends CreateUpdateDelete {
  id: string;
  accountId: string;
  account: AccountResponse;
  roundOrder: string[];
  name: string;
  rounds?: RoundTemplateResponse[];
  numRounds: number;
  notes?: string;
  isJoker?: boolean;
}

export interface RoundTemplateResponse extends CreateUpdateDelete {
  id: string;
  quizTemplateId: string;
  quizTemplateName: string;
  quizTemplate?: QuizTemplateResponse;
  title: string;
  description: string;
  questionOrder: string[];
  questions?: QuestionTemplateResponse[];
  notes?: string;
  jokerDisabled?: boolean;
}

export enum AnswerBoxType {
  INPUT1 = 'input1',
  INPUT2 = 'input2',
  INPUT3 = 'input3',
  INPUT4 = 'input4',
  INPUT8 = 'input8',
  INPUT16 = 'input16',
  INPUT16_WITH_EXTRA = 'input16_with_extra',
  RADIO2 = 'radio2',
  RADIO3 = 'radio3',
  RADIO4 = 'radio4',
  RADIO8 = 'radio8',
  INPUT1_LIST = 'input1_list',
  INPUT2_LIST = 'input2_list',
  INPUT3_LIST = 'input3_list',
  INPUT4_LIST = 'input4_list',
  INPUT8_LIST = 'input8_list',
  INPUT16_LIST = 'input16_list',
}

export interface QuestionTemplateResponse extends CreateUpdateDelete {
  id: string;
  roundTemplateId: string;
  roundTemplate?: RoundTemplateResponse;
  text: string;
  answers: AnswerState;
  answerType: AnswerBoxType;
  imageLink?: string;
  orderMatters: boolean;
  isBonus: boolean;
  notes?: string;
}

export type AnswerState = {
  answer1?: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;
  answer6?: string;
  answer7?: string;
  answer8?: string;
  answer9?: string;
  answer10?: string;
  answer11?: string;
  answer12?: string;
  answer13?: string;
  answer14?: string;
  answer15?: string;
  answer16?: string;
  radio1?: string;
  radio2?: string;
  radio3?: string;
  radio4?: string;
  radio5?: string;
  radio6?: string;
  radio7?: string;
  radio8?: string;
};

export type AnswerStateGraded = Record<
  Partial<keyof AnswerState>,
  'true' | 'false' | 'unknown'
>;
export type AnswerStateStats = Record<number | string, number | string[]>;

export const stringToAnswerState = (s?: string): AnswerState => {
  try {
    const answersState = s ? JSON.parse(s) : {};
    return answersState;
  } catch (e) {
    return {
      answer1: '',
    };
  }
};

export const answerStateToString = (s: AnswerState) => {
  return JSON.stringify(s);
};

export const getNumAnswers = (answerType: AnswerBoxType) => {
  switch (answerType) {
    case AnswerBoxType.RADIO2:
    case AnswerBoxType.RADIO3:
    case AnswerBoxType.RADIO4:
    case AnswerBoxType.RADIO8:
    case AnswerBoxType.INPUT1:
    case AnswerBoxType.INPUT1_LIST:
      return 1;
    case AnswerBoxType.INPUT2:
    case AnswerBoxType.INPUT2_LIST:
      return 2;
    case AnswerBoxType.INPUT3:
    case AnswerBoxType.INPUT3_LIST:
      return 3;
    case AnswerBoxType.INPUT4:
    case AnswerBoxType.INPUT4_LIST:
      return 4;
    case AnswerBoxType.INPUT8:
    case AnswerBoxType.INPUT8_LIST:
      return 8;
    case AnswerBoxType.INPUT16:
    case AnswerBoxType.INPUT16_LIST:
      return 16;
    case AnswerBoxType.INPUT16_WITH_EXTRA:
      return 32;
  }
  return 1;
};

export const getNumRadioBoxes = (answerType: AnswerBoxType) => {
  switch (answerType) {
    case AnswerBoxType.RADIO2:
      return 2;
    case AnswerBoxType.RADIO3:
      return 3;
    case AnswerBoxType.RADIO4:
      return 4;
    case AnswerBoxType.RADIO8:
      return 8;
    default:
      return 0;
  }
  return 0;
};

export const getNumCorrectAnswers = (answerType: AnswerBoxType) => {
  switch (answerType) {
    case AnswerBoxType.RADIO2:
    case AnswerBoxType.RADIO3:
    case AnswerBoxType.RADIO4:
    case AnswerBoxType.RADIO8:
    case AnswerBoxType.INPUT1:
    case AnswerBoxType.INPUT16:
    case AnswerBoxType.INPUT16_WITH_EXTRA:
    case AnswerBoxType.INPUT2:
    case AnswerBoxType.INPUT3:
    case AnswerBoxType.INPUT4:
    case AnswerBoxType.INPUT8:
      return getNumAnswers(answerType);
    case AnswerBoxType.INPUT3_LIST:
    case AnswerBoxType.INPUT1_LIST:
    case AnswerBoxType.INPUT2_LIST:
    case AnswerBoxType.INPUT4_LIST:
    case AnswerBoxType.INPUT8_LIST:
    case AnswerBoxType.INPUT16_LIST:
      return 32;
  }
  return 1;
};

export const ANSWER_DELIMITER = ' | ';

// each entry except orderMattersArr is a list of strings delimited by ANSWER_DELIMITER
// - answersArr is the list of answers for each question in a round
// - teamAnswersArr is the list of answers for each question in a round submitted by a team
// - orderMattersArr is the list of whether the order matters for each question
export const getRoundAnswersArrays = (
  roundTemplate: RoundTemplateResponse,
  team: LiveQuizTeamResponse
) => {
  const answersArr: string[] = [];
  const teamAnswersArr: string[] = [];
  const orderMattersArr: boolean[] = [];

  const submittedAnswers =
    team.liveQuizRoundAnswers.find(a => a.roundId === roundTemplate.id)
      ?.answers ?? {};

  for (let j = 0; j < roundTemplate.questionOrder.length; j++) {
    const questionId = roundTemplate.questionOrder[j];
    const questionTemplate = roundTemplate.questions?.find(
      q => q.id === questionId
    );
    if (!questionTemplate) {
      continue;
    }

    const numAnswers = getNumAnswers(questionTemplate.answerType);
    const numCorrectAnswers = getNumCorrectAnswers(questionTemplate.answerType);

    const qArr: string[] = [];
    const qTeamArr: string[] = [];
    if (numCorrectAnswers !== numAnswers) {
      for (let k = 0; k < 8; k++) {
        const key = 'answer' + (k + 1);
        const answers = questionTemplate.answers[key];
        if (answers) {
          const teamAnswers = submittedAnswers[j + 1]?.[key];
          qArr.push(answers);
          qTeamArr.push(teamAnswers);
        }
      }
    } else {
      for (let k = 0; k < numAnswers; k++) {
        const key = 'answer' + (k + 1);
        const answers = questionTemplate.answers[key];
        const teamAnswers = submittedAnswers[j + 1]?.[key];
        qArr.push(answers);
        qTeamArr.push(teamAnswers);
      }
    }
    answersArr.push(qArr.join(ANSWER_DELIMITER));
    teamAnswersArr.push(qTeamArr.join(ANSWER_DELIMITER));
    orderMattersArr.push(questionTemplate.orderMatters);
  }
  return { answersArr, teamAnswersArr, orderMattersArr };
};

export enum LiveQuizState {
  NOT_STARTED = 'not_started',
  STARTED_WAITING = 'started_waiting',
  STARTED_IN_ROUND = 'started_in_round',
  COMPLETED = 'completed',
  SHOWING_ANSWERS_ANSWERS_HIDDEN = 'showing_answers_hidden',
  SHOWING_ANSWERS_ANSWERS_VISIBLE = 'showing_answers_visible',
  HALTED = 'halted',
}

export enum LiveRoundState {
  NOT_STARTED = 'not_started',
  STARTED_ACCEPTING_ANSWERS = 'started_accepting_answers',
  STARTED_NOT_ACCEPTING_ANSWERS = 'started_not_accepting_answers',
  COMPLETED = 'completed',
  HALTED = 'halted',
}

// roundId -> questionId -> answerState
export type QuizStats = Record<string, Record<string, AnswerStateStats>>;

export interface LiveQuizResponse extends CreateUpdateDelete {
  id: string;
  accountId: string;
  userFriendlyId: string;
  quizTemplateId: string;
  quizTemplateJson: QuizTemplateResponse;
  name: string;
  liveQuizTeams: LiveQuizTeamResponse[];
  quizState: LiveQuizState;
  roundState: LiveRoundState;
  currentRoundNumber: number;
  currentQuestionNumber: number;
  currentRoundAnswerNumber: number;
  currentRoundScoresNumber: number;
  stats: QuizStats;
  startedAt?: string;
  completedAt?: string;
  isJoker?: boolean;
}

export interface LiveQuizTeamResponse extends CreateUpdateDelete {
  id: string;
  publicId: string;
  liveQuizId?: string;
  liveQuizRoundAnswers: LiveQuizRoundAnswersResponse[];
  teamName: string;
  numberOfPlayers: number;
  currentScore: number;
}

export interface LiveQuizRoundAnswersResponse extends CreateUpdateDelete {
  id: string;
  liveQuizTeamId?: string;
  roundId: string;
  answers: Record<string, AnswerState>;
  answersGraded: Record<string, Partial<AnswerStateGraded>>;
  didJoker: boolean;
}

export interface LiveQuizPublicResponse extends CreateUpdateDelete {
  id: string;
  userFriendlyId: string;
  quizTemplateId: string;
  name: string;
  quizState: LiveQuizState;
  roundState: LiveRoundState;
  currentRoundNumber: number;
  currentQuestionNumber: number;
  currentRoundAnswerNumber: number;
  startedAt?: string;
  completedAt?: string;
}

export interface LiveQuizPublicQuestionResponse {
  text: string;
  answerType: AnswerBoxType;
  answers?: AnswerState;
  imageLink?: string;
}

export interface LiveQuizPublicStateResponse {
  quiz: LiveQuizPublicResponse;
  teamId?: string;
  teams: LiveQuizTeamResponse[];
  teamsScores: {
    teamId: string;
    score: number;
  }[];
  hasUsedJoker: boolean;
  isComplete: boolean;
  isJoker?: boolean;
  round?: {
    id: string;
    roundNumber: number;
    questionNumber: number;
    totalNumberOfQuestions: number;
    title: string;
    didJoker: boolean;
    description: string;
    answersSubmitted?: Record<string, AnswerState>;
    answersGraded?: Record<string, Partial<AnswerStateGraded>>;
    questions: LiveQuizPublicQuestionResponse[];
    stats?: Record<string, AnswerStateStats>;
    jokerDisabled: boolean;
  };
}

// Used for JSON exports ---------------------------------------------

export interface StructuredQuizRound {
  id: string;
  title: string;
  description: string;
  notes: string;
  questions: string[];
}

export interface StructuredQuizQuestion {
  id: string;
  roundId: string;
  text: string;
  notes: string;
  answers: string[];
  orderMatters: boolean;
  isBonus: boolean;
  answerType: AnswerBoxType;
  numAnswers: number;
  numCorrectAnswers: number;
}

export interface StructuredQuizTeamAnswersSubmission {
  questionId: string;
  roundId: string;
  answers: string[];
}

export interface StructuredQuizTeam {
  id: string;
  name: string;
  submittedAnswers: StructuredQuizTeamAnswersSubmission[];
}

export interface StructuredQuizResponse {
  id: string;
  name: string;
  title: string;
  questions: StructuredQuizQuestion[];
  rounds: StructuredQuizRound[];
  teams: StructuredQuizTeam[];
}
