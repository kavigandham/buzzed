// First-launch age gate + clickwrap consent. Shown before the app whenever no
// legal acceptance is stored (see App.tsx Root + DrinkContext.hasAcceptedLegal).
//
// Acceptance is affirmative (a tap on "I am of legal drinking age — Enter")
// and the four legal documents are reachable as tappable links here, so the
// consent qualifies as a conspicuous clickwrap agreement. Tapping "I am not"
// shows a block screen with no way into the app and stores no consent.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrink } from '../contexts/DrinkContext';
import { AGE_GATE, DISCLAIMER_SHORT, LegalDocKey } from '../constants/legal';
import { APP_COLORS } from '../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../constants/theme';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';
import GradientButton from '../components/ui/GradientButton';
import LegalDocumentModal from '../components/legal/LegalDocumentModal';

const DOC_LINKS: { key: LegalDocKey; label: string }[] = [
  { key: 'terms', label: 'Terms of Service' },
  { key: 'eula', label: 'End User License Agreement' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'disclaimer', label: 'Alcohol & Health Disclaimer' },
];

export default function AgeGateScreen() {
  const { acceptLegal } = useDrink();
  const [openDoc, setOpenDoc] = useState<LegalDocKey | null>(null);
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <AnimatedGradientBackground>
        <SafeAreaView style={styles.blockFill} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.blockBody}>
            <Text style={styles.brand}>Buzzed.</Text>
            <Text style={styles.blockText}>{AGE_GATE.declinedMessage}</Text>
            <GradientButton
              title="Go back"
              variant="outline"
              onPress={() => setDeclined(false)}
              style={styles.backButton}
            />
          </View>
        </SafeAreaView>
      </AnimatedGradientBackground>
    );
  }

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>Buzzed.</Text>
          <Text style={styles.title}>{AGE_GATE.title}</Text>
          <Text style={styles.body}>{AGE_GATE.body}</Text>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>{DISCLAIMER_SHORT}</Text>
          </View>

          <Text style={styles.consent}>{AGE_GATE.consent}</Text>

          <View style={styles.links}>
            {DOC_LINKS.map((d) => (
              <Text key={d.key} style={styles.link} onPress={() => setOpenDoc(d.key)}>
                {d.label}
              </Text>
            ))}
          </View>

          <GradientButton
            title={AGE_GATE.acceptLabel}
            onPress={acceptLegal}
            style={styles.accept}
          />
          <GradientButton
            title={AGE_GATE.declineLabel}
            variant="outline"
            onPress={() => setDeclined(true)}
            style={styles.decline}
          />
        </ScrollView>
      </SafeAreaView>

      <LegalDocumentModal docKey={openDoc} onClose={() => setOpenDoc(null)} />
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  brand: {
    ...TYPE.display,
    color: APP_COLORS.text,
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPE.h2,
    fontSize: 22,
    color: APP_COLORS.text,
    marginBottom: SPACING.md,
  },
  body: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  disclaimerBox: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderWidth: 1,
    borderColor: APP_COLORS.accent,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  disclaimerText: {
    color: APP_COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  consent: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
  links: {
    marginBottom: SPACING.xxl,
  },
  link: {
    color: APP_COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: SPACING.sm,
  },
  accept: { marginBottom: SPACING.md },
  decline: { marginBottom: SPACING.lg },
  // Block screen (under-age exit)
  blockFill: { flex: 1 },
  blockBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  blockText: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  backButton: { alignSelf: 'flex-start', paddingHorizontal: SPACING.xxl },
});
