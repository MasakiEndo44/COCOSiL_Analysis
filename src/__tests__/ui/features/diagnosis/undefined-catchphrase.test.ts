/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'

// Mock component to test catchphrase generation
const generateNaturalCatchphrase = (
  mbtiData: any,
  taihekiData: any,
  zodiacData: any
): string => {
  // Safe accessor functions for vocabulary data with fallbacks
  const getAttributive = (data: any): string => {
    return data?.attributive || data?.adjective || '多面的な';
  };

  const getNoun = (data: any): string => {
    return data?.shortNoun || data?.noun || 'タイプ';
  };

  const getBase = (data: any): string => {
    return data?.base || data?.adjective?.replace(/な$|の$/, '') || '個性';
  };

  const getConnective = (data: any): string => {
    return data?.connective || data?.adjective?.replace(/な$/, 'で') || '多面的で';
  };

  // Helper function to ensure length is appropriate (15-20 characters)
  const adjustLength = (phrase: string, maxLength: number = 20): string => {
    if (phrase.length <= maxLength) return phrase;

    // If too long, try to shorten by removing connectors or simplifying
    const simplified = phrase
      .replace(/タイプの/g, '')
      .replace(/かつ/g, '')
      .replace(/である/g, '')
      .replace(/のある/g, '');

    return simplified.length <= maxLength ? simplified : phrase.substring(0, maxLength);
  };

  // Pattern generation strategies with length consideration
  const generatePattern = (adj: string, noun: string, connector?: string): string => {
    if (connector) {
      const withConnector = `${adj}${connector}${noun}`;
      if (withConnector.length <= 20) return withConnector;
      // If too long, remove connector
      return `${adj}${noun}`;
    }
    return `${adj}${noun}`;
  };

  // Priority: MBTI + Taiheki > MBTI + Zodiac > Single source
  if (mbtiData && taihekiData) {
    // Try different combinations for best fit using safe accessors
    const options = [
      `${getAttributive(mbtiData)}${getNoun(taihekiData)}`, // 最も自然：情熱的な思考家
      `${getBase(mbtiData)}に満ちた${getNoun(taihekiData)}`, // 感情的：情熱に満ちた思考家
      generatePattern(getConnective(mbtiData), getNoun(taihekiData)), // 接続：情熱的で思考家
    ];

    // Find the best option that fits length requirements
    for (const option of options) {
      if (option.length >= 8 && option.length <= 20) {
        return option;
      }
    }
    return adjustLength(options[0]);

  } else if (mbtiData && zodiacData) {
    const result = `${getAttributive(mbtiData)}${getNoun(zodiacData)}`;
    return adjustLength(result);

  } else if (mbtiData) {
    return adjustLength(`${getAttributive(mbtiData)}${getNoun(mbtiData)}`);

  } else if (taihekiData) {
    return adjustLength(`${getAttributive(taihekiData)}${getNoun(taihekiData)}`);

  } else if (zodiacData) {
    return adjustLength(`${getAttributive(zodiacData)}${getNoun(zodiacData)}`);

  } else {
    return 'バランス型の個性';
  }
};

describe('Undefined Catchphrase Bug Fix', () => {
  it('handles legacy MBTI data format without undefined', () => {
    // Legacy ISFP data that was causing undefined
    const legacyISFP = {
      adjective: '芸術的な',
      noun: '魂の人',
      trait1: '内向的',
      trait2: '現実的',
      trait3: '感情的'
    };

    const result = generateNaturalCatchphrase(legacyISFP, null, null);

    expect(result).not.toContain('undefined');
    expect(result).toBe('芸術的な魂の人');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles mixed legacy and new format data', () => {
    const legacyMBTI = {
      adjective: '芸術的な',
      noun: '魂の人'
    };

    const legacyTaiheki = {
      adjective: '冷静な',
      noun: '分析家'
    };

    const result = generateNaturalCatchphrase(legacyMBTI, legacyTaiheki, null);

    expect(result).not.toContain('undefined');
    expect(result).toMatch(/^芸術的な|芸術に満ちた|芸術的で|芸術的に満ちた/);
    expect(result).toContain('分析家');
  });

  it('handles completely missing data fields', () => {
    const emptyMBTI = {};
    const emptyTaiheki = {};

    const result = generateNaturalCatchphrase(emptyMBTI, emptyTaiheki, null);

    expect(result).not.toContain('undefined');
    expect(result).toBe('個性に満ちたタイプ');
  });

  it('handles new schema format correctly', () => {
    const newMBTI = {
      base: '芸術',
      attributive: '芸術的な',
      connective: '芸術的で',
      noun: '魂の人',
      shortNoun: '魂の人'
    };

    const newTaiheki = {
      base: '冷静',
      attributive: '冷静な',
      connective: '冷静で',
      noun: '分析家',
      shortNoun: '分析家'
    };

    const result = generateNaturalCatchphrase(newMBTI, newTaiheki, null);

    expect(result).not.toContain('undefined');
    expect(result).toBe('芸術に満ちた分析家');
  });

  it('handles null/undefined inputs gracefully', () => {
    const result1 = generateNaturalCatchphrase(null, null, null);
    const result2 = generateNaturalCatchphrase(undefined, undefined, undefined);

    expect(result1).toBe('バランス型の個性');
    expect(result2).toBe('バランス型の個性');
    expect(result1).not.toContain('undefined');
    expect(result2).not.toContain('undefined');
  });

  it('validates all generated phrases contain no undefined', () => {
    const testCases = [
      // Legacy MBTI types that were problematic
      { adjective: '思いやり深い', noun: '社交家' },
      { adjective: '献身的な', noun: '守護者' },
      { adjective: '行動的な', noun: '実行者' },
      { adjective: '職人気質の', noun: '技術者' },
      { adjective: '実務的な', noun: '管理者' },
      { adjective: '堅実な', noun: '管理者' },
    ];

    testCases.forEach((mbtiData, _index) => {
      const result = generateNaturalCatchphrase(mbtiData, null, null);
      expect(result).not.toContain('undefined');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });
});