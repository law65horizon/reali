// screens/host/RoomTypesScreen.tsx
import { useTheme } from '@/theme/theme';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const GET_PROPERTY_ROOM_TYPES = gql`
query GetProperty($getPropertyId: ID!) {
  getProperty(id: $getPropertyId) {
    id
    title
    property_type
    roomTypes {
      id
      name
      description
      capacity
      bed_count
      bathroom_count
      base_price
      size_sqft
      currency
      amenities
      weekly_rate
      monthly_rate
      isActive
    }
  }
}
`;

const CREATE_ROOM_TYPE = gql`
mutation CreateRoomType($input: CreateRoomTypeInput!) {
  createRoomType(input: $input) {
    success
    message
    room_type {
      id
      name
      description
      capacity
      bed_count
      bathroom_count
      base_price
      size_sqft
      currency
      amenities
      weekly_rate
      monthly_rate
      isActive
    }
  }
}
`;

const UPDATE_ROOM_TYPE = gql`
mutation UpdateRoomType($updateRoomTypeId: ID!, $input: UpdateRoomTypeInput!) {
  updateRoomType(id: $updateRoomTypeId, input: $input) {
    success
    message
    room_type {
      id
      name
      description
      capacity
      bed_count
      bathroom_count
      base_price
      size_sqft
      currency
      amenities
      weekly_rate
      monthly_rate
      isActive
    }
  }
}
`

const DELETE_ROOM_TYPE = gql`
 mutation DeleteRoomType($deleteRoomTypeId: ID!) {
  deleteRoomType(id: $deleteRoomTypeId) {
    message
    success
  }
}
`;

const GET_PROPERTY_ROOM_TYPES_MOCK = {
  data: {
    property: {
      id: "prop_001",
      title: "Modern Downtown Apartment",
      property_type: "APARTMENT",
      room_types: [
        {
          id: "room_101",
          name: "Standard Room",
          description: "A comfortable room with modern furnishings and plenty of natural light.",
          capacity: 2,
          bed_count: 1,
          bathroom_count: 1,
          size_sqft: 320,
          base_price: 120,
          currency: "EUR",
          amenities: ["WiFi", "Air Conditioning", "Work Desk"],
          min_nights: 1,
          max_nights: 14,
          is_active: true,
        },
        {
          id: "room_102",
          name: "Deluxe Room",
          description: "Spacious room with a queen-size bed and city views.",
          capacity: 3,
          bed_count: 2,
          bathroom_count: 1,
          size_sqft: 450,
          base_price: 180,
          currency: "EUR",
          amenities: ["WiFi", "Air Conditioning", "Balcony", "Smart TV"],
          min_nights: 2,
          max_nights: 21,
          is_active: true,
        },
        {
          id: "room_103",
          name: "Entire Apartment",
          description: "Private apartment ideal for families or longer stays.",
          capacity: 4,
          bed_count: 2,
          bathroom_count: 2,
          size_sqft: 780,
          base_price: 260,
          currency: "EUR",
          amenities: [
            "WiFi",
            "Full Kitchen",
            "Washer",
            "Dryer",
            "Elevator",
          ],
          min_nights: 3,
          max_nights: 30,
          is_active: false,
        },
      ],
    },
  },
};


