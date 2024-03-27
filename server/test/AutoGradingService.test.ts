import { it, describe, expect, vitest } from 'vitest';
import { AutoGradingService } from '../src/services/AutoGradingService';
import { BASIC_ONE_ROUND_QUIZ } from './mocks/sampleQuizzes';
import {
  AnswerStateGraded,
  LiveQuizTeamResponse,
  RoundTemplateResponse,
} from '@shared/responses';

describe('AutoGradingService', () => {
  it('can format the grading correctly', async () => {
    const autoGradingService = new AutoGradingService();

    autoGradingService.checkAnswers = vitest
      .fn()
      .mockImplementation((correctAnswers: string[]): ('true' | 'false')[] => {
        const ret: ('true' | 'false')[] = [];
        for (let i = 0; i < correctAnswers.length; i++) {
          ret.push('true');
        }
        return ret;
      });

    const team = BASIC_ONE_ROUND_QUIZ.liveQuizTeams[0] as LiveQuizTeamResponse;
    const round = BASIC_ONE_ROUND_QUIZ.quizTemplateJson
      .rounds?.[0] as RoundTemplateResponse;

    const roundAnswerState = autoGradingService.gradeAnswersInRound(
      team,
      round
    );

    // console.log('RESULT!', roundAnswerState);

    const answer1: AnswerStateGraded = roundAnswerState[round.questionOrder[0]];
    const answer2: AnswerStateGraded = roundAnswerState[round.questionOrder[1]];
    const answer3: AnswerStateGraded = roundAnswerState[round.questionOrder[2]];
    const answer4: AnswerStateGraded = roundAnswerState[round.questionOrder[3]];
    const answer5: AnswerStateGraded = roundAnswerState[round.questionOrder[4]];

    expect(answer1.answer1).toBe('true');
    expect(answer1.answer2).toBeUndefined();
    expect(answer1.answer3).toBeUndefined();

    expect(answer2.answer1).toBe('true');
    expect(answer2.answer2).toBe('true');
    expect(answer2.answer3).toBe('true');

    expect(answer3.answer1).toBe('true');
    expect(answer3.answer2).toBeUndefined();
    expect(answer3.answer3).toBeUndefined();

    expect(answer4.answer1).toBe('true');
    expect(answer4.answer2).toBe('true');
    expect(answer4.answer3).toBe('true');

    expect(answer5.answer1).toBe('true');
    expect(answer5.answer2).toBeUndefined();
    expect(answer5.answer3).toBeUndefined();
  });

  describe('fuzzy auto grading', () => {
    it('order matters works positive case', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['First', 'Second', 'Third', 'Fourth'];
      const submittedAnswers = ['First', 'Second', 'Third', 'Fourth'];
      const orderMatters = true;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['true', 'true', 'true', 'true']);
    });

    it('order matters works negative case', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['First', 'Second', 'Third', 'Fourth'];
      const submittedAnswers = ['Second', 'Third', 'Fourth', 'First'];
      const orderMatters = true;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['false', 'false', 'false', 'false']);
    });

    it('no order matters works', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['First', 'Second', 'Third', 'Fourth'];
      const submittedAnswers = ['Second', 'Third', 'Fourth', 'First'];
      const orderMatters = false;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['true', 'true', 'true', 'true']);
    });

    it('close spelling works', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['Oppenheimer'];
      const submittedAnswers = ['openhimer'];
      const orderMatters = false;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['unknown']);
    });

    it('close spelling works multi', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['Alanis Morissette', 'Ironic'];
      const submittedAnswers = ['iron', 'Atlantis Moriset'];
      const orderMatters = false;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['true', 'unknown']);
    });

    it('close spelling fails when order matters', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = ['Alanis Morissette', 'Ironic'];
      const submittedAnswers = ['iron', 'Atlantis Moriset'];
      const orderMatters = true;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['false', 'false']);
    });

    it('arguably correct answers', () => {
      const autoGradingService = new AutoGradingService();
      const correctAnswers = [
        'Pete Davidson',
        'Ariana Grande',
        'SNL',
        'Jazz Music',
      ];
      const submittedAnswers = ['Peter Davids', 'Marina Grand', 'SAT', 'Blues'];
      const orderMatters = true;
      const results = autoGradingService.checkAnswers(
        correctAnswers,
        submittedAnswers,
        orderMatters
      );
      expect(results).toEqual(['true', 'unknown', 'false', 'false']);
    });
  });
});
