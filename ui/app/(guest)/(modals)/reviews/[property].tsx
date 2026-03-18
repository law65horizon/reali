import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/theme/theme'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const { width } = Dimensions.get('screen')

// ─── Accurate mock data ───────────────────────────────────────────────────────
// Mirrors the DB schema: reviews join users, tied to a room_type + property.
// avatar is a placeholder initials-based avatar (no local asset dependency).

type Review = {
  id: string
  guest: {
    name: string
    location: string        // city, country from users.address
    memberSince: string     // derived from users.created_at
    initials: string
    avatarColor: string
  }
  rating: number            // 1–5, maps to reviews.rating
  createdAt: string         // reviews.created_at display string
  comment: string           // reviews.comment
  hostResponse?: {
    body: string
    respondedAt: string
    hostName: string
    hostInitials: string
  }
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    guest: {
      name: 'Amara Osei',
      location: 'Accra, Ghana',
      memberSince: 'Member since 2021',
      initials: 'AO',
      avatarColor: '#4ECDC4',
    },
    rating: 5,
    createdAt: '2 weeks ago',
    comment:
      'Absolutely stunning property. The host was incredibly responsive and the space was spotless on arrival. The views from the terrace are exactly as shown — arguably better in person. Would book again without hesitation.',
    hostResponse: {
      body: 'Thank you so much, Amara! It was a pleasure hosting you. You were a wonderful guest and we hope to welcome you back soon.',
      respondedAt: '10 days ago',
      hostName: 'Taiwo',
      hostInitials: 'TK',
    },
  },
  {
    id: 'r2',
    guest: {
      name: 'Marcus Bielfeld',
      location: 'Munich, Germany',
      memberSince: 'Member since 2019',
      initials: 'MB',
      avatarColor: '#FF6B6B',
    },
    rating: 4,
    createdAt: '1 month ago',
    comment:
      'Great location and well-equipped kitchen. The only minor issue was that the Wi-Fi was a bit slow for remote work, but the host was quick to acknowledge and apologise. Everything else was excellent — very clean and exactly as described.',
  },
  {
    id: 'r3',
    guest: {
      name: 'Priya Nair',
      location: 'Bangalore, India',
      memberSince: 'Member since 2022',
      initials: 'PN',
      avatarColor: '#A78BFA',
    },
    rating: 5,
    createdAt: '1 month ago',
    comment:
      'This was a perfect stay for our anniversary trip. The space felt genuinely luxurious without being cold. The host left a lovely welcome basket and the check-in process was seamless. Highly recommend to anyone looking for a special experience.',
    hostResponse: {
      body: 'Happy anniversary, Priya! Thank you for choosing us for such a special occasion — that truly means a lot. Wishing you both many more happy years together.',
      respondedAt: '3 weeks ago',
      hostName: 'Taiwo',
      hostInitials: 'TK',
    },
  },
  {
    id: 'r4',
    guest: {
      name: 'Lena Johansson',
      location: 'Stockholm, Sweden',
      memberSince: 'Member since 2020',
      initials: 'LJ',
      avatarColor: '#34D399',
    },
    rating: 4,
    createdAt: '2 months ago',
    comment:
      'Lovely apartment in a fantastic neighbourhood. Walking distance to the main market and great local restaurants nearby. The bed was very comfortable and the natural light throughout the day was a real plus. Would stay here again.',
  },
  {
    id: 'r5',
    guest: {
      name: 'Chidi Eze',
      location: 'Lagos, Nigeria',
      memberSince: 'Member since 2023',
      initials: 'CE',
      avatarColor: '#F59E0B',
    },
    rating: 3,
    createdAt: '3 months ago',
    comment:
      'Decent stay overall. The photos are accurate and the location is convenient. A few things could use attention — the shower pressure was low and one of the bedside lamps wasn\'t working. Host was polite when I raised it. Might come back if improvements are made.',
    hostResponse: {
      body: "Thanks for the feedback, Chidi. You're right, and I'm embarrassed those issues weren't caught beforehand. Both have since been fixed. Appreciate your patience.",
      respondedAt: '2 months ago',
      hostName: 'Taiwo',
      hostInitials: 'TK',
    },
  },
  {
    id: 'r6',
    guest: {
      name: 'Yuki Tanaka',
      location: 'Osaka, Japan',
      memberSince: 'Member since 2018',
      initials: 'YT',
      avatarColor: '#60A5FA',
    },
    rating: 5,
    createdAt: '4 months ago',
    comment:
      'One of the best Airbnb-style stays I have had anywhere in the world. The attention to detail is remarkable — from the curated local guide left by the host, to the high-quality linens. I travel frequently for work and this is the standard I now judge everything else against.',
  },
]

// ─── Rating summary (derived from mock data) ──────────────────────────────────

const AVG_RATING =
  Math.round(
    (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length) * 10
  ) / 10

