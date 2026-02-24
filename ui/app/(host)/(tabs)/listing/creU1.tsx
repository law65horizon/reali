// screens/host/CreateUnitsStep1.tsx

import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type CreationMethod = 'single' | 'batch' | 'multi-floor';

export default function CreateUnitsStep1() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const roomTypeId = params.roomTypeId as string;

  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);

  const creationMethods = [
    {
      id: 'single' as CreationMethod,
      icon: 'add-circle',
      title: 'Single Unit',
      description: 'Add one room unit at a time with custom or auto-generated code',
      recommended: false,
    },
    {
      id: 'batch' as CreationMethod,
      icon: 'duplicate',
      title: 'Batch Creation',
      description: 'Add multiple units on the same floor at once',
      recommended: true,
    },
    {
      id: 'multi-floor' as CreationMethod,
      icon: 'layers',
      title: 'Multi-Floor Setup',
      description: 'Configure units across multiple floors in one go',
      recommended: false,
    },
  ];

  const handleNext = () => {
    if (!selectedMethod) return;

    router.push({
      pathname: '/listing/creU2',
      params: {
        roomTypeId,
        method: selectedMethod,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerStep, { color: theme.colors.textSecondary }]}>
            Step 1 of 2
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Choose Creation Method
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '50%' }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Select how you'd like to add room units. You can always add more units later.
        </Text>

        {creationMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { backgroundColor: theme.colors.card },
              selectedMethod === method.id && {
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedMethod(method.id)}
            activeOpacity={0.7}
          >
            <View style={styles.methodHeader}>
              <View style={[
                styles.methodIconContainer,
                { backgroundColor: selectedMethod === method.id ? theme.colors.primary : theme.colors.backgroundSec }
              ]}>
                <Ionicons
                  name={method.icon as any}
                  size={28}
                  color={selectedMethod === method.id ? '#FFFFFF' : theme.colors.primary}
                />
              </View>

              {method.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.success }]}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.methodTitle,
                { color: theme.colors.text },
                selectedMethod === method.id && { color: theme.colors.primary, fontWeight: '700' },
              ]}
            >
              {method.title}
            </Text>

            <Text style={[styles.methodDescription, { color: theme.colors.textSecondary }]}>
              {method.description}
            </Text>

            {selectedMethod === method.id && (
              <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            <Text style={{ fontWeight: '700' }}>Unit codes</Text> can be automatically generated in the format: floor number + sequential room number (e.g., 101, 102, 201, 202), or you can create custom codes.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.colors.primary },
            !selectedMethod && { opacity: 0.5 },
          ]}
          onPress={handleNext}
          disabled={!selectedMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerStep: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressContainer: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  methodCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  methodTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});