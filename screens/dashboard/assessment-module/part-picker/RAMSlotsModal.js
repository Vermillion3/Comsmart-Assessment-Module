import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

export default function RAMSlotsModal({ visible, onClose, onSelect, motherboardInfo, selectedRamModules }) {
  const defaultMotherboardInfo = {
    name: 'Gigabyte-A320M-S2H',
    totalRamSlots: 4,
  };

  const info = motherboardInfo || defaultMotherboardInfo;
  const slots = Array(info.totalRamSlots).fill(null);
  const populatedCount = Object.keys(selectedRamModules || {}).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>RAM SLOTS</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Motherboard:</Text>
              <Text style={styles.infoValue}>{info.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Slots</Text>
                <Text style={styles.statValue}>{info.totalRamSlots}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Populated</Text>
                <Text style={styles.statValue}>{populatedCount}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>{info.totalRamSlots - populatedCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.slotsContainer}>
            {slots.map((_, idx) => (
              <View key={idx} style={styles.slotRow}>
                <View style={styles.slotLabel}>
                  <Text style={styles.slotNumber}>SLOT {idx + 1}</Text>
                  <Text style={styles.slotStatus}>
                    {selectedRamModules && selectedRamModules[idx] ? 'POPULATED' : 'EMPTY'}
                  </Text>
                </View>
                {selectedRamModules && selectedRamModules[idx] ? (
                  <View style={styles.populatedSlot}>
                    <Text style={styles.hardwareText}>{selectedRamModules[idx].label}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => onSelect(idx, null)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.emptySlot}
                    onPress={() => {
                      onSelect(idx);
                      onClose();
                    }}
                  >
                    <Text style={styles.addButtonText}>＋ Add RAM</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 480,
    maxWidth: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  slotsContainer: {
    gap: 12,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotLabel: {
    width: 100,
  },
  slotNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  slotStatus: {
    fontSize: 12,
    color: '#666',
  },
  populatedSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#81c784',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  hardwareText: {
    flex: 1,
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '500',
  },
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySlot: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFD305',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