const RATING_DIST = [5, 4, 3, 2, 1].map(star => ({
  star,
  count: MOCK_REVIEWS.filter(r => r.rating === star).length,
  pct: MOCK_REVIEWS.filter(r => r.rating === star).length / MOCK_REVIEWS.length,
}))

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewsScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(4)

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const visibleReviews = MOCK_REVIEWS.slice(0, visibleCount)
  const hasMore = visibleCount < MOCK_REVIEWS.length

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Close button — fixed above scroll */}
      <View style={{flexDirection: 'row', paddingTop: 20, paddingHorizontal: 20, flex: 1, justifyContent:'space-between', alignItems:'flex-start'}}>
        <ThemedText type='subtitle' style={{textTransform:'capitalize', flex:1 }}>room in greater london</ThemedText>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeBtn]}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={30} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleReviews}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        // ── Summary header ────────────────────────────────────────────────
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Title */}
            <ThemedText style={styles.pageTitle}>
              {MOCK_REVIEWS.length} guest reviews
            </ThemedText>

            {/* Score + distribution */}
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
              <View style={styles.scoreBlock}>
                <ThemedText style={[styles.scoreNumber, { color: theme.colors.primary }]}>
                  {AVG_RATING}
                </ThemedText>
                <StarRow rating={AVG_RATING} size={18} color={theme.colors.primary} />
                <ThemedText secondary style={styles.scoreLabel}>
                  out of 5
                </ThemedText>
              </View>

              <View style={styles.distBlock}>
                {RATING_DIST.map(({ star, count, pct }) => (
                  <View key={star} style={styles.distRow}>
                    <ThemedText secondary style={styles.distStar}>{star}</ThemedText>
                    <Ionicons name="star" size={11} color={theme.colors.primary} />
                    <View style={[styles.distTrack, { backgroundColor: theme.colors.border }]}>
                      <View
                        style={[
                          styles.distFill,
                          { width: `${pct * 100}%` as any, backgroundColor: theme.colors.primary },
                        ]}
                      />
                    </View>
                    <ThemedText secondary style={styles.distCount}>{count}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        }

        // ── Each review ───────────────────────────────────────────────────
        renderItem={({ item }) => (
          <ReviewItem
            review={item}
            expanded={expanded.has(item.id)}
            onToggle={() => toggleExpand(item.id)}
            theme={theme}
          />
        )}

        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}

        // ── Load more ─────────────────────────────────────────────────────
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              onPress={() => setVisibleCount(c => c + 4)}
              style={[styles.loadMoreBtn, { borderColor: theme.colors.border }]}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.loadMoreText}>Show more reviews</ThemedText>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.allShown}>
              <ThemedText secondary style={styles.allShownText}>All reviews shown</ThemedText>
            </View>
          )
        }
        ListFooterComponentStyle={{ marginTop: 8, marginBottom: 40 }}
      />
    </View>
  )
}

// ─── Review item ──────────────────────────────────────────────────────────────

function ReviewItem({
  review,
  expanded,
  onToggle,
  theme,
}: {
  review: Review
  expanded: boolean
  onToggle: () => void
  theme: any
}) {
  const TRUNCATE_LIMIT = 180
  const isLong = review.comment.length > TRUNCATE_LIMIT
  const displayedText =
    isLong && !expanded
      ? review.comment.slice(0, TRUNCATE_LIMIT).trimEnd() + '…'
      : review.comment

  return (
    <View style={styles.reviewItem}>
      {/* Guest row */}
      <View style={styles.guestRow}>
        <InitialsAvatar
          initials={review.guest.initials}
          color={review.guest.avatarColor}
          size={46}
        />
        <View style={styles.guestInfo}>
          <ThemedText style={styles.guestName}>{review.guest.name}</ThemedText>
          <ThemedText secondary style={styles.guestMeta}>
            {review.guest.location} · {review.guest.memberSince}
          </ThemedText>
        </View>
      </View>

      {/* Rating + date */}
      <View style={styles.ratingRow}>
        <StarRow rating={review.rating} size={13} color={theme.colors.primary} />
        <View style={styles.ratingDot} />
        <ThemedText secondary style={styles.reviewDate}>{review.createdAt}</ThemedText>
      </View>

      {/* Comment */}
      <ThemedText style={styles.commentText}>{displayedText}</ThemedText>
      {isLong && (
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <ThemedText style={[styles.readMore, { color: theme.colors.primary }]}>
            {expanded ? 'Show less' : 'Read more'}
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Host response */}
      {review.hostResponse && (
        <View style={[styles.responseCard, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
          <View style={styles.responseHeader}>
            <InitialsAvatar
              initials={review.hostResponse.hostInitials}
              color={theme.colors.primary}
              size={28}
            />
            <ThemedText style={styles.responseHostName}>
              Response from {review.hostResponse.hostName}
            </ThemedText>
            <ThemedText secondary style={styles.responseDate}>
              {review.hostResponse.respondedAt}
            </ThemedText>
          </View>
          <ThemedText secondary style={styles.responseBody}>
            {review.hostResponse.body}
          </ThemedText>
        </View>
      )}
    </View>
  )
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({ rating, size, color }: { rating: number; size: number; color: string }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={color}
        />
      ))}
    </View>
  )
}

// ─── Initials avatar ──────────────────────────────────────────────────────────

function InitialsAvatar({
  initials,
  color,
  size,
}: {
  initials: string
  color: string
  size: number
}) {
  // Derive a readable text color (dark text on light bg, light on dark)
  const textColor = '#fff'
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36, color: textColor }]}>
        {initials}
      </Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    // paddingTop: 60,
  },

  // Header
  header: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    marginBottom: 20,
  },

  // Summary card
  summaryCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 20,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(128,128,128,0.25)',
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 12,
  },
  distBlock: {
    flex: 1,
    gap: 7,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  distStar: {
    fontSize: 12,
    width: 10,
    textAlign: 'right',
  },
  distTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 3,
  },
  distCount: {
    fontSize: 11,
    width: 14,
    textAlign: 'right',
  },

  // Review item
  reviewItem: {
    paddingVertical: 22,
    gap: 10,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestInfo: {
    flex: 1,
    gap: 2,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '700',
  },
  guestMeta: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  reviewDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  // Host response
  responseCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    gap: 10,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  responseHostName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  responseDate: {
    fontSize: 11,
  },
  responseBody: {
    fontSize: 13,
    lineHeight: 20,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
  },

  // Load more
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  allShown: {
    alignItems: 'center',
    marginTop: 24,
  },
  allShownText: {
    fontSize: 13,
  },

  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
})