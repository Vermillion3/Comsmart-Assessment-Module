import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ScrollView, Switch, Alert } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import HardwarePickerModal from '../HardwarePickerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RAMSlotsModal from './RAMSlotsModal';

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
  const navigation = useNavigation();
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
  const [isAssessmentCreated, setIsAssessmentCreated] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deployedAssessment, setDeployedAssessment] = useState(null);
  const [priceLimitDisplay, setPriceLimitDisplay] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRamSlotsModal, setShowRamSlotsModal] = useState(false);
  const [selectedRamSlot, setSelectedRamSlot] = useState(null);
  const [selectedRamModules, setSelectedRamModules] = useState({});
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [currentRamSlot, setCurrentRamSlot] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scoreInput, setScoreInput] = useState('');
  const [mySubmission, setMySubmission] = useState(null);

  // Load existing assessment on mount
  React.useEffect(() => {
    const loadAssessment = async () => {
      try {
        if (route.params?.assessmentId) {
          const stored = await AsyncStorage.getItem('DEPLOYED_PART_PICKER');
          if (stored) {
            const assessments = JSON.parse(stored);
            const assessment = assessments.find(a => a.id === route.params.assessmentId);
            if (assessment) {
              setDeployedAssessment(assessment);
              setPriceLimitPeso(assessment.priceLimit);
              setPriceLimitDisplay(assessment.priceLimit);
              setIsAssessmentCreated(true);
            }
          }
        }
      } catch (error) {
        console.error('Load error:', error);
      }
    };

    loadAssessment();
  }, [route.params?.assessmentId]);

  // Load submissions from AsyncStorage
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!deployedAssessment) return;
      const stored = await AsyncStorage.getItem(`PART_PICKER_SUBMISSIONS_${deployedAssessment.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSubmissions(parsed);
        if (user && parsed) {
          const mine = parsed.find(s => s.userId === user.id);
          setMySubmission(mine);
        }
      }
    };
    loadSubmissions();
  }, [deployedAssessment, showResultsModal]);

  // Submission handler for participant
  const handleSubmitAssessment = async () => {
    if (!deployedAssessment) return;
    const submission = {
      userId: user.id,
      name: user.username || user.emailAddress || 'Anonymous',
      submittedAt: new Date().toISOString(),
      answers: {
        ram: selectedRamModules,
        parts: selectedHardware,
      },
      score: null,
    };
    let updated = [];
    const stored = await AsyncStorage.getItem(`PART_PICKER_SUBMISSIONS_${deployedAssessment.id}`);
    if (stored) {
      updated = JSON.parse(stored).filter(s => s.userId !== user.id);
    }
    updated.push(submission);
    await AsyncStorage.setItem(`PART_PICKER_SUBMISSIONS_${deployedAssessment.id}`, JSON.stringify(updated));
    setMySubmission(submission);
    Alert.alert('Submitted', 'Your assessment has been submitted.');
  };

  // Facilitator: Save score for a submission
  const handleSaveScore = async () => {
    if (!selectedSubmission || !deployedAssessment) return;
    let updated = [];
    const stored = await AsyncStorage.getItem(`PART_PICKER_SUBMISSIONS_${deployedAssessment.id}`);
    if (stored) {
      updated = JSON.parse(stored).map(s =>
        s.userId === selectedSubmission.userId
          ? { ...s, score: scoreInput }
          : s
      );
      await AsyncStorage.setItem(`PART_PICKER_SUBMISSIONS_${deployedAssessment.id}`, JSON.stringify(updated));
      setSubmissions(updated);
      setShowResultsModal(false);
      setScoreInput('');
      setSelectedSubmission(null);
      Alert.alert('Saved', 'Score has been saved.');
    }
  };

  // Modify handleAdd for RAM selection
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

  // Add handleRamSlotSelect
  const handleRamSlotSelect = (slotIdx, hardware = undefined) => {
    if (hardware === null) {
      // Remove hardware from slot
      setSelectedRamModules(prev => {
        const updated = { ...prev };
        delete updated[slotIdx];
        return updated;
      });
      return;
    }

    if (hardware === undefined) {
      // Open hardware picker for this slot
      setCurrentRamSlot(slotIdx);
      setModalVisible(true);
    }
  };

  // Modify handleSelectHardware
  const handleSelectHardware = (hardware) => {
    if (currentRamSlot !== null) {
      // For RAM slots
      setSelectedRamModules(prev => ({
        ...prev,
        [currentRamSlot]: hardware
      }));
      setCurrentRamSlot(null);
    } else {
      // For other parts
      setSelectedHardware(prev => ({
        ...prev,
        [selectedPartIdx]: hardware,
      }));
    }
    setModalVisible(false);
    setSearch('');
  };

  const filteredOptions = hardwareOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const leftParts = PARTS.slice(0, 4);
  const rightParts = PARTS.slice(4);

  const handleSetAssessment = () => {
    if (!priceLimitPeso) {
      Alert.alert('Error', 'Please enter a price limit');
      return;
    }
    setIsAssessmentCreated(true);
    setPriceLimitDisplay(priceLimitPeso);
    setAssessmentModalVisible(false);
  };

  const handleDeploy = async () => {
    try {
      const stored = await AsyncStorage.getItem('DEPLOYED_PART_PICKER');
      let existingAssessments = [];
      if (stored) {
        existingAssessments = JSON.parse(stored);
      }

      const newAssessment = {
        id: `part_picker_${Date.now()}`,
        priceLimit: priceLimitPeso,
        createdAt: new Date().toISOString(),
        results: {}
      };

      const updatedAssessments = Array.isArray(existingAssessments) ? 
        [...existingAssessments, newAssessment] : 
        [newAssessment];

      await AsyncStorage.setItem('DEPLOYED_PART_PICKER', JSON.stringify(updatedAssessments));
      setShowConfirmModal(true);
      setDeployedAssessment(newAssessment);
    } catch (error) {
      console.error('Deploy error:', error);
      Alert.alert('Error', 'Failed to deploy assessment');
    }
  };

  // Modify header to use the deployed assessment's price limit
  const renderHeader = () => {
    const limitToShow = deployedAssessment ? deployedAssessment.priceLimit : priceLimitDisplay;
    return (
      <>
        <Text style={styles.header}>ASSESSMENT : PART-PICKER</Text>
        <Text style={styles.subHeader}>
          COST LIMIT : {limitToShow} PHP
        </Text>
      </>
    );
  };

  const handleDelete = async () => {
    try {
      const stored = await AsyncStorage.getItem('DEPLOYED_PART_PICKER');
      if (stored) {
        let assessments = JSON.parse(stored);
        // Filter out current assessment
        assessments = assessments.filter(a => a.id !== route.params?.assessmentId);
        
        // Save updated list
        await AsyncStorage.setItem('DEPLOYED_PART_PICKER', JSON.stringify(assessments));
        
        // Show success and navigate back
        Alert.alert(
          'Success',
          'Assessment deleted successfully',
          [{ 
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete assessment');
    }
  };

  // Add function to get RAM slots status
  const getRamSlotsStatus = () => {
    const totalSlots = 4; // Total available RAM slots
    const populatedSlots = Object.keys(selectedRamModules).length;
    return { total: totalSlots, populated: populatedSlots };
  };

  if (!isAssessmentCreated) {
    return (
      <SidebarLayout activeTab="Assessment" user={user}>
        <View style={styles.emptyStateContainer}>
          <TouchableOpacity
            style={styles.addAssessmentBtn}
            onPress={() => setAssessmentModalVisible(true)}
          >
            <Text style={styles.addAssessmentBtnText}>＋ Add Assessment</Text>
          </TouchableOpacity>
          <Text style={styles.emptyStateText}>Set an Assessment Price Limit to begin</Text>
        </View>

        {/* Assessment Modal */}
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
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.returnBtn}
                  onPress={() => setAssessmentModalVisible(false)}
                >
                  <Text style={styles.returnBtnText}>Return</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.setBtn}
                  onPress={handleSetAssessment}
                >
                  <Text style={styles.setBtnText}>Set Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        <View style={styles.container}>
          {isAssessmentCreated && renderHeader()}
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
                      <View style={styles.partInfo}>
                        <Text style={styles.partLabel}>{part.label}</Text>
                        {/* Add RAM slot indicator */}
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
          {!deployedAssessment && (
            <TouchableOpacity
              style={styles.deployButton}
              onPress={handleDeploy}
            >
              <Text style={styles.deployButtonText}>DEPLOY ASSESSMENT</Text>
            </TouchableOpacity>
          )}
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
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.returnBtn}
                  onPress={() => setAssessmentModalVisible(false)}
                >
                  <Text style={styles.returnBtnText}>Return</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.setBtn}
                  onPress={handleSetAssessment}
                >
                  <Text style={styles.setBtnText}>Set Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Deployment Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalText}>
                Assessment has been deployed successfully.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowConfirmModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Delete button if facilitator and viewing existing assessment */}
        {isFacilitator && route.params?.assessmentId && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Assessment</Text>
          </TouchableOpacity>
        )}

        {/* Add Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Delete Assessment</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this assessment and all its results?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteModalButton]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add RAM Slots Modal */}
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

        {/* Submission button for participant */}
        {!isFacilitator && isAssessmentCreated && !mySubmission && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitAssessment}
          >
            <Text style={styles.submitButtonText}>SUBMIT ASSESSMENT</Text>
          </TouchableOpacity>
        )}
        {/* Show score if graded */}
        {!isFacilitator && mySubmission && mySubmission.score && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>Score: {mySubmission.score}/100</Text>
          </View>
        )}

        {/* Facilitator: Show submissions list */}
        {isFacilitator && isAssessmentCreated && (
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
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectedSubmission(sub);
                    setScoreInput(sub.score ? String(sub.score) : '');
                    setShowResultsModal(true);
                  }}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                {sub.score && (
                  <Text style={styles.scoreText}>Score: {sub.score}/100</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Facilitator: Results Modal */}
        <Modal
          visible={showResultsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResultsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.resultsModalBox}>
              <Text style={styles.resultsModalTitle}>Participant Submission</Text>
              <Text style={styles.resultsModalName}>{selectedSubmission?.name}</Text>
              <Text style={styles.resultsModalDate}>
                Submitted: {selectedSubmission?.submittedAt && new Date(selectedSubmission.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.resultsModalSection}>Selected RAM Modules:</Text>
              <View style={styles.hardwareList}>
                {selectedSubmission?.answers?.ram &&
                  Object.entries(selectedSubmission.answers.ram).map(([slot, hw], idx) => (
                    <Text key={idx} style={styles.hardwareItem}>
                      Slot {parseInt(slot) + 1}: {hw.label}
                    </Text>
                  ))}
              </View>
              <Text style={styles.resultsModalSection}>Other Selected Parts:</Text>
              <View style={styles.hardwareList}>
                {selectedSubmission?.answers?.parts &&
                  Object.entries(selectedSubmission.answers.parts).map(([idx, hw]) => (
                    <Text key={idx} style={styles.hardwareItem}>
                      {PARTS[idx]?.label}: {hw.label}
                    </Text>
                  ))}
              </View>
              <View style={styles.gradeRow}>
                <Text style={styles.gradeLabel}>Grade the participant:</Text>
                <TextInput
                  style={styles.gradeInput}
                  value={scoreInput}
                  onChangeText={setScoreInput}
                  keyboardType="numeric"
                  placeholder="0-100"
                  maxLength={3}
                />
              </View>
              <TouchableOpacity
                style={styles.saveScoreButton}
                onPress={handleSaveScore}
              >
                <Text style={styles.saveScoreButtonText}>Save Score</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResultsModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ededed',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 24,
  },
  deployButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  deployButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  setBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  setBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  deleteModalButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  partInfo: {
    flex: 1,
  },
  
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  
  slot: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  
  slotEmpty: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  slotFilled: {
    backgroundColor: '#FFD305',
  },
  
  slotText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  slotCounter: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.8,
  },
  submissionsBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    marginTop: 24,
    marginBottom: 12,
    width: 480,
    alignSelf: 'center',
    elevation: 2,
  },
  submissionsHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#222',
  },
  noSubmissionsText: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  submissionName: {
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  submissionDate: {
    fontSize: 13,
    color: '#666',
    flex: 2,
  },
  viewButton: {
    backgroundColor: '#FFD305',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  viewButtonText: {
    fontWeight: 'bold',
    color: '#222',
  },
  scoreText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsModalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 400,
    maxWidth: '90%',
    alignItems: 'center',
  },
  resultsModalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    color: '#222',
  },
  resultsModalName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  resultsModalDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  resultsModalSection: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
    color: '#222',
    alignSelf: 'flex-start',
  },
  hardwareList: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  hardwareItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  gradeLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 6,
    width: 60,
    fontSize: 15,
    backgroundColor: '#f8f8f8',
    color: '#222',
    marginLeft: 8,
  },
  saveScoreButton: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  saveScoreButtonText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  scoreBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 14,
    marginTop: 18,
    alignSelf: 'center',
  },
});

