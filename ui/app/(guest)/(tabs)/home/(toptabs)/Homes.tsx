import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PropertyCard from '@/components/ui/PropertyCard'
import { usesearchRoomTypes } from '@/hooks/useSearchProp'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/theme/theme'
import { gql, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

const HOME_SCREEN_QUERY = gql`
  query HomeScreen($latitude: Float, $longitude: Float) {
    homeScreen(latitude: $latitude, longitude: $longitude) {
      featured {
        id
        name
        base_price
        currency
        bed_count
        bathroom_count
        avg_rating
        totalReviews
        availableUnits
        property {
          id
          property_type
          sale_status
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
      popularCities {
        id
        city
        country
        listingCount
        coverImageUrl
        latitude
        longitude
      }
    }
  }
`

const CATEGORY_ROOMS_QUERY = gql`
  query FeaturedRoomTypes($input: FeaturedRoomsInput) {
    featuredRoomTypes(input: $input) {
      id
      name
      base_price
      currency
      bed_count
      bathroom_count
      avg_rating
      totalReviews
      availableUnits
      images {
        cdn_url
        id
      }
      property {
        id
        property_type
        sale_status
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
`

const mock = [

]

const popularCities = [
  {
    id: 1,
    city: "Paris",
    country: "France",
    listingCount: 60000,
    coverImageUrl: "data:image/jpeg;base64,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",
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    id: 2,
    city: "London",
    country: "United Kingdom",
    listingCount: 50000,
    coverImageUrl: "data:image/jpeg;base64,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",
    latitude: 51.5074,
    longitude: -0.1278
  },
  {
    id: 3,
    city: "New York",
    country: "United States",
    listingCount: 70000,
    coverImageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAKEArAMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAABAwACBAUGB//EAEIQAAIBAgQCBgUKBQQBBQAAAAECEQADBBIhMUFRBRMiYYGxMlJxofAGFCNCYpGiwdHScoKSlOEzU8LxNCRUY3Sy/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAEDAgQF/8QAIhEAAgICAgIDAQEAAAAAAAAAAAECEQMhMUESURMiMgRh/9oADAMBAAIRAxEAPwD6qHxcf+dfH8tv9tUvXcYli41vF3rlwKSqZbepjQejxphJXdWBPv8AvqjWhq7XQQBsW/Kr/VHInOuTLaxnSd3FG21+9bsgkZ7ltAT3RlHnWzrcR2v/AF98wJgJbOn9NKyDRlYQI293jM61BbRVBYqCRPaB176Gooacn2XS9i3Ab57iAp2zJbH/ABpWLxHSFtJwt3E4hywlUW3Ee3L7B508qEJt3BB4SZ+41dbzWynpFWbLl5/BpSWrVDjLdNsTgj0ncsZ8RiL6udkCW1IHiu53jvp+THRpjL/sy2v21t8CPbSr9zqUzgFjsAOdQ823wi/gkttmMti10bGYgHlltftpGMv9IWrIaxib9xiwEZLenf6PxPcaoek8I9y84vdpGKNlVmy5QZG08KwsbLBb5xNxw83BnQkASA2ummoBGv510RiuzlnOSejsZ8UoGbpC9Ma9i2P+NAXcUdsdeI/ht/trm2vmZxaKt62WeXW21ojNBaeWo24Rl+674QObrLeDMwYaW9gfrb6kbT5VrxgLzydHR6zEhZOOxHglv9tc7F4/pJMWtmzdxLo2WLhtKQsmNYX2fEU23gYdbnXPoQwBXKI00jl2RWwmBQ4x6BTydgDYqP8Azb/9Nv8AbU6zFAScbeA55bf7aimTEE+ydKsVcOAuWDxnSsvwXJpOb4K9biDBXH3oOgOW3+ysFrG9LvftWne9bVoLuyJC6An6vhPPgY16yWbSWw14knjMj3CicMvVnKwHeBt4TU/kh6KqGSuTPnxf/vr39Nv9tTrMTxx1/wDpt/tp4wzet+Gq3MPc4En2VpSxsw45UVXFY23qHt31/wDkGVj/ADDT8NPTpNCPpMPiFbkLZf3rNIXDXhqMv3/4q/VXeKz3gik/B8MaeRcoKaDICQ25N1sxM7QP+qYzLbQnLbCtqO8+yvM3Plbhlw164uCxb27d11aYT0Ee4ezOoi223ERzju9G4ux0nhDiLSXBa667bC3BlcZHZDIOu6nfXnUdXs6KIb3ZhQqpxC8aqbbdV1jzlPM025abrctuYUTJEe+OVOWTbyCGBXTNt7Dp8cqq5pLRBQcv0Y7jh4C+iNtZ9pnhVrT21uhjsPsk0y8pS6rEhZAGQbCqVWKUo0SbcZF7l+SRbbKvDvpDAMGJOVjoDTBxoLtTjFRVIUpuTti2tYcjtWkmIMie79fvqrWrED6JPSnRePP/ADTycozVRUjMZ9Hta6Ttpz4TRaQtyAmHtsWdERMp34kmmtdS1FpBpbMwpEE/lxqq2rl+MhjL9Zp18KYLBf6QFD6wGm3lUW43tnRFSrSE4Z7t3MclxCXjQ8OPdvW21btAAoCe81S3FsCASDJK5duOmlOTqwukZY4bVBysuo0WPsiqFFzZjx03qocgxcZR7fzoi5ndlTLA40jVF9OHlUqga5wVCOLA790c6srIdBvSAJJgQJ7pjXhQXNlGYQ3ETOtC4RlYZiCOI1jwqguFmUSNjmI4UUA2pUYwT2eNVzqNyynkKQ0eXNj5TOzr1hNl4Cgm0GA6twwaBE5shESJn6ulaejz0xaxuIOMynCqLYw5uOpuD1g+URLaHSR7Nq9DUkfZ0M6+dbjLqjE13ZnW6bi54OmrToo4/HtrPeJaBBKzPa2jkBVsxuktchlk5QOA4e6g2q/WkkCAOHxNdMMdbOXJk6KBCFXMIPEba/lTNqWL9proRbqMxmAGGsTPkR4GgMVYyZhft5YB9IazEeY+8VaiFjD6Jo8KotxLq/R3AdtRtwq42EGaBkq9pfpA7gZeZ2HfVKaTcNpbaI3a3PCpZG1pFcUVz2eexXydW5dvi30h1SYi7de4FtSzZ3DxJbcFQJ5SO+sp+StgqLF/FMEUKhGTtlQwbLm9UwezzM8q9S1llH1aWA0hmjTaKmscXwyryyX6Rl6OwQ6HW5asOrpeuvelxqATMEyZjYHTQDQ1vs3YZmuTPorFZ8OMjsbqBhwjefg1qF1LmYhASu5MS3u7qTioqqscZub5oL3GS5lTJkY6k8DV+tm4B2cvDifupC4Yy6ggGc2u3LlTltlLZzKum+UVJ1Wiqvy2WZgEbKyg95865HTeFx+Pu4RcFjUsraLNdAlWeQBA3jQsQSDrlMV0b9k3RmKqABpOhPuo27wWc6QQcsgzHcT+VZs3RwsB0R05Yxli7c6QtPh7TTdsFrlzODbRCJbaCrvxzFuFejlG1aJ4zVoAiBGm1Q0CFOEeEQa75ljSmBTHaMnmKI2qFo0oAynEXZ7GX+kn2capcu5gNvAHeqkRrMsdxyFVKBRLEk8xXZGEOUcMpz4ZbtcMvj/3QMyJIG+06++gpBGk+MzRA1qqZJo5t9LGGY2AvZgH0o3ka8l7Rk8JpaXLCsQlkndSVJbYgAeZ/lrsRUiteRjxM+ETLYt9WSqsc2Q7idfzp3aj4/Wo428fKiV0rLZtIKK5IJCkDgePdWxe1rp4VWyPo0/gFFVgSphpM8jrXDkk5SPQxxUY6DdClMp5jzH6mqvZWd4/OrTm0IgcZoQwaJJ20NZUmuDTinyVNhMzZhGg48KVbtKLzg92/dO3308ZiW2WIERvx50q8jLDm5JBkHatKTemZcVHaL3UdYazEgnff2fHdUW/bZVGaC+kcKsLqFRBmeH+KVcS2JJQeI4xQkroG3+hi5jAYiBpp9bSoFW4raRnA1HnWNIIEAgd9asM0gpyH51qWJxRmGZSdEZmQfSAsPrFeNRLuYBgncAdJ9lXvOFUzudhzrNYLLfJaWnTuHKsKDas25xi6ZrUyJ561CBxkVnLMh0Y9WD2RG/f8RQGIeBoh7+dEYuXATko8ip9fVeBHD4++iIYmDJHCgo7NOwqr1jMeCxXVKoLRxx+7pilVyuYoYPI1Vf9RtCPaNa1lhaYqpk5dB38BtvS7iFnJgg8lXXx91Sjn9lp/wA66FVKJWDGvjQrpTtWcrVOmD64ogCDEyeexofXFEUPYL2XsO2UtCrlmVDER3xz0NXZwAQCVGumXU+2aSRMDnRvuLqwwB1ERuNf8Vyywycjsjnj4jxcy2nuGEVZYwC0R38a80vysxXze5fHQuIhEV2VyyMCXcZYK8Amb2MPafQreKhVY6bTsw2pkgN2VJMDU7LU5x8HspCamtHnn+VJtWr91ujyzJcKrbtuzvcAYyyAJqoQE+0ER9avRFhc0E85HEfE/dVmzkkjKsb6aGqB2a4AiLrv2vj4NZ54NMoOtss9tFJXcMePClvm6ztbxT3YZe0PYBrNZ9TM104d7o5c1LSZVPRpiN1bB6ou1GrtWqIRfi7L3zmunw8qUdWn4+NBVqqfSPhSiqVBJ27L2rpWUgBQdxv5VFIIkEkSd6r2AM7vlUTqOff8cqhYyamoxuyrnLxoqqLk9FePCtVhQbSkgALtFZ12pth4YpwbejNFtCwySkDF4u30fhL+LxRZbKRmIBJgwJP68ANTAMZk6fwDXHtK9wlRmgodVzFZHMZgR4Vj+Ub9JtOEwPRtjG2msuzjEIGTrIPVBhIJXMusA7jauS56buLfex8msBbvF1xFm3dw4LdYbm7MGjOEJJMjWdSBXLR2ndsdK9G4vHW7ANwYi6JVHENHa15x9G3d4mug+EgdgKY3GWvPtiOmUt4i5huh8NcxCFvmqjDlMw611DFy/Z+jM66kuYjUD0bPltG4OsJcggN9TTatxk06TJThFptoy5FzjsKKIRfVWp9caURXacL/AMBkX1VoMi6dleHnVqDcPDzoAgUK2ZVEjkBWiy2aHcMOMnu0pEVqsD6NfbXPnVqzq/ndOizkPZbKQZUwR7KVZtdWpuI2ZmEk844VaLnVtBUrJ0Jj31W0T1rKghCAQCumnKudHQ12IbK5LFdTrVcq+qvjVohiORK+NHjXdF6PPlyUCL6q0ci+qtAHLbYnYe8VjGOu7XMOQZhjrqOMQK0rZltI25F9VaGRc3orwrHbxt93XPhWQMYJ100Gu38X3DnW362lDTQJplrcW3mBlYQw5ili1E5Iyzp2avUisuKZtSaKqe0Yog0J19Hyoz9nyrRkdh27RMkxCx7aYTmYEADLz3iP+qVhv9Q6Rsfun9a0XPR03XUaca4cv7O7FuBYbFpAWNCKy37qkRObvo3GC2ltAkk6kD20mTxQT3RVcOO/sTzZK+qAWXMsmYJ056cNaxpiMUT27IjXsBdT6Uaz3L951rY527PlWfEYa5evZleNuzG/Mb7HiPZXUq7ON30KXEYxozW0EASSJ5TpP8Ufy1ow9y61oG/kVs2oCx4671nOAuSzfOLijMSAoAEFp56xAHs0rUgKWkRgWKgCSRJ1puuhRvsbmHAgitFnK1klpgHWCazT9nyptklw1oiAeJ+PbUM0bVnTglU6GZAirJcmRIJ0nj8fpVL5ywRpmJ1iOXnvTWIt9oEn7ROwrJP2X8YqGGNu2WzTqNIdYbKj3PD491JOgjlUn7LVCdPRPjFdSjs5XLVEDdkAnQnbTWsPUYkoQbxJgSRdYa6SfHX2VtB09Hyoz9nyrXBNqzLas4lb6vcxKtbzTk4RH6x4VqQ6moTp6PlQB09HyoexpUGakipP2fKhPNffRwh97C3CjUI0oLpQA2z6f3fnWi4UVZdoG1YLhYMjDg3x+VaMT2mBPEEVzzheQ6IzrHoWWzMTM0KC7CaNXSpUc7d7A3Dw86NA+iaPCmBKDcPDzo0G4eHnQAaIJGqtBoVKTVgnQHYmCxk6edGg3CjQBKD7CjQ40wDUqVKAA+wo0ONGgCUIn60UZ0ob0nTDjgNDjQlDqG/FUhY9L8VMQXRblsqVmdCeQpatfVgrDOiCAViYq2k6N+Kj2eLfipUNOlREEO2s67VYeyKVcYCApk/xULl0W7YdySJAYDeCd99qdC4HGoNqxHH2RbZ/pOzqRpPo5ufIGg2PsIWkXRlDZp5A68d586dMXkjdQbh4edZbeOtXVeM5YRK8fj9Kpc6Qw62usJuZGBYMsdqPH2D20eLDyRuqUixibWJdsjaoYP3n9KbKHUN76Qw8aNU46N+KrR9qgYZ0obmgcs6t76gy+t+KgRaKh7PjVCV9b8VAAE6MPAyaBjAIFSq/zHxFAsJyhteOtAFpkxRiNKqAMvZbSp2Ru3voAtkuz2bbHnt+tWyXI0RhTRikgZreIJ7sNc/bR+dW/wDaxH9tc/bXL80vR1/BH2ZxbuO0ZIji0/pTDYuZdInu2pnzq1/tYj+2ufpQOJtf7WI/trn6UvmmHwRFWrL9Yeuyx/FBApQUSUYZ1DSjMAacz4dzLWsUDzGHuftpVzqtCnzse3C3GH/5rcMnsxPF6QFs2l0CINeCip1VrrA3Vrp9bKJFXzWwpDDEE/8A1H/Sri5aUzlxfhh7v6Vt5vRhYH2KGG6wNbW0oU75gMsb1wLfygwN7E21s4O5N2/1KXDbABYugQk7wysGB7ucT6gYpANFxPjhrv7aPztfVxH9tc/bUnlmWWCCPKYb5W4Eph8uDxSdc1kLAAWLls3JmIIUQCdgTqdJrU3T1tbNi/1X0N3LDC+pZZuImUiNGlxI4QRqd/Q/O09XEf21z9KnztPVxH9tc/SsfJM38UPRx+i+msH0hjbOEt22LXLHXi4Lge3M/wCnmGmeNSOGtdxbaKPRXNS/nS+riP7a5+2s2KxF83bXzcXQkNmDYa5M6R9Q9/LxiCnKT5NKMVwbXUONlJ5cqouHA1YyeXCuacV0mq+ijnTUYa9oefox37T51S5iulwx6pLBHayM+Fv9nlMDUT5b0k5JUDjFuzshQNAAO4Ua5CYjpPMDc6s964W8I04DL60eAoDE9K5VA6omBmLYW/vOp9HXSfdy1VMejsVONch8V0prl6k6HfC3xrGn1efnTbmJxnWL1SAJKyrYe7ptMEL7aKYzpmkubGY51UtxmkscVeY9RauFT65NpR/y/DRXou4RNzEBW5W7Qj3z8cKpGHdkpSfCR1qlSpTNEqVKlICVKlSgAUalSgAUalSmBKlSpSAlSpUpgSpUqUgJQo1KYAqUalAAo1KlAH//2Q==",
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 4,
    city: "Tokyo",
    country: "Japan",
    listingCount: 30000,
    coverImageUrl: "data:image/jpeg;base64,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",
    latitude: 35.6762,
    longitude: 139.6503
  },
  {
    id: 5,
    city: "Istanbul",
    country: "Turkey",
    listingCount: 45000,
    coverImageUrl: "data:image/jpeg;base64,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",
    latitude: 41.0082,
    longitude: 28.9784
  }
];


const { width } = Dimensions.get('screen')

// ─── Category chip config ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'All',        icon: 'apps-outline',         propertyType: null,        saleStatus: null   },
  { id: 'apartment', label: 'Apartments', icon: 'business-outline',     propertyType: 'apartment', saleStatus: 'rent' },
  { id: 'house',     label: 'Houses',     icon: 'home-outline',         propertyType: 'house',     saleStatus: 'rent' },
  { id: 'hotel',     label: 'Hotels',     icon: 'bed-outline',          propertyType: 'hotel',     saleStatus: 'rent' },
  { id: 'sale',      label: 'For sale',   icon: 'pricetag-outline',     propertyType: null,        saleStatus: 'sale' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestHomeScreen() {
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const listRef = useRef<FlatList>(null)
  const users = useAuthStore((s) => s.user)

  // Request location once on mount — softly, no hard prompt
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    })()
  }, [])

  // Main home query
  const { data, loading } = useQuery(HOME_SCREEN_QUERY, {
    variables:  {},
    fetchPolicy: 'cache-and-network',
  })

  const {
      properties,
      hasMore: hasNextPage,
      fetchMore: loadMore,
      totalCount,
      isRefetching,
      refetch,
      error,
    } = usesearchRoomTypes({
      pageSize: 10,
      skip: false,
      query: {},
      // variables: variables,
    });

    // console.log({properties})

  // Category-filtered query — only fires when a non-'all' category is active
  const activecat = CATEGORIES.find(c => c.id === activeCategory)!
  const { data: catData, loading: catLoading } = useQuery(CATEGORY_ROOMS_QUERY, {
    variables: {
      input: {
        ...({}),
        propertyType: activecat.propertyType,
        saleStatus: activecat.saleStatus,
        limit: 10,
      },
    },
    skip: activeCategory === 'all',
    fetchPolicy: 'cache-and-network',
  })

  const featured = data?.homeScreen?.featured ?? []
  // const popularCities = data?.homeScreen?.popularCities ?? []
  // console.log({popularCities})
  // What to show in the main list
  const listingsToShow = activeCategory === 'all' ? featured : (catData?.featuredRoomTypes ?? [])
  const listingsLoading = activeCategory === 'all' ? loading : catLoading

  const handleCityPress = (city: any) => {
    console.log({city})
    router.push({
      pathname: '/(guest)/(tabs)/home/(search)/[query]',
      params: {
        query: JSON.stringify({
          city: city.city_id,
        }),
      },
    })
  }

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id)
  }

  const renderItem = useCallback(
    ({ item }: any) => <PropertyCard property={item} />,
    []
  );

  const keyExtractor = useCallback((item: any) => item?.id, []);
  

  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* ── Category chips (sticky) ── */}
        <View style={[styles.stickyChips, { backgroundColor: theme.colors.backgroundSec }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.id
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleCategorySelect(cat.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.background2,
                      borderColor: active ? theme.colors.primary : 'transparent',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={active ? '#fff' : theme.colors.text}
                  />
                  <ThemedText
                    style={[styles.chipLabel, { color: active ? '#fff' : theme.colors.text }]}
                  >
                    {cat.label}
                  </ThemedText>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        // stickyHeaderIndices={[1]} // category chips stick below the search bar
      >
        {/* ── Spacer so content starts below the shared search bar header ── */}
        {/* <View style={styles.headerSpacer} /> */}

        

        {/* ── Featured / category listings ── */}
        <Section label={activeCategory === 'all' ? 'Featured stays' : activecat.label}>
          {listingsLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : listingsToShow.length === 0 ? (
            <EmptyState
              icon="search-outline"
              message="No listings found in this category yet."
              theme={theme}
            />
          ) : (
            <FlatList
              ref={listRef}
              data={listingsToShow}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <FeaturedCard item={item} theme={theme} />
              )}
            />
          )}
        </Section>

        {/* ── Popular cities ── */}
        {popularCities.length > 0 && (
          <Section
            label={coords ? 'Nearby destinations' : 'Popular destinations'}
          >
            <FlatList
              data={popularCities}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => `${item.city}-${item.country}`}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <CityCard item={item} theme={theme} onPress={() => handleCityPress(item)} />
              )}
            />
          </Section>
        )}

        <Section label='Properties'>
          <FlatList 
         data={properties}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          // ItemSeparatorComponent={ItemSeparatorComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          onEndReachedThreshold={0.5}
          // onEndReached={checkLoadingAndLoadMore}
          getItemLayout={(data: any, index: any) => ({
            length: 320,
            offset: 320 * index,
            index,
          })}
        />
        </Section>

        {/* ── Soft sign-up nudge ── */}
        {!users && <SignUpNudge theme={theme} />}

        <View style={{ height: 120 }} />
      </ScrollView>
    </ThemedView>
  )
}

