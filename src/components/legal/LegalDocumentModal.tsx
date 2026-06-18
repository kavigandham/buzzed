// Full-screen modal that displays a single legal document. Reuses the warm
// gradient background + header/close chrome established by the Settings picker
// modal, so no stack navigator is needed for the legal surfaces.

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { LegalDocKey, LEGAL_DOCUMENTS } from '../../constants/legal';
import { APP_COLORS } from '../../constants/colors';
import { SPACING, TYPE } from '../../constants/theme';
import AnimatedGradientBackground from '../ui/AnimatedGradientBackground';
import LegalDocumentView from './LegalDocumentView';

interface Props {
  docKey: LegalDocKey | null;
  onClose: () => void;
}

export default function LegalDocumentModal({ docKey, onClose }: Props) {
  const document = docKey ? LEGAL_DOCUMENTS[docKey] : null;

  return (
    <Modal visible={docKey !== null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <AnimatedGradientBackground>
          <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {document ? document.shortTitle : ''}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            {document ? <LegalDocumentView document={document} /> : null}
          </SafeAreaView>
        </AnimatedGradientBackground>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    ...TYPE.h2,
    color: APP_COLORS.text,
    fontWeight: '800',
    flex: 1,
    marginRight: SPACING.md,
  },
  close: { color: APP_COLORS.textSecondary, fontSize: 22, fontWeight: '700' },
});
