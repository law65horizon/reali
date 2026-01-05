import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { ThemedText } from '../ThemedText';

// ==================== Type Definitions ====================
interface BaseStateProps {
  title?: string;
  message?: string;
  style?: ViewStyle;
  testID?: string;
}

interface ErrorStateProps extends BaseStateProps {
  onRetry?: () => void;
  retryText?: string;
  errorType?: 'network' | 'server' | 'generic';
}

interface EmptyStateProps extends BaseStateProps {
  onAction?: () => void;
  actionText?: string;
  searchQuery?: string;
}

interface OfflineStateProps extends BaseStateProps {
  onRetry?: () => void;
  retryText?: string;
}

// ==================== Error State Component ====================
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryText = 'Try Again',
  errorType = 'generic',
  style,
  testID = 'error-state',
}) => {
  const {theme} = useTheme()
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return 'cloud-offline-outline';
      case 'server':
        return 'server-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const defaultTitle = title || 'Something Went Wrong';
  const defaultMessage =
    message ||
    'We encountered an error while loading your properties. Please try again.';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={getErrorIcon() as any}
          size={64}
          color="#EF4444"
          accessibilityLabel="Error icon"
        />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {defaultTitle}
      </Text>

      <Text style={styles.message}>{defaultMessage}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.primaryButton, {backgroundColor: theme.colors.text}]}
          onPress={onRetry}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={retryText}
          testID={`${testID}-retry-button`}
        >
          <ThemedText style={[styles.primaryButtonText, {color: theme.colors.background}]}>{retryText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ==================== Empty State Component ====================
export const EmptySearchState: React.FC<EmptyStateProps> = ({
  title,
  message,
  onAction,
  actionText = 'Clear Filters',
  searchQuery,
  style,
  testID = 'empty-search-state',
}) => {
  const defaultTitle = title || 'No Properties Found';
  const defaultMessage =
    message ||
    (searchQuery
      ? `We couldn't find any properties matching "${searchQuery}". Try adjusting your search criteria.`
      : 'No properties match your current filters. Try broadening your search.');

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="search-outline"
          size={64}
          color="#9CA3AF"
          accessibilityLabel="Empty search icon"
        />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {defaultTitle}
      </Text>

      <Text style={styles.message}>{defaultMessage}</Text>

      {onAction && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onAction}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionText}
          testID={`${testID}-action-button`}
        >
          <Text style={styles.secondaryButtonText}>{actionText}</Text>
        </TouchableOpacity>
        // <TouchableOpacity
        //   style={[styles.secondaryButton, {backgroundColor: theme.colors.text}]}
        //   onPress={onAction}
        //   activeOpacity={0.7}
        //   accessibilityRole="button"
        //   accessibilityLabel={actionText}
        //   testID={`${testID}-action-button`}
        // >
        //   <ThemedText style={[styles.secondaryButtonText, {color: theme.colors.background}]}>{actionText}</ThemedText>
        // </TouchableOpacity>
      )}

      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Suggestions:</Text>
        <Text style={styles.suggestionItem}>• Check your spelling</Text>
        <Text style={styles.suggestionItem}>• Try more general keywords</Text>
        <Text style={styles.suggestionItem}>• Remove some filters</Text>
        <Text style={styles.suggestionItem}>• Expand your location radius</Text>
      </View>
    </View>
  );
};

// ==================== Offline State Component ====================
export const OfflineState: React.FC<OfflineStateProps> = ({
  title,
  message,
  onRetry,
  retryText = 'Retry Connection',
  style,
  testID = 'offline-state',
}) => {
  const defaultTitle = title || 'No Internet Connection';
  const defaultMessage =
    message ||
    'Please check your internet connection and try again. Some features may be unavailable offline.';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="wifi-outline"
          size={64}
          color="#F59E0B"
          accessibilityLabel="Offline icon"
        />
        <View style={styles.offlineBadge}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {defaultTitle}
      </Text>

      <Text style={styles.message}>{defaultMessage}</Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onRetry}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={retryText}
          testID={`${testID}-retry-button`}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.primaryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.offlineInfoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
        <Text style={styles.offlineInfoText}>
          Cached properties may still be available
        </Text>
      </View>
    </View>
  );
};

// ==================== Styles ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 400,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
    maxWidth: 400,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  suggestionItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  offlineInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  offlineInfoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
});

// ==================== Usage Examples ====================
/*
// Error State Usage:
<ErrorState
  errorType="network"
  onRetry={() => refetch()}
  title="Connection Failed"
  message="Unable to load properties. Check your connection."
/>

// Empty Search State Usage:
<EmptySearchState
  searchQuery="beach house miami"
  onAction={() => clearFilters()}
  actionText="Reset Search"
/>

// Offline State Usage:
<OfflineState
  onRetry={() => checkConnection()}
/>
*/