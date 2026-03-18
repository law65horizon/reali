import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const FAQ_ITEMS = [
  {
    q: 'How do I cancel a booking?',
    a: `Go to your Trips, select the booking you want to cancel, and tap "Cancel reservation". Refunds depend on the host's cancellation policy shown at the time of booking.`,
  },
  {
    q: 'When will I receive my refund?',
    a: 'Refunds are typically processed within 5–10 business days depending on your payment method and bank. You\'ll receive an email confirmation once initiated.',
  },
  {
    q: 'How do I contact a host?',
    a: 'Open the listing or your confirmed booking and tap the message icon to start a conversation with the host directly.',
  },
  {
    q: 'What if the listing looks different from photos?',
    a: 'If the property significantly differs from the listing, contact us within 24 hours of check-in. We\'ll review your case and work toward a resolution.',
  },
  {
    q: 'How do I leave a review?',
    a: 'After your stay, you\'ll receive a notification prompting you to rate and review. Reviews can be submitted up to 14 days after checkout.',
  },
];

export default function HelpScreen() {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isDark = theme.mode === 'dark';

  return (
    <ThemedView plain secondary style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back nav */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          <ThemedText style={styles.backLabel}>Profile</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.title}>Help & Support</ThemedText>
        <ThemedText secondary style={styles.subtitle}>
          Find answers to common questions or get in touch with our team.
        </ThemedText>

        {/* Quick contact chips */}
        <View style={styles.contactRow}>
          <ContactChip
            icon="chatbubble-ellipses-outline"
            label="Live chat"
            onPress={() => {}}
            theme={theme}
          />
          <ContactChip
            icon="mail-outline"
            label="Email us"
            onPress={() => Linking.openURL('mailto:support@yourapp.com')}
            theme={theme}
          />
        </View>

        {/* FAQ */}
        <ThemedText style={styles.sectionHeading}>Frequently asked questions</ThemedText>

        <View style={[styles.faqCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <React.Fragment key={i}>
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => setOpenIndex(isOpen ? null : i)}
                  activeOpacity={0.75}
                >
                  <ThemedText style={[styles.faqQuestion, { flex: 1 }]}>{item.q}</ThemedText>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={[styles.faqAnswer, { borderTopColor: theme.colors.border }]}>
                    <ThemedText secondary style={styles.faqAnswerText}>
                      {item.a}
                    </ThemedText>
                  </View>
                )}

                {i < FAQ_ITEMS.length - 1 && (
                  <View style={[styles.faqDivider, { backgroundColor: theme.colors.border }]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </ThemedView>
  );
}

function ContactChip({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <ThemedText style={[styles.chipLabel, { color: '#fff' }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
  },
  faqDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});