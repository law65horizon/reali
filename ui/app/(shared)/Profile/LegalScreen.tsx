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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type DocKey = 'terms' | 'privacy' | 'cookies';

// Each section is either a plain intro paragraph or a heading+body pair
type DocSection =
  | { type: 'intro'; text: string }
  | { type: 'clause'; heading: string; body: string };

const DOCS: { key: DocKey; title: string; updated: string; icon: any; sections: DocSection[] }[] = [
  {
    key: 'terms',
    title: 'Terms of Service',
    updated: 'Last updated March 2025',
    icon: 'document-text-outline',
    sections: [
      { type: 'intro', text: 'By using our platform, you agree to these Terms of Service. Please read them carefully before booking or listing a property.' },
      { type: 'clause', heading: 'Eligibility', body: 'You must be at least 18 years old and legally able to enter into contracts to use our services.' },
      { type: 'clause', heading: 'Bookings', body: 'When a booking is confirmed, a contract is formed directly between you and the host. We act as a facilitator only.' },
      { type: 'clause', heading: 'Payments', body: 'All transactions are processed securely. Pricing is set by hosts and may include service fees displayed before checkout.' },
      { type: 'clause', heading: 'Cancellations', body: "Each listing has a cancellation policy set by the host. Refund eligibility depends on this policy and the time of cancellation." },
      { type: 'clause', heading: 'Prohibited conduct', body: 'You may not misrepresent yourself, submit fraudulent content, or use the platform to harm others.' },
      { type: 'clause', heading: 'Limitation of liability', body: 'We are not liable for indirect, incidental, or consequential damages arising from your use of the service.' },
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    updated: 'Last updated March 2025',
    icon: 'shield-checkmark-outline',
    sections: [
      { type: 'intro', text: 'Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights.' },
      { type: 'clause', heading: 'Data we collect', body: 'We collect information you provide (name, email, payment info), usage data, and device identifiers to improve our service.' },
      { type: 'clause', heading: 'How we use it', body: 'We use your data to process bookings, personalise your experience, send important notifications, and improve platform safety.' },
      { type: 'clause', heading: 'Sharing', body: 'We share data with hosts when you book, and with payment processors to complete transactions. We do not sell your personal data.' },
      { type: 'clause', heading: 'Retention', body: 'We retain your data as long as your account is active, and for a reasonable period after, to comply with legal obligations.' },
      { type: 'clause', heading: 'Your rights', body: 'You may request access to, correction of, or deletion of your personal data by contacting our support team.' },
      { type: 'clause', heading: 'Cookies', body: 'We use cookies and similar technologies to enhance your experience. See our Cookie Policy for details.' },
    ],
  },
  {
    key: 'cookies',
    title: 'Cookie Policy',
    updated: 'Last updated January 2025',
    icon: 'globe-outline',
    sections: [
      { type: 'intro', text: 'We use cookies and similar tracking technologies to operate and improve our service.' },
      { type: 'clause', heading: 'What are cookies?', body: 'Cookies are small text files stored on your device when you visit our platform.' },
      { type: 'clause', heading: 'Types we use', body: 'Essential cookies are required for the platform to function. Analytics cookies help us understand usage patterns. Preference cookies remember your settings.' },
      { type: 'clause', heading: 'Third-party cookies', body: "Some features may set third-party cookies (e.g. for payment processing or analytics). These are governed by the respective providers' policies." },
      { type: 'clause', heading: 'Managing cookies', body: 'You can control cookies through your browser settings. Disabling essential cookies may limit platform functionality.' },
    ],
  },
];

function renderDocContent(sections: DocSection[], theme: any) {
  return sections.map((section, i) => {
    if (section.type === 'intro') {
      return (
        <ThemedText key={i} secondary style={styles.docIntro}>
          {section.text}
        </ThemedText>
      );
    }
    return (
      <View key={i} style={styles.clauseBlock}>
        <Text style={[styles.clauseHeading, { color: theme.colors.text }]}>
          {section.heading}.{' '}
          <Text style={[styles.clauseBody, { color: theme.colors.textSecondary }]}>
            {section.body}
          </Text>
        </Text>
      </View>
    );
  });
}

export default function LegalScreen() {
  const { theme } = useTheme();
  const [activeDoc, setActiveDoc] = useState<DocKey | null>(null);

  const doc = activeDoc ? DOCS.find(d => d.key === activeDoc) : null;

  if (doc) {
    return (
      <ThemedView plain secondary style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setActiveDoc(null)} style={styles.backRow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
            <ThemedText style={styles.backLabel}>Legal & Privacy</ThemedText>
          </TouchableOpacity>

          <View style={[styles.docHeader, { borderBottomColor: theme.colors.border }]}>
            <ThemedText style={styles.docTitle}>{doc.title}</ThemedText>
            <ThemedText secondary style={styles.docUpdated}>{doc.updated}</ThemedText>
          </View>

          {renderDocContent(doc.sections, theme)}

          <View style={{ height: 60 }} />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView plain secondary style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          <ThemedText style={styles.backLabel}>Profile</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.title}>Legal & Privacy</ThemedText>
        <ThemedText secondary style={styles.subtitle}>
          Review our policies and understand how we handle your data.
        </ThemedText>

        <View style={[styles.menuCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          {DOCS.map((d, i) => (
            <React.Fragment key={d.key}>
              <TouchableOpacity
                style={styles.docRow}
                onPress={() => setActiveDoc(d.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.docIconWrap, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
                  <Ionicons name={d.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.docRowTitle}>{d.title}</ThemedText>
                  <ThemedText secondary style={styles.docRowSub}>{d.updated}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              {i < DOCS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.border, marginLeft: 62 }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <ThemedText secondary style={styles.footNote}>
          Questions about your data?{' '}
          <ThemedText
            style={[styles.footNoteLink, { color: theme.colors.primary }]}
            onPress={() => Linking.openURL('mailto:privacy@yourapp.com')}
          >
            Contact our privacy team
          </ThemedText>
          .
        </ThemedText>

        <View style={{ height: 60 }} />
      </ScrollView>
    </ThemedView>
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
  menuCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 20,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docRowTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  docRowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footNote: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  footNoteLink: {
    fontWeight: '500',
  },
  // Doc view
  docHeader: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  docUpdated: {
    fontSize: 13,
  },
  docBody: {
    fontSize: 15,
    lineHeight: 26,
  },
  docIntro: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  clauseBlock: {
    marginBottom: 16,
  },
  clauseHeading: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
  },
  clauseBody: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
  },
});