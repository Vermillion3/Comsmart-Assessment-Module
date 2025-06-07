import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ScrollView, Alert } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HardwarePickerModal from '../HardwarePickerModal';
import RAMSlotsModal from '../part-picker/RAMSlotsModal';

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

  // Assessment creation state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [costLimit, setCostLimit] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [useCase, setUseCase] = useState('');
  const [psuLimit, setPsuLimit] = useState('');
  const [brand, setBrand] = useState('');
  const [constraintsSet, setConstraintsSet] = useState(false);

  // Part-picker state
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPartIdx, setSelectedPartIdx] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState({});
  const [showRamSlotsModal, setShowRamSlotsModal] = useState(false);
  const [selectedRamModules, setSelectedRamModules] = useState({});
  const [currentRamSlot, setCurrentRamSlot] = useState(null);

  // Deployment state
  const [deployed, setDeployed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [finalAssessments, setFinalAssessments] = useState([]);
  const [deployedAssessmentId, setDeployedAssessmentId] = useState(null);

  // Submission state for participants
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);

  // Load all deployed final assessments
  useEffect(() => {
    const loadDeployed = async () => {
      const stored = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
      if (stored) setFinalAssessments(JSON.parse(stored));
    };
    loadDeployed();
  }, [showConfirm]);

  // Load assessment by ID if assessmentId param is present
  useEffect(() => {
    const loadAssessment = async () => {
      if (route.params?.assessmentId) {
        const stored = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
        if (stored) {
          const assessments = JSON.parse(stored);
          const found = assessments.find(a => a.id === route.params.assessmentId);
          if (found) {
            setCostLimit(found.costLimit);
            setCurrency(found.currency);
            setUseCase(found.useCase);
            setPsuLimit(found.psuLimit);
            setBrand(found.brand);
            setConstraintsSet(true);
            setDeployed(true);
            setDeployedAssessmentId(found.id);
            // Load participant's submission if exists
            if (found.submissions && user && user.id) {
              const mine = found.submissions.find(s => s.userId === user.id);
              setMySubmission(mine || null);
              if (mine) {
                setSelectedHardware(mine.selectedHardware || {});
                setSelectedRamModules(mine.selectedRamModules || {});
              }
            }
          }
        }
      }
    };
    loadAssessment();
  }, [route.params?.assessmentId, user?.id]);

  // Load submissions for facilitator
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!deployedAssessmentId) return;
      const stored = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
      if (stored) {
        const assessments = JSON.parse(stored);
        const found = assessments.find(a => a.id === deployedAssessmentId);
        setSubmissions(found?.submissions || []);
      }
    };
    loadSubmissions();
  }, [deployedAssessmentId, showConfirm, mySubmission]);

  // Handle constraints set
  const handleSetConstraints = () => {
    if (!costLimit || !useCase || !psuLimit || !brand) {
      Alert.alert('Error', 'Please fill in all constraints.');
      return;
    }
    setConstraintsSet(true);
    setCreateModalVisible(false);
  };

  // Handle deploy
  const handleDeploy = async () => {
    const assessment = {
      id: `final_${Date.now()}`,
      costLimit,
      currency,
      useCase,
      psuLimit,
      brand,
      createdAt: new Date().toISOString(),
      submissions: [],
    };
    let updated = [];
    const stored = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
    if (stored) updated = JSON.parse(stored);
    updated.push(assessment);
    await AsyncStorage.setItem('DEPLOYED_FINAL_ASSESSMENTS', JSON.stringify(updated));
    setDeployed(true);
    setShowConfirm(true);
    setDeployedAssessmentId(assessment.id);
  };

  // Part-picker handlers
  const handleAdd = (idx) => {
    const part = PARTS[idx];
    if (part.label === 'Random Access Memory') {
      setSelectedPartIdx(idx);
      setShowRamSlotsModal(true);
      return;
    }
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

  // RAM slot handlers
  const handleRamSlotSelect = (slotIdx, hardware = undefined) => {
    if (hardware === null) {
      setSelectedRamModules(prev => {
        const updated = { ...prev };
        delete updated[slotIdx];
        return updated;
      });
      return;
    }
    if (hardware === undefined) {
      setCurrentRamSlot(slotIdx);
      setModalVisible(true);
    }
  };

  useEffect(() => {
    if (currentRamSlot !== null && selectedPartIdx !== null && modalVisible === false) {
      if (selectedHardware[selectedPartIdx]) {
        setSelectedRamModules(prev => ({
          ...prev,
          [currentRamSlot]: selectedHardware[selectedPartIdx]
        }));
        setCurrentRamSlot(null);
      }
    }
  }, [modalVisible]);

  const filteredOptions = hardwareOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const leftParts = PARTS.slice(0, 4);
  const rightParts = PARTS.slice(4);

  // Submission handler for participant
  const handleSubmitAssessment = async () => {
    if (!deployedAssessmentId) return;
    const submission = {
      userId: user.id,
      name: user.username || user.emailAddress || 'Anonymous',
      submittedAt: new Date().toISOString(),
      selectedHardware,
      selectedRamModules,
    };
    let updated = [];
    const stored = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
    if (stored) {
      updated = JSON.parse(stored);
      const idx = updated.findIndex(a => a.id === deployedAssessmentId);
      if (idx !== -1) {
        // Remove previous submission by this user
        updated[idx].submissions = (updated[idx].submissions || []).filter(s => s.userId !== user.id);
        updated[idx].submissions.push(submission);
        await AsyncStorage.setItem('DEPLOYED_FINAL_ASSESSMENTS', JSON.stringify(updated));
        setMySubmission(submission);
        Alert.alert('Submitted', 'Your assessment has been submitted.');
      }
    }
  };

  // UI rendering
  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        {/* Facilitator: Create Assessment Button */}
        {isFacilitator && !constraintsSet && (
          <TouchableOpacity
            style={styles.createAssessmentBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.createAssessmentBtnText}>＋ Create Final Assessment</Text>
          </TouchableOpacity>
        )}

        {/* Constraints summary */}
        {constraintsSet && (
          <View style={styles.constraintsSummary}>
            <Text style={styles.header}>ASSESSMENT : FINAL</Text>
            <Text style={styles.infoText}>COST LIMIT: {currency === 'PHP' ? '₱' : '$'}{costLimit}</Text>
            <Text style={styles.infoText}>USE CASE: {useCase}</Text>
            <Text style={styles.infoText}>POWER SUPPLY LIMIT: {psuLimit}W</Text>
            <Text style={styles.infoText}>REQUIRED BRAND: {brand}</Text>
          </View>
        )}

        {/* Part-picker UI for both facilitator and participant */}
        {constraintsSet && (!deployed || (deployed && route.params?.assessmentId)) && (
          <View style={styles.container}>
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
                      {(!deployed || !mySubmission) && (
                        selectedHardware[idx] ? (
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
                        )
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
                        {/* RAM slot indicator */}
                        {part.label === 'Random Access Memory' && (
                          <View style={styles.slotContainer}>
                            {[...Array(4)].map((_, slotIdx) => (
                              <View 
                                key={slotIdx}
                                style={[
                                  styles.slot,
                                  selectedRamModules[slotIdx] ? styles.slotFilled : styles.slotEmpty
                                ]}
                              >
                                <Text style={styles.slotText}>
                                  {selectedRamModules[slotIdx] ? '■' : '□'}
                                </Text>
                              </View>
                            ))}
                            <Text style={styles.slotCounter}>
                              {`${Object.keys(selectedRamModules).length}/4`}
                            </Text>
                          </View>
                        )}
                      </View>
                      {(!deployed || !mySubmission) && (
                        selectedHardware[idx + 4] ? (
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
                        )
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {/* RAM Slots Modal */}
            <RAMSlotsModal
              visible={showRamSlotsModal}
              onClose={() => setShowRamSlotsModal(false)}
              onSelect={handleRamSlotSelect}
              selectedRamModules={selectedRamModules}
              motherboardInfo={{
                name: 'Gigabyte-A320M-S2H',
                totalRamSlots: 4,
              }}
            />
            {/* Hardware Picker Modal */}
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
            {/* Deploy Button for facilitator */}
            {!deployed && isFacilitator && (
              <TouchableOpacity
                style={styles.deployButton}
                onPress={handleDeploy}
              >
                <Text style={styles.deployButtonText}>DEPLOY ASSESSMENT</Text>
              </TouchableOpacity>
            )}
            {/* Submit Button for participant */}
            {deployed && !isFacilitator && !mySubmission && (
              <TouchableOpacity
                style={styles.deployButton}
                onPress={handleSubmitAssessment}
              >
                <Text style={styles.deployButtonText}>SUBMIT ASSESSMENT</Text>
              </TouchableOpacity>
            )}
            {/* Show submitted message for participant */}
            {deployed && !isFacilitator && mySubmission && (
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>Submitted!</Text>
              </View>
            )}
          </View>
        )}

        {/* Confirmation modal */}
        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Assessment Deployed!</Text>
              <Text style={styles.modalText}>
                The final assessment has been deployed and is now available for participants.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowConfirm(false);
                  setConstraintsSet(false);
                  setDeployed(false);
                  setSelectedHardware({});
                  setSelectedRamModules({});
                  setCostLimit('');
                  setUseCase('');
                  setPsuLimit('');
                  setBrand('');
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Create Assessment Modal */}
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
                {['Gaming', 'Workstation', 'Multimedia Editor', 'School'].map((uc) => (
                  <TouchableOpacity
                    key={uc}
                    style={[
                      styles.selectBtn,
                      useCase === uc && styles.selectBtnActive,
                    ]}
                    onPress={() => setUseCase(uc)}
                  >
                    <Text style={styles.selectBtnText}>{uc}</Text>
                  </TouchableOpacity>
                ))}
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
                {['Ryzen', 'Intel'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.selectBtn,
                      brand === b && styles.selectBtnActive,
                    ]}
                    onPress={() => setBrand(b)}
                  >
                    <Text style={styles.selectBtnText}>{b}</Text>
                  </TouchableOpacity>
                ))}
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
                  onPress={handleSetConstraints}
                >
                  <Text style={styles.deployBtnText}>Set Constraints</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Facilitator: Show submissions list */}
        {isFacilitator && deployed && (
          <View style={styles.submissionsBox}>
            <Text style={styles.submissionsHeader}>Participant Results</Text>
            {submissions.length === 0 && (
              <Text style={styles.noSubmissionsText}>No submissions yet.</Text>
            )}
            {submissions.map((sub, idx) => (
              <View key={idx} style={styles.submissionRow}>
                <Text style={styles.submissionName}>{sub.name}</Text>
                <Text style={styles.submissionDate}>
                  Submitted: {new Date(sub.submittedAt).toLocaleString()}
                </Text>
                <Text style={styles.scoreText}>Parts: {Object.keys(sub.selectedHardware || {}).length}, RAM: {Object.keys(sub.selectedRamModules || {}).length}</Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    Alert.alert(
                      'Participant Submission',
                      `Parts:\n${Object.entries(sub.selectedHardware || {}).map(([idx, hw]) => `${PARTS[idx]?.label}: ${hw.label}`).join('\n')}\n\nRAM:\n${Object.entries(sub.selectedRamModules || {}).map(([slot, hw]) => `Slot ${parseInt(slot) + 1}: ${hw.label}`).join('\n')}`
                    );
                  }}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  constraintsSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 24,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  slot: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFD305',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  slotFilled: {
    backgroundColor: '#FFD305',
  },
  slotEmpty: {
    backgroundColor: '#fff',
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  slotCounter: {
    fontSize: 14,
    color: '#222',
    marginLeft: 8,
  },
  modalButton: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionnaireContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ededed',
    padding: 24,
    alignItems: 'flex-start',
  },
  questionnaire: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  questionnaireHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    color: '#222',
  },
  questionCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#222',
  },
  choiceBtn: {
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  choiceBtnSelected: {
    backgroundColor: '#FFD305',
    borderColor: '#FFD305',
  },
  choiceBtnCorrect: {
    backgroundColor: '#c8e6c9',
    borderColor: '#2e7d32',
  },
  choiceText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  choiceTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  scoreBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2e7d32',
  },
  submissionsBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginTop: 24,
  },
  submissionsHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#222',
  },
  noSubmissionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  submissionRow: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submissionName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  submissionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  viewButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
});

