// Scrollable renderer for a structured legal document (see constants/legal.ts).
// Resolves {{token}} placeholders at render time and linkifies the SAMHSA
// helpline numbers, the contact email, and any https URL. ALL-CAPS warranty /
// liability clauses (section.emphasis) render in a conspicuous bordered box to
// preserve the visual distinctness NJ UCC § 12A:2-316 and the TCCWNA require.

import { Fragment } from 'react';
import {
  Linking,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { LegalDocument, fillLegalTemplate } from '../../constants/legal';
import { APP_COLORS } from '../../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../../constants/theme';

interface Props {
  document: LegalDocument;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// Matches https URLs, emails, and the two SAMHSA helpline numbers (which
// contain letters, so a generic phone regex won't catch them).
const LINK_RE =
  /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+|1-800-662-HELP \(4357\)|1-800-487-4889)/g;

function hrefFor(token: string): string | null {
  if (/^https?:\/\//.test(token)) return token;
  if (token.includes('@')) return `mailto:${token}`;
  if (token.startsWith('1-800-662-HELP')) return 'tel:18006624357';
  if (token === '1-800-487-4889') return 'tel:18004874889';
  return null;
}

// Splits a paragraph into plain text + tappable link spans.
function LinkifiedText({ text, style }: { text: string; style: StyleProp<TextStyle> }) {
  const parts = text.split(LINK_RE);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        const href = hrefFor(part);
        if (href) {
          return (
            <Text key={i} style={styles.link} onPress={() => Linking.openURL(href)}>
              {part}
            </Text>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Text>
  );
}

export default function LegalDocumentView({ document, contentContainerStyle }: Props) {
  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator
    >
      <Text style={styles.title}>{fillLegalTemplate(document.title)}</Text>
      {document.subtitle ? (
        <Text style={styles.subtitle}>{fillLegalTemplate(document.subtitle)}</Text>
      ) : null}

      {document.sections.map((section, si) => {
        const body = (
          <View key={si} style={section.emphasis ? styles.emphasisBox : styles.section}>
            {section.heading ? (
              <Text style={styles.heading}>{fillLegalTemplate(section.heading)}</Text>
            ) : null}
            {section.paragraphs.map((p, pi) => (
              <LinkifiedText
                key={pi}
                text={fillLegalTemplate(p)}
                style={[styles.paragraph, section.emphasis && styles.emphasisText]}
              />
            ))}
          </View>
        );
        return body;
      })}

      <Text style={styles.footnote}>
        These are reference drafts and are not legal advice. Buzzed is an
        entertainment and awareness tool only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 48,
  },
  title: {
    ...TYPE.h2,
    fontSize: 24,
    fontWeight: '800',
    color: APP_COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  heading: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  paragraph: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.sm,
  },
  emphasisBox: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderWidth: 1,
    borderColor: APP_COLORS.accent,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  emphasisText: {
    color: APP_COLORS.text,
    fontWeight: '600',
  },
  link: {
    color: APP_COLORS.accent,
    fontWeight: '700',
  },
  footnote: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: SPACING.lg,
    opacity: 0.8,
  },
});
