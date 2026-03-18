import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useTheme } from '@/theme/theme'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

type WishlistItem = {
  id: string
  title: string
  count: number
  coverImage: any
}

// ─── Mock data (replace with real data source) ────────────────────────────────

const WISHLISTS: WishlistItem[] = [
  { id: 'all', title: 'All favourites', count: 12, coverImage: require('@/assets/images/image.png') },
  { id: 'homes', title: 'My Saved Homes', count: 5, coverImage: require('@/assets/images/living-room.jpg') },
  { id: 'exp', title: 'My Saved Experiences', count: 7, coverImage: require('@/assets/images/image3.jpg') },
]

const USER_LISTS: WishlistItem[] = [
  { id: 'jenn', title: 'Jenn', count: 3, coverImage: require('@/assets/images/image.png') },
  { id: 'miss', title: 'Mississippi', count: 6, coverImage: require('@/assets/images/living-room.jpg') },
]

const { width } = Dimensions.get('screen')

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlaylistScreen() {
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'

  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [userLists, setUserLists] = useState<WishlistItem[]>(USER_LISTS)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDone = () => {
    setIsEditing(false)
    setSelectedIds(new Set())
  }

  const handleDelete = () => {
    if (selectedIds.size === 0) return
    Alert.alert(
      `Delete ${selectedIds.size} list${selectedIds.size > 1 ? 's' : ''}?`,
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUserLists(prev => prev.filter(l => !selectedIds.has(l.id)))
            setSelectedIds(new Set())
            setIsEditing(false)
          },
        },
      ]
    )
  }

  const handleCreateList = () => {
    Alert.prompt(
      'New list',
      'Give your list a name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name:any) => {
            if (!name?.trim()) return
            const newList: WishlistItem = {
              id: Date.now().toString(),
              title: name.trim(),
              count: 0,
              coverImage: require('@/assets/images/image.png'),
            }
            setUserLists(prev => [...prev, newList])
          },
        },
      ],
      'plain-text'
    )
  }

  return (
    <ThemedView style={styles.root}>

      {/* ── Nav bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <ThemedText style={styles.navTitle}>Wishlists</ThemedText>

        <TouchableOpacity
          onPress={isEditing ? handleDone : () => setIsEditing(true)}
          style={[styles.editBtn, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}
          activeOpacity={0.75}
        >
          <ThemedText style={[styles.editBtnText, { color: isEditing ? theme.colors.primary : theme.colors.text }]}>
            {isEditing ? 'Done' : 'Edit'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Default wishlists ── */}
        <Section label="Favourites">
          {WISHLISTS.map(item => (
            <WishlistRow
              key={item.id}
              item={item}
              isEditing={isEditing}
              isSelected={selectedIds.has(item.id)}
              onToggle={() => toggleSelect(item.id)}
              onPress={() => {/* navigate into list */}}
              theme={theme}
              selectable={false} // default lists can't be deleted
            />
          ))}
        </Section>

        {/* ── User lists ── */}
        <Section
          label="My Lists"
          action={
            !isEditing ? (
              <TouchableOpacity onPress={handleCreateList} style={styles.addBtn} activeOpacity={0.75}>
                <Ionicons name="add" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : null
          }
        >
          {userLists.length === 0 ? (
            <View style={[styles.emptyLists, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
              <ThemedText secondary style={styles.emptyListsText}>
                Tap + to create your first list
              </ThemedText>
            </View>
          ) : (
            userLists.map(item => (
              <WishlistRow
                key={item.id}
                item={item}
                isEditing={isEditing}
                isSelected={selectedIds.has(item.id)}
                onToggle={() => toggleSelect(item.id)}
                onPress={() => {/* navigate into list */}}
                theme={theme}
                selectable
              />
            ))
          )}
        </Section>
      </ScrollView>

      {/* ── Delete bar (editing + something selected) ── */}
      {isEditing && selectedIds.size > 0 && (
        <View style={[styles.deleteBar, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.deleteBarInner, { borderColor: theme.colors.border }]}>
            <ThemedText secondary style={styles.deleteBarCount}>
              {selectedIds.size} selected
            </ThemedText>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBarBtn} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <ThemedText style={[styles.deleteBarBtnText, { color: theme.colors.error }]}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  label,
  children,
  action,
}: {
  label: string
  children: React.ReactNode
  action?: React.ReactNode | null
}) {
  return (
    <View style={sectionStyles.root}>
      <View style={sectionStyles.header}>
        <ThemedText style={sectionStyles.label}>{label}</ThemedText>
        {action}
      </View>
      {children}
    </View>
  )
}

const sectionStyles = StyleSheet.create({
  root: { marginBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    opacity: 0.55,
  },
})

// ─── WishlistRow ──────────────────────────────────────────────────────────────

function WishlistRow({
  item,
  isEditing,
  isSelected,
  onToggle,
  onPress,
  theme,
  selectable,
}: {
  item: WishlistItem
  isEditing: boolean
  isSelected: boolean
  onToggle: () => void
  onPress: () => void
  theme: any
  selectable: boolean
}) {
  return (
    <Pressable
      onPress={isEditing && selectable ? onToggle : onPress}
      style={({ pressed }) => [
        rowStyles.root,
        { backgroundColor: theme.colors.background },
        pressed && { opacity: 0.75 },
      ]}
    >
      {/* Cover image */}
      <Image source={item.coverImage} style={rowStyles.cover} contentFit="cover" />

      {/* Text */}
      <View style={rowStyles.text}>
        <ThemedText style={rowStyles.title} numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText secondary style={rowStyles.count}>
          {item.count} {item.count === 1 ? 'item' : 'items'}
        </ThemedText>
      </View>

      {/* Right side */}
      {isEditing && selectable ? (
        <View style={[
          rowStyles.checkbox,
          isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          !isSelected && { borderColor: theme.colors.border },
        ]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      )}
    </Pressable>
  )
}

const rowStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  count: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  addBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLists: {
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyListsText: {
    fontSize: 14,
  },
  deleteBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  deleteBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  deleteBarCount: {
    fontSize: 14,
  },
  deleteBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBarBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
})