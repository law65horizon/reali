import DraggableModal from '@/components/DraggableModal'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PropertyCard from '@/components/ui/PropertyCard'
import { useFavoritesStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/theme/theme'
import { gql, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

const GET_ROOM_TYPES = gql`
  query GetRoomTypes($ids: [ID!]) {
    getRoomTypes(ids: $ids) {
      edges {
        node {
          amenities
          name
          id
          capacity
          bed_count
          bathroom_count
          size_sqft
          base_price
          currency
          property {
            id
            property_type
            address_id
            address {
              city
              country
            }
            images {
              cdn_url
              id
            }
          }
        }
      }
    }
  }
`

type SortOption = 'Recent' | 'Oldest' | 'Price (low)' | 'Price (high)'
type TypeFilter = 'all' | 'properties' | 'experiences'

const SORT_OPTIONS: SortOption[] = ['Recent', 'Oldest', 'Price (low)', 'Price (high)']

const { width, height } = Dimensions.get('screen')

export default function SavedTab() {
  const { theme } = useTheme()
  const { user } = useAuthStore()
  const isDark = theme.mode === 'dark'

  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('Recent')
  // Track if any filter is active for the badge
  const hasActiveFilter = typeFilter !== 'all' || sortBy !== 'Recent'

  const favoriteIds = useFavoritesStore(state => state.favoriteIds)
  const ids: string[] = Array.from(favoriteIds)

  const { data, loading, error } = useQuery(GET_ROOM_TYPES, {
    variables: { ids },
    skip: ids.length === 0 || !user,
  })

  const rawRoomTypes = data?.getRoomTypes.edges.map((edge: any) => edge.node) ?? []

  // Apply filter + sort without mutating source
  const roomTypes = useMemo(() => {
    let filtered = [...rawRoomTypes].reverse()

    if (typeFilter === 'properties') {
      filtered = filtered.filter((r: any) => r.property?.property_type !== 'experience')
    } else if (typeFilter === 'experiences') {
      filtered = filtered.filter((r: any) => r.property?.property_type === 'experience')
    }

    switch (sortBy) {
      case 'Oldest':
        filtered.reverse()
        break
      case 'Price (low)':
        filtered.sort((a: any, b: any) => (a.base_price ?? 0) - (b.base_price ?? 0))
        break
      case 'Price (high)':
        filtered.sort((a: any, b: any) => (b.base_price ?? 0) - (a.base_price ?? 0))
        break
      default:
        break
    }

    return filtered
  }, [rawRoomTypes, typeFilter, sortBy])

  const resetFilters = () => {
    setTypeFilter('all')
    setSortBy('Recent')
  }

  const renderItem = useCallback(
    ({ item }: any) => <PropertyCard property={item} />,
    []
  )

  const keyExtractor = useCallback((item: any) => item.id, [])

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ThemedView style={styles.root}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Saved</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
            <Ionicons name="bookmark-outline" size={36} color={theme.colors.textSecondary} />
          </View>
          <ThemedText style={styles.emptyHeading}>Nothing saved yet</ThemedText>
          <ThemedText secondary style={styles.emptyBody}>
            Log in to save properties and experiences you love — they'll all be here.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(guest)/(auth)/auth_page')}
            style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.authButtonText}>Log in or sign up</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ThemedView style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    )
  }

  console.log({error, ids})

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <ThemedView style={[styles.root, styles.centered]}>
        <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.textSecondary} />
        <ThemedText secondary style={{ marginTop: 12, textAlign: 'center' }}>
          Couldn't load your saved items. Pull to retry.
        </ThemedText>
      </ThemedView>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Saved</ThemedText>

        <View style={styles.headerActions}>
          {/* Wishlists / playlists */}
          <TouchableOpacity
            onPress={() => router.push('/wishlists/playlist')}
            style={[styles.iconBtn, { backgroundColor: theme.colors.background2 }]}
            activeOpacity={0.75}
          >
            <Ionicons name="folder-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Filter */}
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={[styles.iconBtn, { backgroundColor: theme.colors.background2 }]}
            activeOpacity={0.75}
          >
            <Ionicons name="options-outline" size={22} color={theme.colors.text} />
            {hasActiveFilter && (
              <View style={[styles.filterDot, { backgroundColor: theme.colors.accent }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Active filter chips ── */}
      {hasActiveFilter && (
        <View style={styles.chipRow}>
          {typeFilter !== 'all' && (
            <Chip
              label={typeFilter === 'properties' ? 'Properties' : 'Experiences'}
              onRemove={() => setTypeFilter('all')}
              theme={theme}
            />
          )}
          {sortBy !== 'Recent' && (
            <Chip label={sortBy} onRemove={() => setSortBy('Recent')} theme={theme} />
          )}
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={roomTypes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          roomTypes.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
              <Ionicons name="heart-outline" size={36} color={theme.colors.textSecondary} />
            </View>
            <ThemedText style={styles.emptyHeading}>
              {hasActiveFilter ? 'No matches' : 'Start saving'}
            </ThemedText>
            <ThemedText secondary style={styles.emptyBody}>
              {hasActiveFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Tap the heart on any listing to save it here.'}
            </ThemedText>
            {hasActiveFilter && (
              <TouchableOpacity
                onPress={resetFilters}
                style={[styles.authButton, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}
                activeOpacity={0.8}
              >
                <ThemedText style={{ color: theme.colors.text, fontWeight: '600' }}>
                  Clear filters
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* ── Filter modal ── */}
      <DraggableModal
        isVisible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        height={height * 0.65}
      >
        <FilterSheet
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={resetFilters}
          onDone={() => setFilterModalVisible(false)}
          theme={theme}
        />
      </DraggableModal>
    </ThemedView>
  )
}

// ─── Filter sheet ─────────────────────────────────────────────────────────────

function FilterSheet({
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  onReset,
  onDone,
  theme,
}: {
  typeFilter: TypeFilter
  setTypeFilter: (v: TypeFilter) => void
  sortBy: SortOption
  setSortBy: (v: SortOption) => void
  onReset: () => void
  onDone: () => void
  theme: any
}) {
  return (
    <View style={filterStyles.sheet}>
      {/* Title row */}
      <View style={filterStyles.titleRow}>
        <ThemedText style={filterStyles.sheetTitle}>Filter & Sort</ThemedText>
        <TouchableOpacity onPress={onReset} style={filterStyles.resetBtn} activeOpacity={0.75}>
          <Ionicons name="refresh" size={16} color={theme.colors.textSecondary} />
          <ThemedText secondary style={filterStyles.resetLabel}>Reset</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Type filter */}
      <ThemedText secondary style={filterStyles.sectionLabel}>TYPE</ThemedText>
      <View style={filterStyles.typeRow}>
        {(['all', 'properties', 'experiences'] as TypeFilter[]).map(t => {
          const active = typeFilter === t
          const label = t === 'all' ? 'All' : t === 'properties' ? 'Properties' : 'Experiences'
          const icon = t === 'all' ? 'apps-outline' : t === 'properties' ? 'home-outline' : 'sparkles-outline'
          return (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[
                filterStyles.typeChip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.backgroundSec ?? '#f4f4f4',
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Ionicons name={icon as any} size={18} color={active ? '#fff' : theme.colors.text} />
              <ThemedText
                style={[filterStyles.typeChipLabel, { color: active ? '#fff' : theme.colors.text }]}
              >
                {label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>

      {/* Sort */}
      <ThemedText secondary style={[filterStyles.sectionLabel, { marginTop: 24 }]}>SORT BY</ThemedText>
      <View style={[filterStyles.sortList, { borderColor: theme.colors.border }]}>
        {SORT_OPTIONS.map((opt, i) => {
          const active = sortBy === opt
          return (
            <React.Fragment key={opt}>
              <TouchableOpacity
                onPress={() => setSortBy(opt)}
                style={filterStyles.sortRow}
                activeOpacity={0.75}
              >
                <ThemedText style={[filterStyles.sortLabel, active && { color: theme.colors.primary, fontWeight: '600' }]}>
                  {opt}
                </ThemedText>
                {active && (
                  <View style={[filterStyles.sortCheck, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              {i < SORT_OPTIONS.length - 1 && (
                <View style={[filterStyles.sortDivider, { backgroundColor: theme.colors.border }]} />
              )}
            </React.Fragment>
          )
        })}
      </View>

      {/* Done */}
      <TouchableOpacity
        onPress={onDone}
        style={[filterStyles.doneBtn, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.85}
      >
        <ThemedText style={filterStyles.doneBtnText}>Show results</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove, theme }: { label: string; onRemove: () => void; theme: any }) {
  return (
    <TouchableOpacity
      onPress={onRemove}
      style={[styles.chip, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4', borderColor: theme.colors.border }]}
      activeOpacity={0.8}
    >
      <ThemedText style={styles.chipLabel}>{label}</ThemedText>
      <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  listEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 60,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  authButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})

const filterStyles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetLabel: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  typeChipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortList: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortLabel: {
    fontSize: 15,
  },
  sortCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  doneBtn: {
    marginTop: 28,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})