export default function RoomTypesScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, loading, refetch } = useQuery(GET_PROPERTY_ROOM_TYPES, {
    variables: { getPropertyId: propertyId },
  });
  
  const [createRoomType] = useMutation(CREATE_ROOM_TYPE, {
    update(cache, {data}, {variables}) {
      if (data?.createRoomType.success) {
        const newRoom = data.createRoomType.room_type;

        cache.modify({
          id: cache.identify({
            __typename: 'Property',
            id: variables?.input.property_id
          }),

          fields: {
            roomTypes(existingRooms = []) {
              const newRoomRef = cache.writeFragment({
                data: newRoom,
                fragment: gql`
                  fragment NewRoom on RoomType {
                    id
                    name
                    description
                    capacity
                    bed_count
                    bathroom_count
                    base_price
                    size_sqft
                    currency
                    amenities
                    weekly_rate
                    monthly_rate
                    isActive
                  }
                `
              })

              return [...existingRooms, newRoomRef]
            }
          }
        })
      }
    }
  });

  const [updateRoomType] = useMutation(UPDATE_ROOM_TYPE)

  const [deleteRoomType] = useMutation(DELETE_ROOM_TYPE, {
    context: {},
    update(cache, {data}, {variables}) {
      if (data?.deleteRoomType.success) {
        const roomId = variables?.roomTypeId
        
        const normarlizedId = cache.identify({
          __typename: 'RoomType',
          id: roomId
        })

        cache.evict({id: normarlizedId})
        cache.gc()
      }
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    bed_count: '',
    bathroom_count: '',
    size_sqft: '',
    base_price: '', 
    min_nights: '1',
    weaklyRate: '',
    monthlyRate: ''
  });

  const [formSnapShot, setFormSnapShot] = useState({
    name: '',
    description: '',
    capacity: '',
    bed_count: '',
    bathroom_count: '',
    size_sqft: '',
    base_price: '', 
    min_nights: '1',
    weaklyRate: '',
    monthlyRate: '',
    id: ''
  });

  // const property = GET_PROPERTY_ROOM_TYPES_MOCK.data.property;
  const property = data?.getProperty;
  const roomTypes = property?.roomTypes || [];
  console.log(propertyId, data?.getProperty.roomTypes)

  const handleDeleteRoomType = (roomTypeId: string, roomTypeName: string) => {
    Alert.alert(
      'Delete Room Type',
      `Are you sure you want to delete "${roomTypeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true)
            try {
              await deleteRoomType({ variables: { deleteRoomTypeId: roomTypeId } });
              // await refetch();
              Alert.alert('Success', 'Room type deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete room type');
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    );
  };

  const handleCreateRoomType = async () => {
    if (!formData.name.trim() || !formData.base_price) {
      Alert.alert('Missing Information', 'Please fill in room name and base price');
      return;
    }

    try {
      setIsSubmitting(true)
      await createRoomType({
        variables: {
          input: {
            property_id: propertyId,
            name: formData.name,
            description: formData.description,
            capacity: parseInt(formData.capacity) || 1,
            bed_count: parseInt(formData.bed_count) || 1,
            bathroom_count: parseInt(formData.bathroom_count) || 1,
            size_sqft: parseInt(formData.size_sqft) || null,
            base_price: parseFloat(formData.base_price),
            weekly_rate: parseFloat(formData.weaklyRate),
            monthly_rate: parseFloat(formData.monthlyRate),
            min_nights: parseInt(formData.min_nights) || 1,
          },
        },
      });

      // await refetch();
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        capacity: '',
        bed_count: '',
        bathroom_count: '',
        size_sqft: '',
        base_price: '',
        min_nights: '1',
        weaklyRate: '',
        monthlyRate: '',
      });
      Alert.alert('Success', 'Room type created');
    } catch (error) {
      Alert.alert('Error', 'Failed to create room type');
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleEditRoomType = async () => {
    if (!formData.name.trim() || !formData.base_price || !formSnapShot.id) {
      Alert.alert('Missing Information', 'Please fill in room name and base price');
      return;
    }

    try {
      setIsSubmitting(true)
      const input: any = {
      }
      {
        if (formData.name !== formSnapShot.name) input.name = formData.name
        if (formData.description !== formSnapShot.description) input.description = formData.description
        if (formData.capacity !== formSnapShot.capacity) input.capacity = parseInt(formData.capacity)
        if (formData.bed_count !== formSnapShot.bed_count) input.bed_count = parseInt(formData.bed_count)
        if (formData.bathroom_count !== formSnapShot.bathroom_count) input.bathroom_count = parseInt(formData.bathroom_count)
        if (formData.size_sqft !== formSnapShot.size_sqft) input.size_sqft = parseInt(formData.size_sqft)
        if (formData.base_price !== formSnapShot.base_price) input.base_price = parseFloat(formData.base_price)
        if (formData.weaklyRate !== formSnapShot.weaklyRate) input.weaklyRate = parseFloat(formData.weaklyRate)
        if (formData.monthlyRate !== formSnapShot.monthlyRate) input.monthlyRate = parseFloat(formData.monthlyRate)
        if (formData.min_nights !== formSnapShot.min_nights) input.min_nights = parseInt(formData.min_nights)
      }
      const result = await updateRoomType({
        variables: {
          input,
          updateRoomTypeId: formSnapShot.id
        },
      });

      // await refetch();
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        capacity: '',
        bed_count: '',
        bathroom_count: '',
        size_sqft: '',
        base_price: '',
        min_nights: '1',
        weaklyRate: '',
        monthlyRate: '',
      });
      setFormSnapShot({
        name: '',
        description: '',
        capacity: '',
        bed_count: '',
        bathroom_count: '',
        size_sqft: '',
        base_price: '',
        min_nights: '1',
        weaklyRate: '',
        monthlyRate: '',
        id: ''
      });
      if (result.data?.updateRoomType.success) {
        console.log(result.data?.updateRoomType.message)
        Alert.alert('Success', 'Room type Esdited');
      } else {
        Alert.alert('Error', 'Failed to edit room type');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to edit room type');
    } finally {
      setIsSubmitting(false)
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderRoomTypeCard = (roomType: any) => (
    <View key={roomType.id} style={[styles.roomCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.roomHeader}>
        <View style={styles.roomHeaderLeft}>
          <Text style={[styles.roomName, { color: theme.colors.text }]}>{roomType.name}</Text>
          {!roomType.is_active && (
            <View style={[styles.inactiveBadge, { backgroundColor: theme.colors.error + '15' }]}>
              <Text style={[styles.inactiveBadgeText, { color: theme.colors.error }]}>Inactive</Text>
            </View>
          )}
        </View>
        <View style={styles.roomHeaderRight}>
          <Text style={[styles.roomPrice, { color: theme.colors.primary }]}>
            ${roomType.base_price}
          </Text>
          <Text style={[styles.roomPricePeriod, { color: theme.colors.textSecondary }]}>
            /night
          </Text>
        </View>
      </View>

      {roomType.description && (
        <Text style={[styles.roomDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {roomType.description}
        </Text>
      )}

      {/* Room Details Grid */}
      <View style={styles.roomDetailsGrid}>
        <View style={[styles.roomDetail, { backgroundColor: theme.colors.backgroundSec }]}>
          <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.roomDetailText, { color: theme.colors.text }]}>
            {roomType.capacity} guests
          </Text>
        </View>

        <View style={[styles.roomDetail, { backgroundColor: theme.colors.backgroundSec }]}>
          <Ionicons name="bed-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.roomDetailText, { color: theme.colors.text }]}>
            {roomType.bed_count} {roomType.bed_count === 1 ? 'bed' : 'beds'}
          </Text>
        </View>

        <View style={[styles.roomDetail, { backgroundColor: theme.colors.backgroundSec }]}>
          <Ionicons name="water-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.roomDetailText, { color: theme.colors.text }]}>
            {roomType.bathroom_count} bath
          </Text>
        </View>

        {roomType.size_sqft && (
          <View style={[styles.roomDetail, { backgroundColor: theme.colors.backgroundSec }]}>
            <Ionicons name="resize-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.roomDetailText, { color: theme.colors.text }]}>
              {roomType.size_sqft} sqft
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.roomActions}>
        <TouchableOpacity
          style={[styles.roomActionButton, { backgroundColor: theme.colors.backgroundSec }]}
          onPress={() => {
            // setFormData(roomType)
            setShowAddModal(true)
            console.log({roomType: roomType.base_price})
            setFormData({
              name: roomType.name,
              description: roomType.description,
              capacity: roomType.capacity.toString(),
              bathroom_count: roomType.bathroom_count.toString(),
              size_sqft: roomType.size_sqft?.toString(),
              base_price: roomType.base_price?.toString(),
              min_nights: roomType.min_nights?.toString(),
              bed_count: roomType.bed_count?.toString(),
              monthlyRate: roomType.montly_rate?.toString(),
              weaklyRate: roomType.weekly_rate?.toString()
            })
            setFormSnapShot({
              name: roomType.name,
              description: roomType.description,
              capacity: roomType.capacity.toString(),
              bathroom_count: roomType.bathroom_count.toString(),
              size_sqft: roomType.size_sqft?.toString(),
              base_price: roomType.base_price?.toString(),
              min_nights: roomType.min_nights?.toString(),
              bed_count: roomType.bed_count?.toString(),
              monthlyRate: roomType.montly_rate?.toString(),
              weaklyRate: roomType.weekly_rate?.toString(),
              id: roomType.id?.toString()
            })
          }}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.text} />
          <Text style={[styles.roomActionText, { color: theme.colors.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roomActionButton, styles.deleteButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={() => handleDeleteRoomType(roomType.id, roomType.name)} disabled={isDeleting}
        >
          {isDeleting ? <ActivityIndicator size={'small'}/> : <Ionicons name="trash-outline" size={18} color={theme.colors.error} />}
        </TouchableOpacity>
      </View>
      {true && <TouchableOpacity style={[styles.roomActionButton, {backgroundColor: theme.colors.backgroundSec, marginTop: 12}]}
        onPress={() => {
          console.log(roomType.id)
          router.push({
          pathname: '/listing/units',
          params: {id: roomType.id}
        })}}
      >
        <Text style={[styles.roomActionText, {color: theme.colors.text}]}>Units</Text>
      </TouchableOpacity>}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {property?.title}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Room Types
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {roomTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.backgroundSec }]}>
              <Ionicons name="bed-outline" size={48} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No room types yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add room types to specify different accommodation options
            </Text>
          </View>
        ) : (
          roomTypes.map((roomType: any) => renderRoomTypeCard(roomType))
        )}
      </ScrollView>

      {/* Add Room Type FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Room Type Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Room Type
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 200}}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Room Name *
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                  placeholder="e.g., Deluxe Suite"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Description
                </Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                  placeholder="Describe this room type..."
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    Capacity
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                    placeholder="2"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={formData.capacity}
                    onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    Beds
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                    placeholder="1"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={formData.bed_count}
                    onChangeText={(text) => setFormData({ ...formData, bed_count: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    Bathrooms
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                    placeholder="1"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={formData.bathroom_count}
                    onChangeText={(text) => setFormData({ ...formData, bathroom_count: text })}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                    Size (sqft)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                    placeholder="400"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={formData.size_sqft}
                    onChangeText={(text) => setFormData({ ...formData, size_sqft: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Base Price (per night) *
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                  placeholder="100.00"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={formData.base_price}
                  onChangeText={(text) => setFormData({ ...formData, base_price: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Weekly Rate *
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                  placeholder="100.00"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={formData.weaklyRate}
                  onChangeText={(text) => setFormData({ ...formData, weaklyRate: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Minimum Nights
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }]}
                  placeholder="1"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  value={formData.min_nights}
                  onChangeText={(text) => setFormData({ ...formData, min_nights: text })}
                  keyboardType="number-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.colors.card }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              {formSnapShot ? 
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleEditRoomType}
                >
                  {isSubmitting ?
                   <ActivityIndicator size={'small'} /> : 
                   <Text style={styles.modalButtonText}>Edit Room Type</Text>}
                </TouchableOpacity> :
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleCreateRoomType}
                >
                  {isSubmitting ?
                   <ActivityIndicator size={'small'} /> : 
                   <Text style={styles.modalButtonText}>Create Room Type</Text>}
                </TouchableOpacity>
              }
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  roomCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  roomHeaderRight: {
    alignItems: 'flex-end',
  },
  roomPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  roomPricePeriod: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  roomDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roomDetailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roomActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deleteButton: {
    flex: 0,
    paddingHorizontal: 12,
  },
  roomActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    flex: 0,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});