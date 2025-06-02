import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ScrollView } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import HardwarePickerModal from '../HardwarePickerModal';

const PARTS = [
  { label: 'Motherboard', icon: require('../../../../assets/part_icons/MOBO.png') },
  { label: 'Processor', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Processor Cooling Fan', icon: require('../../../../assets/part_icons/FAN.png') },
  { label: 'Storage', icon: require('../../../../assets/part_icons/STORAGE.png') },
  { label: 'Video Card', icon: require('../../../../assets/part_icons/GPU.png') },
  { label: 'Random Access Memory', icon: require('../../../../assets/part_icons/RAM.png') },
  { label: 'Power Supply', icon: require('../../../../assets/part_icons/PSU.png') },
  { label: 'Case', icon: require('../../../../assets/part_icons/CASE.png') },
];

const hardwareOptions = [
  { label: 'Sample Hardware 1', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 2', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Sample Hardware 3', icon: require('../../../../assets/part_icons/CPU.png') },
];

export default function FinalAssessmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const isFacilitator = user?.userType === 'facilitator';
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPartIdx, setSelectedPartIdx] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [costLimit, setCostLimit] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [useCase, setUseCase] = useState('Gaming');
  const [psuLimit, setPsuLimit] = useState('500');
  const [brand, setBrand] = useState('Ryzen');

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
            style={styles.createAssessmentBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.createAssessmentBtnText}>＋ Create Assessment</Text>
          </TouchableOpacity>
        )}
        <View style={styles.container}>
          <Text style={styles.header}>ASSESSMENT : FINAL</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoText}>COST LIMIT : 50,000 PHP</Text>
              <Text style={styles.infoText}>USE CASE : GAMING</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoText}>POWER SUPPLY LIMIT : 500 WATTS</Text>
              <Text style={styles.infoText}>REQUIRED BRAND : RYZEN</Text>
            </View>
          </View>
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
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigation.navigate('FinalAssessmentAssemblyScreen', { user })}
          >
            <Text style={styles.submitButtonText}>CONTINUE TO ASSEMBLY</Text>
          </TouchableOpacity>
        </View>
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
        {/* Modal for Create Assessment */}
        <Modal
          visible={createModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCreateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Create Final Assessment</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>COST LIMIT:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={costLimit}
                  onChangeText={setCostLimit}
                />
                <TouchableOpacity
                  style={[
                    styles.currencyBtn,
                    currency === 'PHP' && styles.currencyBtnActive,
                  ]}
                  onPress={() => setCurrency('PHP')}
                >
                  <Text style={styles.currencyIcon}>₱</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.currencyBtn,
                    currency === 'USD' && styles.currencyBtnActive,
                  ]}
                  onPress={() => setCurrency('USD')}
                >
                  <Text style={styles.currencyIcon}>$</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>USE CASE:</Text>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    useCase === 'Gaming' && styles.selectBtnActive,
                  ]}
                  onPress={() => setUseCase('Gaming')}
                >
                  <Text style={styles.selectBtnText}>Gaming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    useCase === 'Workstation' && styles.selectBtnActive,
                  ]}
                  onPress={() => setUseCase('Workstation')}
                >
                  <Text style={styles.selectBtnText}>Workstation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    useCase === 'Multimedia Editor' && styles.selectBtnActive,
                  ]}
                  onPress={() => setUseCase('Multimedia Editor')}
                >
                  <Text style={styles.selectBtnText}>Multimedia Editor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    useCase === 'School' && styles.selectBtnActive,
                  ]}
                  onPress={() => setUseCase('School')}
                >
                  <Text style={styles.selectBtnText}>School</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>POWER SUPPLY LIMIT:</Text>
                {['300', '500', '750', '1000', '1250'].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[
                      styles.selectBtn,
                      psuLimit === w && styles.selectBtnActive,
                    ]}
                    onPress={() => setPsuLimit(w)}
                  >
                    <Text style={styles.selectBtnText}>{w}W</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>REQUIRED BRAND:</Text>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    brand === 'Ryzen' && styles.selectBtnActive,
                  ]}
                  onPress={() => setBrand('Ryzen')}
                >
                  <Text style={styles.selectBtnText}>Ryzen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    brand === 'Intel' && styles.selectBtnActive,
                  ]}
                  onPress={() => setBrand('Intel')}
                >
                  <Text style={styles.selectBtnText}>Intel</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.assessmentModalBtnRow}>
                <TouchableOpacity
                  style={styles.returnBtn}
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text style={styles.returnBtnText}>Return</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deployBtn}
                  onPress={() => {
                    setCreateModalVisible(false);
                    alert('Assessment Created\n' +
                      `COST LIMIT: ${currency === 'PHP' ? '₱' : '$'}${costLimit}\n` +
                      `USE CASE: ${useCase}\n` +
                      `POWER SUPPLY LIMIT: ${psuLimit}W\n` +
                      `REQUIRED BRAND: ${brand}`
                    );
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  infoCol: {
    flex: 1,
    marginRight: 24,
  },
  infoText: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
    color: '#111',
  },
  divider: {
    height: 1,
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
    minWidth: 640,
    maxWidth: 1200,
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
    left: 24,
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
    minWidth: 620,
    maxWidth: 640,
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
  createAssessmentBtn: {
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
  createAssessmentBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginRight: 8,
    minWidth: 110,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#ededed',
    width: 80,
    marginRight: 6,
    color: '#222',
  },
  currencyBtn: {
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 4,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  currencyBtnActive: {
    backgroundColor: '#FFD305',
    borderColor: '#FFD305',
  },
  currencyIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  selectBtn: {
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 4,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  selectBtnActive: {
    backgroundColor: '#FFD305',
    borderColor: '#FFD305',
  },
  selectBtnText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  assessmentModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 12,
    marginTop: 10,
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

