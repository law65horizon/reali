// components/bookings/SearchFilterModal.tsx
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface SearchFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  properties?: Array<{ id: string; title: string }>;
  initialFilters?: FilterState;
}

export interface FilterState {
  searchQuery: string;
  propertyId: string | null;
  status: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'date' | 'price' | 'guest' | 'property';
  sortOrder: 'asc' | 'desc';
  priceRange: {
    min: number;
    max: number;
  };
  guestType: 'all' | 'first_time' | 'repeated';
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: 'time', color: '#F59E0B' },
  { value: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle', color: '#10B981' },
  { value: 'active', label: 'Active', icon: 'home', color: '#4ECDC4' },
  { value: 'completed', label: 'Completed', icon: 'checkmark-done', color: '#6366F1' },
  { value: 'cancelled', label: 'Cancelled', icon: 'close-circle', color: '#EF4444' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date', icon: 'calendar' },
  { value: 'price', label: 'Price', icon: 'cash' },
  { value: 'guest', label: 'Guest Name', icon: 'person' },
  { value: 'property', label: 'Property', icon: 'business' },
];

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const GUEST_TYPES = [
  { value: 'all', label: 'All Guests', icon: 'people' },
  // { value: 'verified', label: 'Verified Only', icon: 'shield-checkmark' },
  { value: 'first_time', label: 'First Time', icon: 'star' },
  { value: 'repeated', label: 'Repeat Guests', icon: 'repeat' },
];

export default function SearchFilterModal({
  visible,
  onClose,
  onApply,
  properties = [],
  initialFilters,
}: SearchFilterModalProps) {
  const { theme } = useTheme();

  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      searchQuery: '',
      propertyId: null,
      status: [],
      dateRange: { start: null, end: null },
      sortBy: 'date',
      sortOrder: 'desc',
      priceRange: { min: 0, max: 10000 },
      guestType: 'all',
    }
  );

  const [activeTab, setActiveTab] = useState<'search' | 'filters' | 'sort'>('search');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('month');

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleDatePreset = (preset: string) => {
    setSelectedDatePreset(preset);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date();

    switch (preset) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        start = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        start = null;
        end = null;
        break;
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      propertyId: null,
      status: [],
      dateRange: { start: null, end: null },
      sortBy: 'date',
      sortOrder: 'desc',
      priceRange: { min: 0, max: 10000 },
      guestType: 'all',
    });
    setSelectedDatePreset('month');
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.propertyId) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.guestType !== 'all') count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Search & Filter
              </Text>
              {getActiveFiltersCount() > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabBar, { backgroundColor: theme.colors.backgroundSec }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'search' && {
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                },
              ]}
              onPress={() => setActiveTab('search')}
            >
              <Ionicons
                name="search"
                size={20}
                color={activeTab === 'search' ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'search' ? theme.colors.text : theme.colors.textSecondary,
                  },
                ]}
              >
                Search
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'filters' && {
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                },
              ]}
              onPress={() => setActiveTab('filters')}
            >
              <Ionicons
                name="filter"
                size={20}
                color={
                  activeTab === 'filters' ? theme.colors.primary : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'filters' ? theme.colors.text : theme.colors.textSecondary,
                  },
                ]}
              >
                Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sort' && {
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                },
              ]}
              onPress={() => setActiveTab('sort')}
            >
              <Ionicons
                name="swap-vertical"
                size={20}
                color={activeTab === 'sort' ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'sort' ? theme.colors.text : theme.colors.textSecondary,
                  },
                ]}
              >
                Sort
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* SEARCH TAB */}
            {activeTab === 'search' && (
              <View style={styles.tabContent}>
                {/* Search Input */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Search
                  </Text>
                  <View
                    style={[
                      styles.searchInput,
                      {
                        backgroundColor: theme.colors.backgroundInput,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.searchTextInput, { color: theme.colors.text }]}
                      placeholder="Guest name, booking ID, property..."
                      placeholderTextColor={theme.colors.textPlaceholder}
                      value={filters.searchQuery}
                      onChangeText={(text) =>
                        setFilters((prev) => ({ ...prev, searchQuery: text }))
                      }
                    />
                    {filters.searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                      >
                        <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                    Search by guest name, email, booking ID, or property name
                  </Text>
                </View>

                {/* Property Filter */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Property
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                  >
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            filters.propertyId === null
                              ? theme.colors.primary
                              : theme.colors.backgroundSec,
                        },
                      ]}
                      onPress={() => setFilters((prev) => ({ ...prev, propertyId: null }))}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              filters.propertyId === null
                                ? '#FFF'
                                : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        All Properties
                      </Text>
                    </TouchableOpacity>
                    {properties.map((property) => (
                      <TouchableOpacity
                        key={property.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              filters.propertyId === property.id
                                ? theme.colors.primary
                                : theme.colors.backgroundSec,
                          },
                        ]}
                        onPress={() =>
                          setFilters((prev) => ({ ...prev, propertyId: property.id }))
                        }
                      >
                        <Ionicons
                          name="business"
                          size={16}
                          color={
                            filters.propertyId === property.id
                              ? '#FFF'
                              : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                filters.propertyId === property.id
                                  ? '#FFF'
                                  : theme.colors.textSecondary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {property.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Quick Stats (Optional - show summary of search results) */}
                <View style={[styles.statsPreview, { backgroundColor: theme.colors.backgroundSec }]}>
                  <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
                    Use filters to narrow down your search results
                  </Text>
                </View>
              </View>
            )}

            {/* FILTERS TAB */}
            {activeTab === 'filters' && (
              <View style={styles.tabContent}>
                {/* Status Filter */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Booking Status
                  </Text>
                  <View style={styles.statusGrid}>
                    {STATUS_OPTIONS.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: filters.status.includes(status.value)
                              ? status.color + '20'
                              : theme.colors.backgroundSec,
                            borderColor: filters.status.includes(status.value)
                              ? status.color
                              : 'transparent',
                            borderWidth: filters.status.includes(status.value) ? 2 : 0,
                          },
                        ]}
                        onPress={() => handleStatusToggle(status.value)}
                      >
                        <Ionicons
                          name={status.icon as any}
                          size={20}
                          color={
                            filters.status.includes(status.value)
                              ? status.color
                              : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.statusChipText,
                            {
                              color: filters.status.includes(status.value)
                                ? status.color
                                : theme.colors.text,
                            },
                          ]}
                        >
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date Range */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Date Range
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                  >
                    {DATE_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.value}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              selectedDatePreset === preset.value
                                ? theme.colors.primary
                                : theme.colors.backgroundSec,
                          },
                        ]}
                        onPress={() => handleDatePreset(preset.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                selectedDatePreset === preset.value
                                  ? '#FFF'
                                  : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Custom Date Range (if selected) */}
                  {selectedDatePreset === 'custom' && (
                    <View style={styles.customDateRange}>
                      <View
                        style={[
                          styles.datePickerButton,
                          {
                            backgroundColor: theme.colors.backgroundInput,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.colors.text }]}>
                          {filters.dateRange.start
                            ? filters.dateRange.start.toLocaleDateString()
                            : 'Start Date'}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
                      <View
                        style={[
                          styles.datePickerButton,
                          {
                            backgroundColor: theme.colors.backgroundInput,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.colors.text }]}>
                          {filters.dateRange.end
                            ? filters.dateRange.end.toLocaleDateString()
                            : 'End Date'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Guest Type */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Guest Type
                  </Text>
                  <View style={styles.guestTypeGrid}>
                    {GUEST_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.guestTypeChip,
                          {
                            backgroundColor:
                              filters.guestType === type.value
                                ? theme.colors.primary + '20'
                                : theme.colors.backgroundSec,
                            borderColor:
                              filters.guestType === type.value
                                ? theme.colors.primary
                                : 'transparent',
                            borderWidth: filters.guestType === type.value ? 2 : 0,
                          },
                        ]}
                        onPress={() => setFilters((prev) => ({ ...prev, guestType: type.value as any }))}
                      >
                        <Ionicons
                          name={type.icon as any}
                          size={20}
                          color={
                            filters.guestType === type.value
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.guestTypeText,
                            {
                              color:
                                filters.guestType === type.value
                                  ? theme.colors.primary
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Price Range
                  </Text>
                  <View style={styles.priceRangeInputs}>
                    <View style={styles.priceInputContainer}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        Min
                      </Text>
                      <View
                        style={[
                          styles.priceInput,
                          {
                            backgroundColor: theme.colors.backgroundInput,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
                          $
                        </Text>
                        <TextInput
                          style={[styles.priceTextInput, { color: theme.colors.text }]}
                          placeholder="0"
                          placeholderTextColor={theme.colors.textPlaceholder}
                          keyboardType="numeric"
                          value={filters.priceRange.min.toString()}
                          onChangeText={(text) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, min: parseInt(text) || 0 },
                            }))
                          }
                        />
                      </View>
                    </View>

                    <Text style={[styles.priceRangeSeparator, { color: theme.colors.textSecondary }]}>
                      to
                    </Text>

                    <View style={styles.priceInputContainer}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        Max
                      </Text>
                      <View
                        style={[
                          styles.priceInput,
                          {
                            backgroundColor: theme.colors.backgroundInput,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
                          $
                        </Text>
                        <TextInput
                          style={[styles.priceTextInput, { color: theme.colors.text }]}
                          placeholder="10000"
                          placeholderTextColor={theme.colors.textPlaceholder}
                          keyboardType="numeric"
                          value={filters.priceRange.max.toString()}
                          onChangeText={(text) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, max: parseInt(text) || 10000 },
                            }))
                          }
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* SORT TAB */}
            {activeTab === 'sort' && (
              <View style={styles.tabContent}>
                {/* Sort By */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sort By</Text>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor:
                            filters.sortBy === option.value
                              ? theme.colors.primary + '15'
                              : theme.colors.backgroundSec,
                        },
                      ]}
                      onPress={() => setFilters((prev) => ({ ...prev, sortBy: option.value as any }))}
                    >
                      <View style={styles.sortOptionLeft}>
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={
                            filters.sortBy === option.value
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.sortOptionText,
                            {
                              color:
                                filters.sortBy === option.value
                                  ? theme.colors.primary
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {filters.sortBy === option.value && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sort Order */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Sort Order
                  </Text>
                  <View style={styles.sortOrderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.sortOrderButton,
                        {
                          backgroundColor:
                            filters.sortOrder === 'desc'
                              ? theme.colors.primary
                              : theme.colors.backgroundSec,
                        },
                      ]}
                      onPress={() => setFilters((prev) => ({ ...prev, sortOrder: 'desc' }))}
                    >
                      <Ionicons
                        name="arrow-down"
                        size={20}
                        color={filters.sortOrder === 'desc' ? '#FFF' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.sortOrderText,
                          {
                            color:
                              filters.sortOrder === 'desc' ? '#FFF' : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        Descending (Newest First)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sortOrderButton,
                        {
                          backgroundColor:
                            filters.sortOrder === 'asc'
                              ? theme.colors.primary
                              : theme.colors.backgroundSec,
                        },
                      ]}
                      onPress={() => setFilters((prev) => ({ ...prev, sortOrder: 'asc' }))}
                    >
                      <Ionicons
                        name="arrow-up"
                        size={20}
                        color={filters.sortOrder === 'asc' ? '#FFF' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.sortOrderText,
                          {
                            color:
                              filters.sortOrder === 'asc' ? '#FFF' : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        Ascending (Oldest First)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.colors.backgroundSec }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.text} />
              <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
                Reset All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleApply}
            >
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={[styles.footerButtonText, { color: '#FFF' }]}>
                Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    margin: 16,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '47%',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customDateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  guestTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  guestTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '47%',
  },
  guestTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceRangeInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
    gap: 6,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  priceRangeSeparator: {
    fontSize: 14,
    paddingBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sortOrderContainer: {
    gap: 10,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sortOrderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  statsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButton: {
    flex: 2,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});