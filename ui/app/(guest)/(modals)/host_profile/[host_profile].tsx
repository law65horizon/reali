import { ThemedText } from '@/components/ThemedText';
import { Line } from '@/components/ui/Line';
import { useTheme } from '@/theme/theme';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Award, Briefcase, ChevronRight, Heart, Home, MapPin, MessageCircle, Shield, Star, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const HostProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation()

  const host = {
    name: 'Carole',
    role: 'Premier Agent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    rating: 4.93,
    reviews: 545,
    yearsActive: 6,
    location: 'Paris, France',
    verified: true,
    specialties: ['Luxury Homes', 'Investment Properties', 'First-Time Buyers'],
    bio: 'Passionate about connecting people with their dream properties. With over 6 years of experience in the Paris real estate market, I specialize in luxury homes and investment opportunities.',
    stats: {
      propertiesSold: 127,
      activeListings: 8,
      responseRate: 98,
    },
    interests: ['Architecture', 'Interior Design', 'Local Markets', 'Photography'],
    properties: [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
        title: 'Modern Loft in Le Marais',
        rating: 4.95,
        reviews: 89,
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
        title: 'Elegant Apartment Near Eiffel',
        rating: 4.88,
        reviews: 124,
      },
    ],
    recentReviews: [
      {
        id: 1,
        name: 'Diane',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '4 days ago',
        text: 'Carole is the perfect host. Just wonderful. Interesting to talk to, helpful and knowledgeable about Paris.',
      },
      {
        id: 2,
        name: 'Diane',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '4 days ago',
        text: 'Carole is the perfect host. Just wonderful. Interesting to talk to, helpful and knowledgeable about Paris.',
      },
      {
        id: 3,
        name: 'Diane',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '4 days ago',
        text: 'Carole is the perfect host. Just wonderful. Interesting to talk to, helpful and knowledgeable about Paris.',
      },
    ],
  };

  const StatCard = ({ icon: Icon, label, value, color }:any) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.backgroundSec }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() =>  navigation.goBack()} style={{alignSelf: 'flex-end', paddingBottom: 10}}>
          <Entypo name='cross' color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: host.avatar }} style={styles.avatar} />
            {host.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.success }]}>
                <Shield size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{host.name}</Text>
            <View style={styles.roleContainer}>
              <Award size={14} color={theme.colors.primary} />
              <Text style={[styles.role, { color: theme.colors.primary }]}>{host.role}</Text>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
                {host.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Star size={18} color="#FFA500" fill="#FFA500" />
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
              {host.rating}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
              Rating
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
              {host.reviews}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
              Reviews
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
              {host.yearsActive}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
              Years Active
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Contact Host</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
          >
            <Heart size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Performance
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon={Home} 
            label="Properties Sold" 
            value={host.stats.propertiesSold} 
            color={theme.colors.primary}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Active Listings" 
            value={host.stats.activeListings} 
            color={theme.colors.accent}
          />
          <StatCard 
            icon={MessageCircle} 
            label="Response Rate" 
            value={`${host.stats.responseRate}%`} 
            color={theme.colors.success}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
        <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{host.bio}</Text>
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Specialties
        </Text>
        <View style={styles.specialtiesContainer}>
          {host.specialties.map((specialty, index) => (
            <View 
              key={index} 
              style={[styles.specialtyChip, { 
                backgroundColor: theme.colors.backgroundSec,
                borderColor: theme.colors.border 
              }]}
            >
              <Briefcase size={14} color={theme.colors.primary} />
              <Text style={[styles.specialtyText, { color: theme.colors.text }]}>
                {specialty}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Interests
        </Text>
        <View style={styles.interestsContainer}>
          {host.interests.map((interest, index) => (
            <View 
              key={index} 
              style={[styles.interestChip, { backgroundColor: theme.colors.backgroundSec }]}
            >
              <Text style={[styles.interestText, { color: theme.colors.text }]}>
                {interest}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Properties */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Active Listings
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.text }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {host.properties.map((property) => (
            <TouchableOpacity 
              key={property.id} 
              style={[styles.propertyCard, { backgroundColor: theme.colors.card }]}
            >
              <Image source={{ uri: property.image }} style={styles.propertyImage} />
              <View style={styles.propertyInfo}>
                <Text style={[styles.propertyTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {property.title}
                </Text>
                <View style={styles.propertyRating}>
                  <Star size={12} color="#FFA500" fill="#FFA500" />
                  <Text style={[styles.propertyRatingText, { color: theme.colors.text }]}>
                    {property.rating}
                  </Text>
                  <Text style={[styles.propertyReviews, { color: theme.colors.textSecondary }]}>
                    ({property.reviews})
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Reviews ({host.reviews})
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.text }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={310}
        >
          {host.recentReviews.map((review) => (
            <View 
              key={review.id} 
              style={[styles.reviewCard, { backgroundColor: theme.colors.backgroundSec }]}
            >
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                <View style={styles.reviewHeaderText}>
                <Text style={[styles.reviewerName, { color: theme.colors.text }]}>
                  {review.name}
                </Text>
                <View style={styles.reviewMeta}>
                  <View style={styles.reviewStars}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} color="#FFA500" fill="#FFA500" />
                    ))}
                  </View>
                  <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>
                    • {review.date}
                  </Text>
                </View>
                </View>
              </View>
              <Text style={[styles.reviewText, { color: theme.colors.textSecondary }]}>
                {review.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <Line orientation='horizontal' style={{marginHorizontal: 20}} />
      <View style={{justifyContent: 'space-between', flex: 1, flexDirection: 'row', marginVertical: 30, marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
            <Ionicons name='flag-outline' size={24} color={theme.colors.text} />
            <ThemedText>Report {host.name} </ThemedText>
        </View>
        <ChevronRight color={theme.colors.textSecondary}/>
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingBottom: 10
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  interestText: {
    fontSize: 13,
    fontWeight: '500',
  },
  propertyCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 150,
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  propertyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyRatingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  propertyReviews: {
    fontSize: 12,
  },
  reviewCard: {
    width: 300,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HostProfileScreen;