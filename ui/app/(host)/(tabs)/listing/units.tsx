// screens/host/RoomUnitsScreen.tsx

import { useTheme } from '@/theme/theme';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GET_ROOM_UNITS = gql`
query GetRoomType($getRoomTypeId: ID!) {
  getRoomType(id: $getRoomTypeId) {
    id
    name
    base_price
    currency
    units {
      id
      unit_code
      status
      created_at
      floor_number
    }
  }
}
`;

const DELETE_ROOM_UNIT = gql`
  mutation DeleteRoomUnit($deleteRoomUnitId: ID!) {
  deleteRoomUnit(id: $deleteRoomUnitId) {
    message
    success
  }
}
`;

const UPDATE_ROOM_UNIT = gql`
mutation UpdateRoomUnit($updateRoomUnitId: ID!, $input: UpdateRoomUnitInput!) {
  updateRoomUnit(id: $updateRoomUnitId, input: $input) {
    message
    success
    unit {
      id
      status
    }
  }
}
`;

const mockGetRoomUnitsResponse = {
  data: {
    roomType: {
      id: "rt_101",
      name: "Deluxe King Room",
      base_price: 180.0,
      currency: "USD",
    },
    roomUnitsByRoomType: [
      {
        id: "ru_1001",
        unit_code: "DK-101",
        status: "AVAILABLE",
        created_at: "2024-10-12T09:15:30Z",
      },
      {
        id: "ru_1002",
        unit_code: "DK-102",
        status: "OCCUPIED",
        created_at: "2024-10-13T11:42:10Z",
      },
      {
        id: "ru_1003",
        unit_code: "DK-103",
        status: "MAINTENANCE",
        created_at: "2024-10-14T08:05:55Z",
      },
    ],
  },
};


export default function RoomUnitsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const roomTypeId = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, loading, refetch } = useQuery(GET_ROOM_UNITS, {
    variables: { getRoomTypeId: roomTypeId },
  });

  const [deleteUnit] = useMutation(DELETE_ROOM_UNIT, {
    update(cache, {data}, {variables}) {
      if (data?.deleteRoomUnit.success) {
        const unitId = variables?.deleteRoomUnitId
        console.log({unitId})

        const normarlizedId = cache.identify({
          __typename: 'RoomUnit',
          id: unitId
        })

        cache.evict({id: normarlizedId})
        cache.gc()
      }
    }
  });
  const [updateUnit] = useMutation(UPDATE_ROOM_UNIT, {fetchPolicy: 'network-only'});

  const roomType = data?.getRoomType;
  console.log({roomType, roomTypeId})
  const units = roomType?.units || [];
//   const roomType = mockGetRoomUnitsResponse.data.roomType
//   const units = mockGetRoomUnitsResponse.data.roomUnitsByRoomType

  // Group units by floor
  const unitsByFloor = units.reduce((acc: any, unit: any) => {
    const floor = unit.unit_code.charAt(0);
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(unit);
    return acc;
  }, {});

  const floors = Object.keys(unitsByFloor).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'maintenance':
        return theme.colors.warning;
      case 'inactive':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'checkmark-circle';
      case 'maintenance':
        return 'construct';
      case 'inactive':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleDeleteUnit = (unitId: string, unitCode: string) => {
    Alert.alert(
      'Delete Unit',
      `Are you sure you want to delete unit ${unitCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true)
              const result = await deleteUnit({ variables: { deleteRoomUnitId: unitId } });
              // await refetch();
              if (result.data?.deleteRoomUnit.success) {
                Alert.alert('Success', 'Unit deleted');
              } else {
                Alert.alert('Error', result.data?.deleteRoomUnit.message);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete unit');
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (unitId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    console.log({unitId})
    try {
      await updateUnit({
        variables: {
          updateRoomUnitId: unitId,
          input: { status: newStatus },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateRoomUnit: {
            __typename: "UpdateRoomUnitResponse",
            message: "Optimistic update",
            success: true,
            unit: {
              __typename: "RoomUnit",
              id: unitId,
              status: newStatus
            }
          }
        }
      });
      // await refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderUnitCard = (unit: any) => (
    <View key={unit.id} style={[styles.unitCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.unitHeader}>
        <View style={styles.unitCodeContainer}>
          <Ionicons name="key" size={20} color={theme.colors.primary} />
          <Text style={[styles.unitCode, { color: theme.colors.text }]}>
            {unit.unit_code}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(unit.status) + '15' }]}>
          <Ionicons
            name={getStatusIcon(unit.status) as any}
            size={14}
            color={getStatusColor(unit.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(unit.status) }]}>
            {unit.status}
          </Text>
        </View>
      </View>

      <View style={styles.unitActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSec }]}
          onPress={() => handleToggleStatus(unit.id, unit.status)}
        >
          <Ionicons
            name={unit.status === 'active' ? 'pause' : 'play'}
            size={16}
            color={theme.colors.text}
          />
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            {unit.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.warning + '15' }]}
          onPress={() => updateUnit({
            variables: { updateRoomUnitId: unit.id, input: { status: 'maintenance' } },
            optimisticResponse: {
              __typename: 'Mutation',
              updateRoomUnit: {
                __typename: "UpdateRoomUnitResponse",
                message: "Optimistic update",
                success: true,
                unit: {
                  __typename: "RoomUnit",
                  id: unit.id,
                  status: 'maintenance'
                }
              }
            }
          })}
        >
          <Ionicons name="construct" size={16} color={theme.colors.warning} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={() => handleDeleteUnit(unit.id, unit.unit_code)}
        >
          {false ? <ActivityIndicator size={'small'}/> :<Ionicons name="trash" size={16} color={theme.colors.error} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {roomType?.name}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Room Units
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {units.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Units
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {units.filter((u: any) => u.status === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {units.filter((u: any) => u.status === 'maintenance').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Maintenance
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {units.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.backgroundSec }]}>
              <Ionicons name="key-outline" size={48} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No units created yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add room units to make this room type bookable
            </Text>
          </View>
        ) : (
          <>
            {floors.map((floor) => (
              <View key={floor} style={styles.floorSection}>
                <View style={[styles.floorHeader, { backgroundColor: theme.colors.backgroundSec }]}>
                  <Ionicons name="layers" size={20} color={theme.colors.primary} />
                  <Text style={[styles.floorTitle, { color: theme.colors.text }]}>
                    Floor {floor}
                  </Text>
                  <Text style={[styles.floorCount, { color: theme.colors.textSecondary }]}>
                    {unitsByFloor[floor].length} units
                  </Text>
                </View>
                {unitsByFloor[floor].map((unit: any) => renderUnitCard(unit))}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Unit Button */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push({
            pathname: '/listing/creU1',
            params: { roomTypeId }
          })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Units</Text>
        </TouchableOpacity>
      </View>
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
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  floorSection: {
    marginBottom: 24,
  },
  floorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  floorTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  floorCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  unitCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitCode: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  unitActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  addButton: {
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});