// ─── Featured listing card ────────────────────────────────────────────────────

function FeaturedCard({ item, theme }: { item: any; theme: any }) {
  console.log({item: item.property.images})
  const coverUrl = item.property.images?.[0]?.cdn_url
  const city = item.property?.address?.city ?? ''
  const country = item.property?.address?.country ?? ''

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(guest)/(modals)/experienceDetail/[query]',
          params: { query: item.id },
        })
      }
      style={[styles.featuredCard, { backgroundColor: theme.colors.background }]}
    >
      {/* Image */}
      <View style={styles.featuredImageWrap}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.featuredImage} contentFit="cover" />
        ) : (
          <View style={[styles.featuredImagePlaceholder, { backgroundColor: theme.colors.background2 }]}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        {/* Property type badge */}
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <ThemedText style={styles.badgeText}>
            {item.property?.sale_status === 'sale' ? 'For sale' : 'Rent'}
          </ThemedText>
        </View>
      </View>

      {/* Details */}
      <View style={styles.featuredDetails}>
        <ThemedText style={styles.featuredCity} numberOfLines={1}>
          {city}{country ? `, ${country}` : ''}
        </ThemedText>
        <ThemedText style={styles.featuredName} numberOfLines={1}>
          {item.name}
        </ThemedText>

        <View style={styles.featuredMeta}>
          {item.bed_count != null && (
            <MetaPill icon="bed-outline" label={`${item.bed_count} bed`} theme={theme} />
          )}
          {item.bathroom_count != null && (
            <MetaPill icon="water-outline" label={`${item.bathroom_count} bath`} theme={theme} />
          )}
        </View>

        <View style={styles.featuredFooter}>
          <ThemedText style={[styles.featuredPrice, { color: theme.colors.primary }]}>
            {item.currency ?? 'USD'} {item.base_price?.toLocaleString() ?? '—'}
            <ThemedText secondary style={styles.featuredPricePer}> / night</ThemedText>
          </ThemedText>

          {item.avg_rating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={theme.colors.warning ?? '#F59E0B'} />
              <ThemedText style={styles.ratingText}>{item.avg_rating}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

function MetaPill({ icon, label, theme }: { icon: any; label: string; theme: any }) {
  return (
    <View style={[styles.metaPill, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
      <Ionicons name={icon} size={12} color={theme.colors.textSecondary} />
      <ThemedText secondary style={styles.metaLabel}>{label}</ThemedText>
    </View>
  )
}

// ─── City card ────────────────────────────────────────────────────────────────

function CityCard({
  item,
  theme,
  onPress,
}: {
  item: any
  theme: any
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={styles.cityCard}>
      {item.coverImageUrl &&
        <Image source={{ uri: item.coverImageUrl }} style={styles.cityImage} contentFit="cover" />
      }
      {/* Dark scrim for text legibility */}
      <View style={styles.cityScrim} />
      <View style={styles.cityTextWrap}>
        <ThemedText style={styles.cityName}>{item.city}</ThemedText>
        <ThemedText style={styles.cityCount}>{item.listingCount} stays</ThemedText>
      </View>
      <View style={{position:'absolute', bottom: 0, left: 0, justifyContent: 'center', alignItems:'center', width: '100%', height:'100%'}}>
        <Ionicons name="location-outline" size={28} color={theme.colors.textSecondary} />
      </View>
    </Pressable>
  )
}

// ─── Sign-up nudge ────────────────────────────────────────────────────────────

function SignUpNudge({ theme }: { theme: any }) {
  return (
    <View style={[styles.nudgeCard, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.nudgeIcon, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
        <Ionicons name="bookmark-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.nudgeText}>
        <ThemedText style={styles.nudgeTitle}>Save places you love</ThemedText>
        <ThemedText secondary style={styles.nudgeBody}>
          Create an account to save listings, book faster and manage your trips.
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/(guest)/(auth)/auth_page')}
        style={[styles.nudgeBtn, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.85}
      >
        <ThemedText style={styles.nudgeBtnText}>Join free</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionLabel}>{label}</ThemedText>
      {children}
    </View>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  message,
  theme,
}: {
  icon: any
  message: string
  theme: any
}) {
  return (
    <View style={[styles.emptyWrap, { backgroundColor: theme.colors.backgroundSec ?? '#f4f4f4' }]}>
      <Ionicons name={icon} size={28} color={theme.colors.textSecondary} />
      <ThemedText secondary style={styles.emptyText}>{message}</ThemedText>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FEATURED_CARD_WIDTH = width * 0.72
const CITY_CARD_WIDTH = 140

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 20 },

  headerSpacer: { height: 8 },

  // Sticky chips
  stickyChips: {
    paddingVertical: 10,
    zIndex: 10,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  horizontalList: {
    gap: 14,
    paddingRight: 16,
  },

  loadingRow: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Featured card
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImageWrap: {
    position: 'relative',
  },
  featuredImage: {
    width: FEATURED_CARD_WIDTH,
    height: 190,
  },
  featuredImagePlaceholder: {
    width: FEATURED_CARD_WIDTH,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  featuredDetails: {
    padding: 14,
    gap: 4,
  },
  featuredCity: {
    fontSize: 12,
    textTransform: 'capitalize',
    opacity: 0.55,
    fontWeight: '500',
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '700',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featuredPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  featuredPricePer: {
    fontSize: 12,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // City card
  cityCard: {
    width: CITY_CARD_WIDTH,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  cityImage: {
    width: CITY_CARD_WIDTH,
    height: 120,
  },
  cityImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cityTextWrap: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  cityCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },

  // Sign-up nudge
  nudgeCard: {
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  nudgeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: {
    gap: 4,
  },
  nudgeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  nudgeBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  nudgeBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  nudgeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Empty
  emptyWrap: {
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    // paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 16,
    gap: 16
  },
})