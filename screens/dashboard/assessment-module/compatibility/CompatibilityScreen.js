import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import HardwarePickerModal from '../HardwarePickerModal';

const DEFAULT_COMPATIBILITY = [
  {
    left: {
      icon: require('../../../../assets/part_icons/MOBO.png'),
      label: 'Motherboard',
      value: 'Gigabyte-A320M-S2H',
    },
    right: {
      icon: require('../../../../assets/part_icons/GPU.png'),
      label: 'Video Card',
    },
  },
  {
    left: {
      icon: require('../../../../assets/part_icons/CASE.png'),
      label: 'Case',
      value: 'Corsair 4000D Airflow ATX',
    },
    right: {
      icon: require('../../../../assets/part_icons/MOBO.png'),
      label: 'Motherboard',
    },
  },
  {
    left: {
      icon: require('../../../../assets/part_icons/RAM.png'),
      label: 'Random Access Memory',
      value: 'SAMSUNG 8GB DDR4 2400MHZ',
    },
    right: {
      icon: require('../../../../assets/part_icons/MOBO.png'),
      label: 'Motherboard',
    },
  },
  {
    left: {
      icon: require('../../../../assets/part_icons/MOBO.png'),
      label: 'Motherboard',
      value: 'Gigabyte-A320M-S2H',
    },
    right: {
      icon: require('../../../../assets/part_icons/CPU.png'),
      label: 'Processor',
    },
  },
];

const cpuOptions = [
  { label: 'Sample Hardware 1', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 2', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 3', icon: require('../../../../assets/part_icons/CPU.png') },
];

export default function CompatibilityScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState({}); 

  const handleSearch = (item) => {
    alert(`Search placeholder for ${item.label}`);
  };

  const handleAdd = (item, idx) => {
    setSelectedRow(idx);
    setModalVisible(true);
  };

  const handleRemove = (idx) => {
    setSelectedHardware((prev) => {
      const updated = { ...prev };
      delete updated[idx];
      return updated;
    });
  };

  const handleSelectHardware = (hardware) => {
    setSelectedHardware((prev) => ({
      ...prev,
      [selectedRow]: hardware,
    }));
    setModalVisible(false);
    setSearch('');
  };

  const filteredOptions = cpuOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Role check
  const isFacilitator = user?.userType === 'facilitator';

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        {isFacilitator ? (
          // Facilitator View
          <View style={styles.container}>
            <Text style={styles.header}>CREATE COMPATIBILITY ASSESSMENT</Text>
            <TouchableOpacity
              style={styles.createAssessmentBtn}
              onPress={() => navigation.navigate('CreateCompatibilityScreen', { user })}
            >
              <Text style={styles.createAssessmentBtnText}>＋ Create New Assessment</Text>
            </TouchableOpacity>
            <Text style={{color: '#666', marginTop: 32}}>
              Created assessments will appear here (static demo)
            </Text>
          </View>
        ) : (
          // Participant View
          <View style={styles.container}>
            <Text style={styles.header}>COMPATIBILITY ASSESSMENT</Text>
            <View style={styles.grid}>
              {DEFAULT_COMPATIBILITY.map((row, idx) => (
                <View key={idx} style={styles.row}>
                  {/* Left Card with specific hardware */}
                  <View style={styles.card}>
                    <View style={styles.cardLeft}>
                      <Image source={row.left.icon} style={styles.icon} />
                      <View>
                        <Text style={styles.cardLabel}>{row.left.label}</Text>
                        <Text style={styles.cardValue}>{row.left.value}</Text>
                      </View>
                    </View>
                  </View>
                  {/* Compatible To */}
                  <View style={styles.compatibleTo}>
                    <Text style={styles.compatibleText}>COMPATIBLE TO:</Text>
                  </View>
                  {/* Right Card for selecting compatible hardware */}
                  <View style={styles.card}>
                    <View style={styles.cardLeft}>
                      <Image source={row.right.icon} style={styles.icon} />
                      <Text style={styles.cardLabel}>{row.right.label}</Text>
                      {selectedHardware[idx] && (
                        <View style={styles.selectedHardware}>
                          <Image source={selectedHardware[idx].icon} style={styles.selectedIcon} />
                          <Text style={styles.selectedLabel}>{selectedHardware[idx].label}</Text>
                        </View>
                      )}
                    </View>
                    {/* Add/Remove buttons for hardware selection */}
                    {selectedHardware[idx] ? (
                      <TouchableOpacity
                        style={[styles.iconButton, styles.removeButton]}
                        onPress={() => handleRemove(idx)}
                      >
                        <Text style={styles.iconButtonText}>－</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.iconButton, styles.addButton]}
                        onPress={() => handleAdd(row.right, idx)}
                      >
                        <Text style={styles.iconButtonText}>＋</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={() => alert('Answers submitted (static demo)')}
            >
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        )}

      
        <HardwarePickerModal
          visible={modalVisible}
          title="PICK A COMPATIBLE CPU"
          search={search}
          setSearch={setSearch}
          options={filteredOptions}
          onSelect={handleSelectHardware}
          onClose={() => setModalVisible(false)}
          styles={styles}
        />
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ededed',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ededed',
    padding: 24,
    alignItems: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 24,
    marginLeft: 4,
  },
  grid: {
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#888',
    borderRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minWidth: 340,
    maxWidth: 420,
    flex: 1.5,
    marginRight: 18,
    marginLeft: 4,
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: 'contain',
  },
  cardLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  cardValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  iconButton: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    padding: 8,
    marginLeft: 10,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    backgroundColor: '#FFD305',
  },
  compatibleTo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  compatibleText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  submitButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    letterSpacing: 1,
  },
  selectedHardware: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  selectedIcon: {
    width: 22,
    height: 22,
    marginRight: 6,
    resizeMode: 'contain',
  },
  selectedLabel: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 340,
    width: 340,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#ededed',
  },
  hardwareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  hardwareIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    resizeMode: 'contain',
  },
  hardwareLabel: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  infoIcon: {
    fontSize: 18,
    color: '#222',
    marginLeft: 8,
  },
  returnBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  returnBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  removeButton: {
    backgroundColor: '#FFD305',
  },
  createAssessmentBtn: {
    position: 'absolute',
    top: 24,
    right: 32,
    zIndex: 20,
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
  },
  createAssessmentBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

