import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ScrollView, Switch } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute } from '@react-navigation/native';
import HardwarePickerModal from '../HardwarePickerModal';

const PARTS = [
  {
    label: 'Motherboard',
    icon: require('../../../../assets/part_icons/MOBO.png'),
  },
  {
    label: 'Processor',
    icon: require('../../../../assets/part_icons/CPU.png'),
  },
  {
    label: 'Processor Cooling Fan',
    icon: require('../../../../assets/part_icons/FAN.png'),
  },
  {
    label: 'Storage',
    icon: require('../../../../assets/part_icons/STORAGE.png'),
  },
  {
    label: 'Video Card',
    icon: require('../../../../assets/part_icons/GPU.png'),
  },
  {
    label: 'Random Access Memory',
    icon: require('../../../../assets/part_icons/RAM.png'),
  },
  {
    label: 'Power Supply',
    icon: require('../../../../assets/part_icons/PSU.png'),
  },
  {
    label: 'Case',
    icon: require('../../../../assets/part_icons/CASE.png'),
  },
];

const hardwareOptions = [
  { label: 'Sample Hardware 1', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 2', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 3', icon: require('../../../../assets/part_icons/CPU.png') },
];

export default function PartPickerScreen() {
  const route = useRoute();
  const user = route.params?.user;
  const isFacilitator = user?.userType === 'facilitator';

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPartIdx, setSelectedPartIdx] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState({}); 
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [priceLimitPeso, setPriceLimitPeso] = useState('');
  const [priceLimitDollar, setPriceLimitDollar] = useState('');
  const [cheatSheetEnabled, setCheatSheetEnabled] = useState(false);

  const handleAdd = (idx) => {
    setSelectedPartIdx(idx);
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
      [selectedPartIdx]: hardware,
    }));
    setModalVisible(false);
    setSearch('');
  };

  const filteredOptions = hardwareOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const leftParts = PARTS.slice(0, 4);
  const rightParts = PARTS.slice(4);

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        {isFacilitator && (
          <TouchableOpacity
            style={styles.addAssessmentBtn}
            onPress={() => setAssessmentModalVisible(true)}
          >
            <Text style={styles.addAssessmentBtnText}>＋ Add Assessment</Text>
          </TouchableOpacity>
        )}
        <View style={styles.container}>
          <Text style={styles.header}>ASSESSMENT : PART-PICKER</Text>
          <Text style={styles.subHeader}>COST LIMIT : 50,000 PHP</Text>
          <View style={styles.divider} />
          <View style={styles.grid}>
            <View style={styles.column}>
              {leftParts.map((part, idx) => (
                <View key={idx} style={styles.partRow}>
                  <View style={styles.partCard}>
                    <View style={styles.partLeft}>
                      <Image source={part.icon} style={styles.icon} />
                      <Text style={styles.partLabel}>{part.label}</Text>
                      {selectedHardware[idx] && (
                        <View style={styles.selectedHardware}>
                          <Image source={selectedHardware[idx].icon} style={styles.selectedIcon} />
                          <Text style={styles.selectedLabel}>{selectedHardware[idx].label}</Text>
                        </View>
                      )}
                    </View>
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
                        onPress={() => handleAdd(idx)}
                      >
                        <Text style={styles.iconButtonText}>＋</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.column}>
              {rightParts.map((part, idx) => (
                <View key={idx + 4} style={styles.partRow}>
                  <View style={styles.partCard}>
                    <View style={styles.partLeft}>
                      <Image source={part.icon} style={styles.icon} />
                      <Text style={styles.partLabel}>{part.label}</Text>
                      {selectedHardware[idx + 4] && (
                        <View style={styles.selectedHardware}>
                          <Image source={selectedHardware[idx + 4].icon} style={styles.selectedIcon} />
                          <Text style={styles.selectedLabel}>{selectedHardware[idx + 4].label}</Text>
                        </View>
                      )}
                    </View>
                    {selectedHardware[idx + 4] ? (
                      <TouchableOpacity
                        style={[styles.iconButton, styles.removeButton]}
                        onPress={() => handleRemove(idx + 4)}
                      >
                        <Text style={styles.iconButtonText}>－</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.iconButton, styles.addButton]}
                        onPress={() => handleAdd(idx + 4)}
                      >
                        <Text style={styles.iconButtonText}>＋</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={() => alert('Submissions and Recommendations placeholder')}>
            <Text style={styles.submitButtonText}>SUBMISSIONS AND RECOMMENDATIONS</Text>
          </TouchableOpacity>
        </View>
        {/* Modal for picking hardware */}
        <HardwarePickerModal
          visible={modalVisible}
          title="PICK A HARDWARE"
          search={search}
          setSearch={setSearch}
          options={filteredOptions}
          onSelect={handleSelectHardware}
          onClose={() => setModalVisible(false)}
          styles={styles}
        />
        {/* Modal for Add Assessment */}
        <Modal
          visible={assessmentModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAssessmentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Set Assessment Price Limit</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.currencyIcon}>₱</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Pesos"
                  keyboardType="numeric"
                  value={priceLimitPeso}
                  onChangeText={setPriceLimitPeso}
                />
                <Text style={[styles.currencyIcon, {marginLeft: 16}]}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Dollar"
                  keyboardType="numeric"
                  value={priceLimitDollar}
                  onChangeText={setPriceLimitDollar}
                />
              </View>
              <View style={styles.cheatSheetRow}>
                <Text style={styles.cheatSheetLabel}>Enable Cheat Sheet</Text>
                <Switch
                  value={cheatSheetEnabled}
                  onValueChange={setCheatSheetEnabled}
                />
              </View>
              <View style={styles.assessmentModalBtnRow}>
                <TouchableOpacity
                  style={styles.returnBtn}
                  onPress={() => setAssessmentModalVisible(false)}
                >
                  <Text style={styles.returnBtnText}>Return</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deployBtn}
                  onPress={() => {
                    setAssessmentModalVisible(false);
                    alert('Assessment Deployed');
                  }}
                >
                  <Text style={styles.deployBtnText}>Deploy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    marginBottom: 8,
    marginLeft: 4,
  },
  subHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    marginLeft: 4,
  },
  divider: {
    height: 2,
    backgroundColor: '#222',
    width: '100%',
    marginBottom: 18,
    marginTop: 8,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  partRow: {
    marginBottom: 24,
  },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#888',
    borderRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minWidth: 340,
    maxWidth: 600,
    justifyContent: 'space-between',
  },
  partLeft: {
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
  partLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
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
  removeButton: {
    backgroundColor: '#FFD305',
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
  submitButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
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
  addAssessmentBtn: {
    position: 'absolute',
    top: 24,
    right: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    zIndex: 20,
    elevation: 6,
  },
  addAssessmentBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
    justifyContent: 'center',
  },
  currencyIcon: {
    fontSize: 28,
    marginRight: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#ededed',
    width: 80,
    marginRight: 6,
  },
  cheatSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
    justifyContent: 'space-between',
  },
  cheatSheetLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  assessmentModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 12,
  },
  deployBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  deployBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
});

