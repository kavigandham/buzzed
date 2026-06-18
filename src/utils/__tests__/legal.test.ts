// Structure + safety-content tests for the legal/safety document package.
// Pure data — no React Native render needed (jest runs in node env).
// These guard against accidentally shipping an empty section, dropping a
// required safety string, or breaking the placeholder-fill mechanism.

import {
  LEGAL_INFO,
  LEGAL_VERSION,
  LEGAL_DOCUMENTS,
  LEGAL_DOC_ORDER,
  DISCLAIMER_SHORT,
  fillLegalTemplate,
} from '../../constants/legal';

describe('legal package — structure', () => {
  it('exposes all four documents in a defined display order', () => {
    expect(LEGAL_DOC_ORDER).toEqual(['privacy', 'terms', 'eula', 'disclaimer']);
    for (const key of LEGAL_DOC_ORDER) {
      expect(LEGAL_DOCUMENTS[key]).toBeDefined();
    }
  });

  it('every document has a non-empty title and at least one section', () => {
    for (const key of LEGAL_DOC_ORDER) {
      const doc = LEGAL_DOCUMENTS[key];
      expect(doc.title.trim().length).toBeGreaterThan(0);
      expect(doc.sections.length).toBeGreaterThan(0);
    }
  });

  it('no section has an empty heading or an empty paragraph', () => {
    for (const key of LEGAL_DOC_ORDER) {
      for (const section of LEGAL_DOCUMENTS[key].sections) {
        if (section.heading !== undefined) {
          expect(section.heading.trim().length).toBeGreaterThan(0);
        }
        expect(section.paragraphs.length).toBeGreaterThan(0);
        for (const p of section.paragraphs) {
          expect(p.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('has a tracked legal version for the clickwrap consent record', () => {
    expect(typeof LEGAL_VERSION).toBe('string');
    expect(LEGAL_VERSION.trim().length).toBeGreaterThan(0);
  });
});

describe('legal package — placeholder fill', () => {
  it('replaces {{token}} placeholders from LEGAL_INFO', () => {
    expect(fillLegalTemplate('Contact {{contactEmail}}.')).toBe(
      `Contact ${LEGAL_INFO.contactEmail}.`
    );
  });

  it('leaves unknown tokens untouched', () => {
    expect(fillLegalTemplate('Hello {{nope}}')).toBe('Hello {{nope}}');
  });
});

describe('legal package — required safety content', () => {
  const allText = (() => {
    const parts: string[] = [DISCLAIMER_SHORT];
    for (const key of Object.keys(LEGAL_DOCUMENTS) as Array<
      keyof typeof LEGAL_DOCUMENTS
    >) {
      const doc = LEGAL_DOCUMENTS[key];
      parts.push(doc.title);
      for (const s of doc.sections) {
        if (s.heading) parts.push(s.heading);
        parts.push(...s.paragraphs);
      }
    }
    return parts.join('\n');
  })();

  it('short disclaimer warns against using the app to decide to drive', () => {
    expect(DISCLAIMER_SHORT.toLowerCase()).toContain('drive');
    expect(DISCLAIMER_SHORT).toMatch(/BAC/);
  });

  it('surfaces the SAMHSA national helpline number', () => {
    expect(allText).toContain('1-800-662-HELP');
  });

  it('states the app never calculates BAC', () => {
    expect(allText).toMatch(/Blood Alcohol Content/i);
  });

  it('preserves a conspicuous (emphasis) clause for the warranty/liability terms', () => {
    const hasEmphasis = (LEGAL_DOC_ORDER as readonly string[]).some((key) =>
      LEGAL_DOCUMENTS[key as keyof typeof LEGAL_DOCUMENTS].sections.some(
        (s) => s.emphasis === true
      )
    );
    expect(hasEmphasis).toBe(true);
  });

  it('names merchantability in an emphasized clause (NJ UCC § 12A:2-316)', () => {
    const emphasizedText = (LEGAL_DOC_ORDER as readonly string[])
      .flatMap((key) =>
        LEGAL_DOCUMENTS[key as keyof typeof LEGAL_DOCUMENTS].sections
          .filter((s) => s.emphasis)
          .flatMap((s) => s.paragraphs)
      )
      .join('\n');
    expect(emphasizedText).toMatch(/MERCHANTABILITY/);
  });
});
