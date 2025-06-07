import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, ScrollView } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import HardwarePickerModal from '../HardwarePickerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const HARDWARE_OPTIONS = [
  { label: 'RTX 4090', icon: require('../../../../assets/part_icons/GPU.png') },
  { label: 'RTX 4080', icon: require('../../../../assets/part_icons/GPU.png') },
  { label: 'RX 6900 XT', icon: require('../../../../assets/part_icons/GPU.png') },
];

export default function CompatibilityScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState({}); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [selectedPairIndex, setSelectedPairIndex] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [savedResults, setSavedResults] = useState(false);

  // Load deployed assessments
  React.useEffect(() => {
    const loadAssessments = async () => {
      try {
        const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
        if (stored) {
          const loadedAssessments = JSON.parse(stored);
          console.log('Loaded assessments:', loadedAssessments); // Debug log
          setAssessments(loadedAssessments);
        }
      } catch (error) {
        console.error('Load error:', error);
      }
    };

    loadAssessments();
  }, [refreshKey]);

  // Load assessment details if assessmentId is provided
  React.useEffect(() => {
    const loadAssessmentDetails = async () => {
      try {
        if (route.params?.assessmentId) {
          const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
          if (stored) {
            const assessments = JSON.parse(stored);
            const assessment = assessments.find(a => a.id === route.params.assessmentId);
            if (assessment) {
              setCurrentAssessment(assessment);
            }
          }
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
      }
    };

    loadAssessmentDetails();
  }, [route.params?.assessmentId]);

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

  const handleAddHardware = (idx) => {
    setSelectedPairIndex(idx);
    setShowHardwareModal(true);
  };

  const handleSelectHardware = async (hardware) => {
    try {
      const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
      if (stored) {
        const assessments = JSON.parse(stored);
        const assessment = assessments.find(a => a.id === currentAssessment.id);
        if (assessment) {
          // Update the right side hardware
          assessment.pairs[selectedPairIndex].right.hardware = hardware;
          await AsyncStorage.setItem('DEPLOYED_COMPATIBILITY', JSON.stringify(assessments));
          setCurrentAssessment(assessment);
        }
      }
      setShowHardwareModal(false);
      setSearch('');
    } catch (error) {
      console.error('Error saving hardware selection:', error);
      Alert.alert('Error', 'Failed to save hardware selection');
    }
  };

  const filteredOptions = cpuOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      if (!currentAssessment?.id) {
        Alert.alert('Error', 'No assessment selected for deletion');
        return;
      }

      const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
      if (stored) {
        // Filter out current assessment
        let assessmentsList = JSON.parse(stored);
        assessmentsList = assessmentsList.filter(a => a.id !== currentAssessment.id);
        
        // Save updated list
        await AsyncStorage.setItem('DEPLOYED_COMPATIBILITY', JSON.stringify(assessmentsList));
        
        // Update states
        setAssessments(assessmentsList);
        setShowDeleteConfirm(false);
        setCurrentAssessment(null);

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

  // Role check
  const isFacilitator = user?.userType === 'facilitator';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitAnswers = async () => {
    try {
      const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
      if (stored) {
        let assessments = JSON.parse(stored);
        const assessment = assessments.find(a => a.id === currentAssessment.id);
        
        if (assessment) {
         
          if (!assessment.results) {
            assessment.results = {};
          }

      
          assessment.results[user.id] = {
            name: user.username || user.emailAddress,
            submittedAt: new Date().toISOString(),
            answers: assessment.pairs.map(pair => ({
              left: pair.left,
              right: { ...pair.right, hardware: pair.right.hardware }
            }))
          };

          await AsyncStorage.setItem('DEPLOYED_COMPATIBILITY', JSON.stringify(assessments));
          Alert.alert('Success', 'Your answers have been submitted');
          setHasSubmitted(true);
          setIsEditing(false);
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit answers');
    }
  };

  const handleCheckAnswer = (userId, questionIdx, isCorrect) => {
    setCheckedAnswers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [questionIdx]: isCorrect
      }
    }));
  };

  
  const calculateScore = (answers) => {
    if (!answers) return 0;
    return Object.values(answers).filter(v => v).length;
  };

  const handleSaveResults = async (userId) => {
    try {
      const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
      if (stored) {
        let assessments = JSON.parse(stored);
        const assessment = assessments.find(a => a.id === currentAssessment.id);
        
        if (assessment?.results?.[userId]) {
          // Calculate score based on checked answers
          const score = calculateScore(checkedAnswers[userId]);
          const totalQuestions = assessment.pairs.length;
          
          assessment.results[userId].checked = checkedAnswers[userId];
          assessment.results[userId].score = score;
          assessment.results[userId].totalQuestions = totalQuestions;
          
          await AsyncStorage.setItem('DEPLOYED_COMPATIBILITY', JSON.stringify(assessments));
          setCurrentAssessment(assessment);
          setSavedResults(true);
          Alert.alert('Success', `Results saved successfully!\nScore: ${score}/${totalQuestions}`);
        }
      }
    } catch (error) {
      console.error('Save results error:', error);
      Alert.alert('Error', 'Failed to save results');
    }
  };

  const renderAnswerStatus = (isCorrect) => {
    return (
      <View style={[
        styles.answerStatusBadge,
        isCorrect ? styles.correctBadge : styles.incorrectBadge
      ]}>
        {isCorrect ? (
          <>
            <Text style={styles.answerStatusIcon}>✓</Text>
            <Text style={styles.answerStatusText}>CORRECT</Text>
          </>
        ) : (
          <>
            <Text style={styles.answerStatusIcon}>✕</Text>
            <Text style={styles.answerStatusText}>INCORRECT</Text>
          </>
        )}
      </View>
    );
  };

  const renderResults = () => {
    if (!currentAssessment?.results) return null;

    return (
      <ScrollView style={styles.mainScrollView}>
        <View style={styles.resultsContainer}>
          {Object.entries(currentAssessment.results).map(([userId, result]) => (
            <View key={userId} style={styles.resultCard}>
              <Text style={styles.participantName}>{result.name}</Text>
              <Text style={styles.submissionTime}>
                Submitted: {new Date(result.submittedAt).toLocaleString()}
              </Text>
              
              {/* Show score if checked */}
              {result.checked && (
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreText}>
                    Score: {result.score}/{result.totalQuestions}
                  </Text>
                  <Text style={[
                    styles.scorePercentage,
                    result.score/result.totalQuestions >= 0.75 ? styles.scoreGood : styles.scorePoor
                  ]}>
                    ({Math.round(result.score/result.totalQuestions * 100)}%)
                  </Text>
                </View>
              )}
              
              <View style={styles.answersContainer}>
                {result.answers.map((pair, idx) => (
                  <View key={idx} style={styles.answerBox}>
                    <View style={styles.answerContent}>
                      <View style={styles.answerHeader}>
                        <Text style={styles.answerNumber}>Answer {idx + 1}</Text>
                        {result.checked && renderAnswerStatus(result.checked[idx])}
                      </View>
                      <Text style={styles.answerText}>
                        {pair.left.component.label}: {pair.left.hardware.label}
                        {'\n'}compatible to {pair.right.component.label}: {
                          pair.right.hardware ? pair.right.hardware.label : '(No answer)'
                        }
                      </Text>
                      {isFacilitator && !result.checked && (
                        <View style={styles.checkButtons}>
                          <TouchableOpacity
                            style={[
                              styles.checkButton,
                              checkedAnswers[userId]?.[idx] && styles.correctButton
                            ]}
                            onPress={() => handleCheckAnswer(userId, idx, true)}
                          >
                            <Text style={styles.checkButtonText}>Mark Correct</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.checkButton,
                              checkedAnswers[userId]?.[idx] === false && styles.incorrectButton
                            ]}
                            onPress={() => handleCheckAnswer(userId, idx, false)}
                          >
                            <Text style={styles.checkButtonText}>Mark Incorrect</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              
              {isFacilitator && !result.checked && Object.keys(checkedAnswers[userId] || {}).length > 0 && (
                <TouchableOpacity
                  style={styles.saveResultsBtn}
                  onPress={() => handleSaveResults(userId)}
                >
                  <Text style={styles.saveResultsBtnText}>Save Results</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderParticipantResult = () => {
    if (!currentAssessment?.results?.[user.id]) return null;
    
    const myResult = currentAssessment.results[user.id];
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeader}>Your Submission</Text>
        <Text style={styles.resultSubmittedAt}>
          Submitted: {new Date(myResult.submittedAt).toLocaleString()}
        </Text>
        <View style={styles.answersContainer}>
          {myResult.answers.map((pair, idx) => (
            <View key={idx} style={styles.answerBox}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerNumber}>Answer {idx + 1}</Text>
                {myResult.checked && (
                  <View style={[
                    styles.answerStatusBadge,
                    myResult.checked[idx] ? styles.correctBadge : styles.incorrectBadge
                  ]}>
                    <Text style={styles.answerStatusIcon}>
                      {myResult.checked[idx] ? '✓' : '✕'}
                    </Text>
                    <Text style={styles.answerStatusText}>
                      {myResult.checked[idx] ? 'CORRECT' : 'INCORRECT'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.answerContent}>
                <Text style={styles.componentPair}>
                  {pair.left.component.label}: {pair.left.hardware.label}
                </Text>
                <Text style={styles.compatibleText}>Compatible to:</Text>
                <Text style={styles.componentPair}>
                  {pair.right.component.label}: {pair.right.hardware?.label || '(No answer)'}
                </Text>
              </View>
            </View>
          ))}
          {myResult.checked && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                Final Score: {myResult.score}/{myResult.totalQuestions}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAssessmentDetail = () => {
    if (!currentAssessment) return null;

    // Check if user has already submitted
    const hasSubmitted = !!currentAssessment.results?.[user.id];
    
    // If participant has submitted, show their results instead
    if (!isFacilitator && hasSubmitted) {
      return renderParticipantResult();
    }

    return (
      <>
        <Text style={styles.header}>COMPATIBILITY ASSESSMENT</Text>
        <ScrollView style={styles.scrollArea}>
          {currentAssessment.pairs.map((pair, idx) => (
            <View key={idx} style={styles.row}>
              {/* Left Card - Read only */}
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Image source={pair.left.component.icon} style={styles.icon} />
                  <Text style={styles.cardLabel}>{pair.left.component.label}</Text>
                  {pair.left.hardware && (
                    <View style={styles.selectedHardware}>
                      <Image source={pair.left.hardware.icon} style={styles.selectedIcon} />
                      <Text style={styles.selectedLabel}>{pair.left.hardware.label}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Compatible To */}
              <View style={styles.compatibleTo}>
                <Text style={styles.compatibleText}>COMPATIBLE TO:</Text>
              </View>

              {/* Right Card - Allow editing based on submission state */}
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Image source={pair.right.component.icon} style={styles.icon} />
                  <Text style={styles.cardLabel}>{pair.right.component.label}</Text>
                  {pair.right.hardware && (
                    <View style={styles.selectedHardware}>
                      <Image source={pair.right.hardware.icon} style={styles.selectedIcon} />
                      <Text style={styles.selectedLabel}>{pair.right.hardware.label}</Text>
                    </View>
                  )}
                </View>
                {!isFacilitator && !hasSubmitted && !pair.right.hardware && (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddHardware(idx)}
                  >
                    <Text style={styles.addBtnText}>＋ Add Hardware</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Action buttons */}
        {!isFacilitator && (
          <View style={styles.actionButtons}>
            {hasSubmitted ? (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={handleEdit}
              >
                <Text style={styles.editBtnText}>Edit Answers</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitAnswers}
              >
                <Text style={styles.submitBtnText}>Submit Answers</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
        {isFacilitator && renderResults()}
      </>
    );
  };

  // Add new renderAssessmentList function
  const renderAssessmentList = () => {
    return (
      <>
        <Text style={styles.header}>COMPATIBILITY ASSESSMENTS</Text>
        <TouchableOpacity
          style={styles.createAssessmentBtn}
          onPress={() => navigation.navigate('CreateCompatibilityScreen', { user })}
        >
          <Text style={styles.createAssessmentBtnText}>＋ Create New Assessment</Text>
        </TouchableOpacity>

        <ScrollView style={styles.assessmentsList}>
          {assessments.map((assessment, idx) => (
            <View key={assessment.id} style={styles.assessmentRow}>
              <TouchableOpacity 
                style={styles.assessmentCard}
                onPress={() => navigation.navigate('CompatibilityScreen', { 
                  user,
                  assessmentId: assessment.id 
                })}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardMain}>
                    <Text style={styles.assessmentTitle}>
                      Compatibility Assessment {idx + 1}
                    </Text>
                    <Text style={styles.assessmentCreated}>
                      Created: {new Date(assessment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Text style={styles.pairCount}>
                      {assessment.pairs?.length || 0} component pairs
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => {
                        setShowDeleteConfirm(true);
                        setCurrentAssessment(assessment);
                      }}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
          {assessments.length === 0 && (
            <Text style={styles.noAssessmentsText}>No assessments created yet</Text>
          )}
        </ScrollView>

        {/* Delete Confirmation Modal */}
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
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  // Function to refresh assessments
  const refreshAssessments = () => {
    setRefreshKey(old => old + 1);
  };

  // Add function to handle creating new assessment
  const handleCreateAssessment = () => {
    navigation.navigate('CreateCompatibilityScreen', { 
      user,
      onAssessmentCreated: () => {
        console.log('Assessment created, refreshing list');
        refreshAssessments();
      }
    });
  };

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        {isFacilitator && !route.params?.assessmentId ? (
          // Show assessment list for facilitator
          renderAssessmentList()
        ) : (
          // Show assessment details or participant view
          <View style={styles.container}>
            <Text style={styles.header}>COMPATIBILITY ASSESSMENT</Text>
            {renderAssessmentDetail()}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            {/* Add Delete button for assessment detail view */}
            {isFacilitator && currentAssessment && (
              <TouchableOpacity
                style={styles.deleteAssessmentBtn}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text style={styles.deleteAssessmentBtnText}>Delete Assessment</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delete Confirmation Modal */}
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
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Hardware Picker Modal */}
        <HardwarePickerModal 
          visible={showHardwareModal}
          title="SELECT COMPATIBLE HARDWARE"
          search={search}
          setSearch={setSearch}
          options={HARDWARE_OPTIONS}
          onSelect={handleSelectHardware}
          onClose={() => {
            setShowHardwareModal(false);
            setSearch('');
          }}
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
    marginBottom: 18,
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
    maxWidth: 600,
    flex: 1,
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
    fontSize: 17,
    marginBottom: 2,
  },
  addBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  addBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  compatibleTo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  compatibleText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
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
    width: 400,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  assessmentsList: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },

  assessmentRow: {
    marginBottom: 16,
  },

  assessmentCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardMain: {
    flex: 3,
  },

  cardMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },

  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },

  assessmentCreated: {
    fontSize: 14,
    color: '#666',
  },

  pairCount: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },

  createAssessmentBtn: {
    position: 'absolute',
    top: 24,
    right: 32,
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    zIndex: 10,
  },

  createAssessmentBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  noAssessmentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },

  scrollArea: {
    width: '100%',
    maxHeight: 480,
    marginBottom: 24,
  },
  cardActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },

  deleteBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  deleteAssessmentBtn: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    zIndex: 10,
  },

  deleteAssessmentBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },

  resultsContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  resultsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },

  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  submissionTime: {
    color: '#666',
    marginBottom: 12,
  },

  answersHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  answerRow: {
    fontSize: 15,
    marginBottom: 4,
    marginLeft: 12,
  },

  submitBtn: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },

  submitBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },

  actionButtons: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    flexDirection: 'row',
    gap: 16,
  },

  editBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },

  editBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },

  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginTop: 24,
  },

  resultHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },

  resultSubmittedAt: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },

  answersContainer: {
    gap: 16,
  },

  answerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },

  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  answerText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  checkButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },

  checkButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },

  correctButton: {
    backgroundColor: '#4CAF50',
  },

  incorrectButton: {
    backgroundColor: '#f44336',
  },

  checkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: '#FFD305',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 16,
  },

  saveButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },

  scoreContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },

  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },

  resultStatus: {
    fontWeight: 'bold',
    marginLeft: 16,
  },

  correctText: {
    color: '#4CAF50',
  },

  incorrectText: {
    color: '#f44336',
  },

  mainScrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
  },

  mainScrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Add padding for bottom buttons
  },

  resultsContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  resultsList: {
    flex: 1,
    maxHeight: '80vh', // Use viewport height
  },

  resultsListContent: {
    paddingBottom: 24,
  },

  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },

  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  answerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  correctBadge: {
    backgroundColor: '#4CAF50',
  },

  incorrectBadge: {
    backgroundColor: '#f44336',
  },

  answerStatusIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },

  answerStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },

  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },

  scorePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  scoreGood: {
    color: '#4CAF50',
  },

  scorePoor: {
    color: '#f44336',
  },

  saveResultsBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
    marginTop: 16,
  },

  saveResultsBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

