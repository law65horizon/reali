// screens/host/CreateUnitsStep2.tsx

import { useTheme } from '@/theme/theme';
import { gql, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type CreationMethod = 'single' | 'batch' | 'multi-floor';

interface FormStateSingle {
  autoGenerate: boolean;
  floorNumber: string;
  unitCode: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface FormStateBatch {
  floorNumber: string;
  quantity: string;
}

interface FormStateMulti {
  startFloor: string;
  endFloor: string;
  unitsPerFloor: string;
  prefix: string;
}

interface InputType {
  room_type_id: number
  auto_generate_code?: boolean
  floor_number?: number,
  quantity?: number,
  status?: string,
  unit_code?: string
}

const CREATE_ROOM_UNIT = gql`
mutation CreateRoomUnit($input: CreateRoomUnitInput!) {
  createRoomUnit(input: $input) {
    message
    success
    unit {
      id
      unit_code
      status
      created_at
      floor_number
    }
    units {
      id
      unit_code
      status
      created_at
      floor_number
    }
  }
}
`

export default function CreateUnitsStep2() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const roomTypeId = params.roomTypeId as string;
  const method = params.method as CreationMethod;

  const [createRoomUnit, {loading: creatingUnit, error}] = useMutation(CREATE_ROOM_UNIT, {
    update(cache, {data}, {variables}) {
      if (data?.createRoomUnit.success) {
        const newUnits: [] = data.createRoomUnit.units?.length 
        ? data.createRoomUnit.units 
        : data.createRoomUnit.unit 
          ? [data.createRoomUnit.unit] 
          : [];

      if (newUnits.length === 0) return;

        cache.modify({
          id: cache.identify({
            __typename: 'RoomType',
            id: variables?.input.room_type_id
          }),

          fields: {
            units(existingUnits = []) {
              const newUnitsRef = newUnits.map(unit => 
                cache.writeFragment({
                  data: unit,
                  fragment: gql`
                    fragment NewUnit on RoomUnit {
                      id
                      unit_code
                      status
                      created_at
                      floor_number
                    }
                  `
                })
              )
              return [...existingUnits, ...newUnitsRef]
            }
          }
        })
      }
    }
  })

  console.log(method)

  const [singleForm, setSingleForm] = useState<FormStateSingle>({
    autoGenerate: true,
    floorNumber: '',
    unitCode: '',
    status: 'active',
  });

  const [batchForm, setBatchForm] = useState<FormStateBatch>({
    floorNumber: '',
    quantity: '10',
  });

  const [multiForm, setMultiForm] = useState<FormStateMulti>({
    startFloor: '',
    endFloor: '',
    unitsPerFloor: '8',
    prefix: '',
  });

  const [loading, setLoading] = useState(false);

  // Quick selectors
  const quantityOptions = ['5', '10', '15', '20', '25'];
  const unitsPerFloorOptions = ['4', '6', '8', '10', '12'];

  // ── Single Unit ─────────────────────────────────────────────────────────────
  const singlePreviewCode = useMemo(() => {
    if (!singleForm.autoGenerate || !singleForm.floorNumber) return null;
    // Very basic preview logic — in real app you'd call suggestNextUnitCode query
    const floor = singleForm.floorNumber.padStart(2, '0');
    return `${floor}01`; // placeholder — replace with real suggestion
  }, [singleForm.autoGenerate, singleForm.floorNumber]);

  // ── Batch ───────────────────────────────────────────────────────────────────
  const batchPreview = useMemo(() => {
    if (!batchForm.floorNumber || !batchForm.quantity) return null;
    const floor = batchForm.floorNumber.padStart(2, '0');
    const qty = Number(batchForm.quantity);
    if (qty <= 0) return null;
    const start = 1;
    const end = qty;
    return `${floor}${start.toString().padStart(2, '0')} – ${floor}${end.toString().padStart(2, '0')}`;
  }, [batchForm.floorNumber, batchForm.quantity]);

  // ── Multi-Floor ─────────────────────────────────────────────────────────────
  const multiSummary = useMemo(() => {
    const start = Number(multiForm.startFloor);
    const end = Number(multiForm.endFloor);
    const perFloor = Number(multiForm.unitsPerFloor);

    if (isNaN(start) || isNaN(end) || isNaN(perFloor) || start > end) return null;

    const totalFloors = end - start + 1;
    const totalUnits = totalFloors * perFloor;

    const examples: string[] = [];
    for (let f = start; f <= Math.min(start + 2, end); f++) {
      const floorStr = f.toString().padStart(2, '0');
      examples.push(`${multiForm.prefix || ''}${floorStr}01, ${multiForm.prefix || ''}${floorStr}02...`);
    }
    if (end > start + 2) examples.push('...');

    return { totalFloors, perFloor, totalUnits, examples };
  }, [multiForm.startFloor, multiForm.endFloor, multiForm.unitsPerFloor, multiForm.prefix]);

  const isMultiOverLimit = multiSummary && multiSummary.totalUnits > 200;

  const handleCreate = async () => {
    setLoading(true);
    
    // const result = await createRoomUnit({
    //   variables: {
    //     floor_number: 
    //   }
    // })
    // In real implementation → call createRoomUnit or batchCreateUnits mutation

    try {
      // Placeholder success simulation
      // await new Promise((r) => setTimeout(r, 1200));
      let input:InputType = {
        room_type_id: parseInt(roomTypeId)
      }
      switch (method) {
        case 'batch': {
          input.quantity = parseInt(batchForm.quantity)
          input.floor_number = parseInt(batchForm.floorNumber)
          break
        }
        case 'single': {
          input.floor_number = parseInt(singleForm.floorNumber)
          input.auto_generate_code = singleForm.autoGenerate
          input.status = singleForm.status
          input.unit_code = singleForm.unitCode
          break
        }
      }

      const result = await createRoomUnit({
        variables: {input}
      })

      console.log({result: result.data?.createRoomUnit?.success})


      if(!result.data?.createRoomUnit?.success) {
        throw new Error(result.data?.CreateRoomUnit.message)
      }

      Alert.alert('Success', 'Units created successfully', [
        {
          text: 'View Units',
          onPress: () => {
            router.replace({
              pathname: '/listing/units',
              params: { id: roomTypeId },
            });
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to create units')
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    if (method === 'single') {
      if (singleForm.autoGenerate) {
        return !!singleForm.floorNumber && !!singleForm.status;
      }
      return !!singleForm.floorNumber && !!singleForm.unitCode.trim() && !!singleForm.status;
    }

    if (method === 'batch') {
      return !!batchForm.floorNumber && Number(batchForm.quantity) > 0;
    }

    if (method === 'multi-floor') {
      const start = Number(multiForm.startFloor);
      const end = Number(multiForm.endFloor);
      const per = Number(multiForm.unitsPerFloor);
      return !isNaN(start) && !isNaN(end) && !isNaN(per) && start <= end && per > 0;
    }

    return false;
  };

  const renderSingleForm = () => (
    <View style={styles.formCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Single Unit</Text>

      {/* Toggle Auto / Manual */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            singleForm.autoGenerate && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setSingleForm((p) => ({ ...p, autoGenerate: true }))}
        >
          <Text style={[styles.toggleText, { color: singleForm.autoGenerate ? '#fff' : theme.colors.text }]}>
            Auto-generate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            !singleForm.autoGenerate && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setSingleForm((p) => ({ ...p, autoGenerate: false }))}
        >
          <Text style={[styles.toggleText, { color: !singleForm.autoGenerate ? '#fff' : theme.colors.text }]}>
            Manual code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floor */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Floor Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        value={singleForm.floorNumber}
        onChangeText={(v) => setSingleForm((p) => ({ ...p, floorNumber: v.replace(/\D/g, '') }))}
        keyboardType="number-pad"
        placeholder="e.g. 3"
        placeholderTextColor={theme.colors.textSecondary + '80'}
      />

      {/* Manual code */}
      {!singleForm.autoGenerate && (
        <>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Unit Code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={singleForm.unitCode}
            onChangeText={(v) => setSingleForm((p) => ({ ...p, unitCode: v.toUpperCase() }))}
            placeholder="e.g. 301A"
            placeholderTextColor={theme.colors.textSecondary + '80'}
            autoCapitalize="characters"
          />
        </>
      )}

      {/* Status */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Initial Status</Text>
      <View style={styles.statusRow}>
        {(['active', 'maintenance', 'inactive'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusOption,
              { backgroundColor: theme.colors.card },
              singleForm.status === s && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setSingleForm((p) => ({ ...p, status: s }))}
          >
            <Text style={[styles.statusOptionText, { color: theme.colors.text }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview */}
      {singleForm.autoGenerate && singlePreviewCode && (
        <View style={[styles.previewBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={[styles.previewLabel, { color: theme.colors.primary }]}>
            Preview unit code:
          </Text>
          <Text style={[styles.previewValue, { color: theme.colors.text }]}>{singlePreviewCode}</Text>
        </View>
      )}
    </View>
  );

  const renderBatchForm = () => (
    <View style={styles.formCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Batch Creation (Same Floor)</Text>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Floor Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        value={batchForm.floorNumber}
        onChangeText={(v) => setBatchForm((p) => ({ ...p, floorNumber: v.replace(/\D/g, '') }))}
        keyboardType="number-pad"
        placeholder="e.g. 4"
        placeholderTextColor={theme.colors.textSecondary + '80'}
      />

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Number of Units</Text>
      <View style={styles.quickSelectorRow}>
        {quantityOptions.map((q) => (
          <TouchableOpacity
            key={q}
            style={[
              styles.quickBtn,
              { backgroundColor: theme.colors.card },
              batchForm.quantity === q && { backgroundColor: theme.colors.primary + '30', borderColor: theme.colors.primary },
            ]}
            onPress={() => setBatchForm((p) => ({ ...p, quantity: q }))}
          >
            <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, marginTop: 8 }]}
        value={batchForm.quantity}
        onChangeText={(v) => setBatchForm((p) => ({ ...p, quantity: v.replace(/\D/g, '') }))}
        keyboardType="number-pad"
        placeholder="Custom quantity"
        placeholderTextColor={theme.colors.textSecondary + '80'}
      />

      {batchPreview && (
        <View style={[styles.previewBox, { backgroundColor: theme.colors.primary + '10', marginTop: 16 }]}>
          <Text style={[styles.previewLabel, { color: theme.colors.primary }]}>Units range:</Text>
          <Text style={[styles.previewValue, { color: theme.colors.text }]}>{batchPreview}</Text>
        </View>
      )}

      <Text style={[styles.totalCount, { color: theme.colors.textSecondary }]}>
        Total units to create: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{batchForm.quantity || 0}</Text>
      </Text>
    </View>
  );

  const renderMultiFloorForm = () => (
    <View style={styles.formCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Multi-Floor Setup</Text>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Start Floor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={multiForm.startFloor}
            onChangeText={(v) => setMultiForm((p) => ({ ...p, startFloor: v.replace(/\D/g, '') }))}
            keyboardType="number-pad"
            placeholder="1"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>End Floor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={multiForm.endFloor}
            onChangeText={(v) => setMultiForm((p) => ({ ...p, endFloor: v.replace(/\D/g, '') }))}
            keyboardType="number-pad"
            placeholder="5"
          />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Units per Floor</Text>
      <View style={styles.quickSelectorRow}>
        {unitsPerFloorOptions.map((q) => (
          <TouchableOpacity
            key={q}
            style={[
              styles.quickBtn,
              { backgroundColor: theme.colors.card },
              multiForm.unitsPerFloor === q && { backgroundColor: theme.colors.primary + '30', borderColor: theme.colors.primary },
            ]}
            onPress={() => setMultiForm((p) => ({ ...p, unitsPerFloor: q }))}
          >
            <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 12 }]}>Prefix (optional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        value={multiForm.prefix}
        onChangeText={(v) => setMultiForm((p) => ({ ...p, prefix: v.toUpperCase() }))}
        placeholder="e.g. A, VIP, S"
        autoCapitalize="characters"
        maxLength={4}
      />

      {multiSummary && (
        <View style={[styles.summaryBox, { backgroundColor: theme.colors.card, marginTop: 20 }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.textSecondary }}>Total floors:</Text>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{multiSummary.totalFloors}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.textSecondary }}>Units per floor:</Text>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{multiSummary.perFloor}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.textSecondary }}>Total units:</Text>
            <Text style={{ color: isMultiOverLimit ? theme.colors.error : theme.colors.text, fontWeight: '700' }}>
              {multiSummary.totalUnits}
            </Text>
          </View>

          <Text style={[styles.examplesTitle, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            Example codes:
          </Text>
          {multiSummary.examples.map((ex, i) => (
            <Text key={i} style={{ color: theme.colors.text, marginTop: 4 }}>
              {ex}
            </Text>
          ))}

          {isMultiOverLimit && (
            <Text style={{ color: theme.colors.error, marginTop: 16, fontWeight: '600' }}>
              Warning: Creating more than 200 units at once may take a few moments.
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const titleByMethod: Record<CreationMethod, string> = {
    single: 'Create Single Unit',
    batch: 'Batch Create Units',
    'multi-floor': 'Multi-Floor Configuration',
  };

  return (
    <View
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerStep, { color: theme.colors.textSecondary }]}>Step 2 of 2</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{titleByMethod[method]}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '100%' }]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {method === 'single' && renderSingleForm()}
          {method === 'batch' && renderBatchForm()}
          {method === 'multi-floor' && renderMultiFloorForm()}

          {/* Info / legal note */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Unit codes must be unique per room type. System will validate before saving.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomNav, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
              (!canSubmit() || loading) && { opacity: 0.5 },
            ]}
            disabled={!canSubmit() || loading}
            onPress={handleCreate}
          >
            {loading ? (
              <Text style={styles.createButtonText}>Creating...</Text>
            ) : (
              <>
                <Text style={styles.createButtonText}>Create Units</Text>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 16 },
  headerContent: { flex: 1 },
  headerStep: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  progressContainer: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: { height: '100%' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  formCard: {
    backgroundColor: '#fff', // will be overridden
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0', // overridden
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleText: { fontWeight: '600', fontSize: 15 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusOptionText: { fontWeight: '600', textTransform: 'capitalize' },
  quickSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickBtnText: { fontWeight: '600' },
  previewBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  previewValue: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  summaryBox: { padding: 20, borderRadius: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 15,
  },
  examplesTitle: { fontSize: 14, fontWeight: '600' },
  totalCount: { fontSize: 15, marginTop: 12, textAlign: 'center' },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', marginBottom: 20 },
});