import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, Alert } from 'react-native';
import SidebarLayout from '../SidebarLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

// Add assessment type constants
const ASSESSMENT_TYPES = [
  { type: 'quiz', title: 'QUIZ', screen: 'QuizScreen' },
  { type: 'compatibility', title: 'COMPATIBILITY', screen: 'CompatibilityScreen' },
  { type: 'partPicker', title: 'PART-PICKER', screen: 'PartPickerScreen' },
  { type: 'final', title: 'FINAL ASSESSMENT', screen: 'FinalAssessmentScreen' },
];

export default function AssessmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deployedQuizzes, setDeployedQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [myQuizResults, setMyQuizResults] = useState([]);
  const [deployedCompatibilityAssessments, setDeployedCompatibilityAssessments] = useState([]);
  const [deployedPartPicker, setDeployedPartPicker] = useState(null);
  const [partPickerAssessments, setPartPickerAssessments] = useState([]);
  const [finalAssessments, setFinalAssessments] = useState([]);
  const isFacilitator = user?.userType === 'facilitator';

  React.useEffect(() => {
    // Load all deployed quizzes and results from AsyncStorage
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('DEPLOYED_QUIZZES');
        if (stored) {
          const quizzes = JSON.parse(stored);
          console.log('Loaded quizzes:', quizzes); // Debug log
          setDeployedQuizzes(Array.isArray(quizzes) ? quizzes : []);
        }

        const storedResults = await AsyncStorage.getItem('QUIZ_RESULTS');
        if (storedResults && user?.id) {
          const results = JSON.parse(storedResults);
          if (!Array.isArray(results)) {
            setQuizResults(results);
            const quizResultsArr = [];
            Object.keys(results).forEach((quizId) => {
              if (results[quizId][user.id]) {
                quizResultsArr.push({
                  quizId,
                  ...results[quizId][user.id],
                });
              }
            });
            setMyQuizResults(quizResultsArr);
          }
        }

        // Load compatibility assessments
        const storedCompatibility = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
        if (storedCompatibility) {
          const compatibilityAssessments = JSON.parse(storedCompatibility);
          setDeployedCompatibilityAssessments(Array.isArray(compatibilityAssessments) ? compatibilityAssessments : []);
        }

        // Load part-picker assessments
        const storedPartPicker = await AsyncStorage.getItem('DEPLOYED_PART_PICKER');
        if (storedPartPicker) {
          const partPickerData = JSON.parse(storedPartPicker);
          setPartPickerAssessments(Array.isArray(partPickerData) ? partPickerData : []);
        }

        // Load final assessments
        const storedFinal = await AsyncStorage.getItem('DEPLOYED_FINAL_ASSESSMENTS');
        if (storedFinal) {
          const finals = JSON.parse(storedFinal);
          setFinalAssessments(Array.isArray(finals) ? finals : []);
        }
      } catch (error) {
        console.error('Error loading assessments:', error);
      }
    };

    loadData();
  }, [user?.id]);

  const handleResults = (assessment) => {
    navigation.navigate('AssessmentResultsScreen', { user, assessmentType: assessment.title });
  };

  

  // Update the card rendering for part-picker assessment
  const renderPartPickerAssessments = () => {
    return partPickerAssessments.map((assessment, idx) => (
      <View key={`part_picker_${idx}`} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PartPickerScreen', { 
            user,
            assessmentId: assessment.id 
          })}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: PART-PICKER {idx + 1}</Text>
            <Text style={styles.cardSubtitle}>
              Price Limit: ₱{assessment.priceLimit}
            </Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={styles.cardPrerequisite}>Hardware Knowledge</Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
          </View>
          <View style={styles.cardRightWrapper}>
            <View style={styles.cardRight}>
              {isFacilitator ? (
                <TouchableOpacity
                  style={styles.resultsButton}
                  onPress={() => navigation.navigate('PartPickerScreen', { 
                    user,
                    assessmentId: assessment.id 
                  })}
                >
                  <Text style={styles.resultsButtonText}>Results</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.cardScore, { color: '#333' }]}>
                  {assessment.results?.[user.id]?.score || '-/-'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ));
  };

  // Add this function to render final assessments
  const renderFinalAssessments = () => {
    return finalAssessments.map((assessment, idx) => (
      <View key={`final_assessment_${idx}`} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('FinalAssessmentScreen', { 
            user,
            assessmentId: assessment.id 
          })}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: FINAL ASSESSMENT {idx + 1}</Text>
            <Text style={styles.cardSubtitle}>
              Price Limit: {assessment.currency === 'USD' ? '$' : '₱'}{assessment.costLimit}
            </Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={styles.cardPrerequisite}>All Chapters</Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
          </View>
          <View style={styles.cardRightWrapper}>
            <View style={styles.cardRight}>
              {isFacilitator ? (
                <TouchableOpacity
                  style={styles.resultsButton}
                  onPress={() => navigation.navigate('FinalAssessmentScreen', { 
                    user,
                    assessmentId: assessment.id 
                  })}
                >
                  <Text style={styles.resultsButtonText}>Results</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.cardScore, { color: '#333' }]}>
                  {assessment.results?.[user.id]?.score || '-/-'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLeft}>ASSESSMENT</Text>
            <Text style={styles.headerMid}>PRE-REQUISITE</Text>
            <Text style={styles.headerMid}>PROGRESS</Text>
            <View style={styles.headerRightWrapper}>
              <Text style={styles.headerRight}>RESULTS</Text>
            </View>
          </View>
          <View style={styles.cardsWrapper}>
            {/* Show deployed quizzes */}
            {deployedQuizzes.map((quiz, quizIdx) => (
              <View key={`deployed_quiz_${quizIdx}`} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('QuizScreen', { user, quizIdx })}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: QUIZ {quizIdx + 1}</Text>
                    <Text style={styles.cardSubtitle}>Custom Quiz ({quiz.length} items)</Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={styles.cardPrerequisite}>Chapter 1</Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                  </View>
                  <View style={styles.cardRightWrapper}>
                    <View style={styles.cardRight}>
                      {isFacilitator ? (
                        <TouchableOpacity
                          style={styles.resultsButton}
                          onPress={() => navigation.navigate('QuizScreen', { user, quizIdx })}
                        >
                          <Text style={styles.resultsButtonText}>Results</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {myQuizResults[quizIdx] ? `${myQuizResults[quizIdx].score}` : '-/-'}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Static assessments for practice - only for facilitator */}
            {!isFacilitator && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => handlePress({ title: 'PRACTICE ASSESSMENT: QUIZ' })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: QUIZ</Text>
                      <Text style={styles.cardSubtitle}>10 Questions</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={styles.cardPrerequisite}>Chapter 1</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                    </View>
                    <View style={styles.cardRightWrapper}>
                      <View style={styles.cardRight}>
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {myQuizResults.length > 0 ? `${myQuizResults[0].score}` : '-/-'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => handlePress({ title: 'PRACTICE ASSESSMENT: COMPATIBILITY' })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: COMPATIBILITY</Text>
                      <Text style={styles.cardSubtitle}>Compatibility Test</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={styles.cardPrerequisite}>Chapter 1</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                    </View>
                    <View style={styles.cardRightWrapper}>
                      <View style={styles.cardRight}>
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {myQuizResults.length > 1 ? `${myQuizResults[1].score}` : '-/-'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => handlePress({ title: 'PRACTICE ASSESSMENT: PART-PICKER' })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>PRACTICE ASSESSMENT: PART-PICKER</Text>
                      <Text style={styles.cardSubtitle}>Select the Right Parts</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={styles.cardPrerequisite}>Chapter 1</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                    </View>
                    <View style={styles.cardRightWrapper}>
                      <View style={styles.cardRight}>
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {myQuizResults.length > 2 ? `${myQuizResults[2].score}` : '-/-'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => handlePress({ title: 'FINAL ASSESSMENT' })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>FINAL ASSESSMENT</Text>
                      <Text style={styles.cardSubtitle}>Comprehensive Test</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={styles.cardPrerequisite}>All Chapters</Text>
                    </View>
                    <View style={styles.cardMid}>
                      <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                    </View>
                    <View style={styles.cardRightWrapper}>
                      <View style={styles.cardRight}>
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {myQuizResults.length > 3 ? `${myQuizResults[3].score}` : '-/-'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Show deployed compatibility assessments */}
            {deployedCompatibilityAssessments.map((assessment, idx) => (
              <View key={`compatibility_${idx}`} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('CompatibilityScreen', { 
                    user, 
                    assessmentId: assessment.id 
                  })}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>COMPATIBILITY ASSESSMENT {idx + 1}</Text>
                    <Text style={styles.cardSubtitle}>
                      Hardware Compatibility ({assessment.pairs?.length || 0} pairs)
                    </Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={styles.cardPrerequisite}>Hardware Knowledge</Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={[styles.cardProgress, { color: '#2ecc40' }]}>Available</Text>
                  </View>
                  <View style={styles.cardRightWrapper}>
                    <View style={styles.cardRight}>
                      {isFacilitator ? (
                        <TouchableOpacity
                          style={styles.resultsButton}
                          onPress={() => navigation.navigate('CompatibilityScreen', { 
                            user, 
                            assessmentId: assessment.id 
                          })}
                        >
                          <Text style={styles.resultsButtonText}>Results</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.cardScore, { color: '#333' }]}>
                          {assessment.results?.[user.id]?.score || '-/-'}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Part-Picker Assessments Cards */}
            {partPickerAssessments.length > 0 && renderPartPickerAssessments()}

            {/* Add Final Assessments Cards */}
            {finalAssessments.length > 0 && renderFinalAssessments()}
          </View>

          {/* Only show Create Assessment button for facilitator */}
          {isFacilitator && (
            <View style={styles.createAssessmentContainer}>
              <TouchableOpacity
                style={styles.createAssessmentBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createAssessmentIcon}>📊</Text>
                <Text style={styles.createAssessmentText}>CREATE ASSESSMENT</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{selectedAssessment?.title}</Text>
              <Text style={styles.modalContent}>This is a placeholder for "{selectedAssessment?.title}".</Text>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={styles.createModalBox}>
              <Text style={styles.createModalHeader}>ASSESSMENT GENERATION</Text>
              <Text style={styles.createModalSub}>Select Assessment Type</Text>
              <View style={styles.createModalGrid}>
                {ASSESSMENT_TYPES.map((type, index) => (
                  index % 2 === 0 && (
                    <View key={type.type} style={styles.createModalRow}>
                      <TouchableOpacity 
                        style={styles.createModalBtn}
                        onPress={() => {
                          setShowCreateModal(false);
                          navigation.navigate(type.screen, { user });
                        }}
                      >
                        <Text style={styles.createModalBtnText}>{type.title}</Text>
                      </TouchableOpacity>
                      {ASSESSMENT_TYPES[index + 1] && (
                        <TouchableOpacity 
                          style={styles.createModalBtn}
                          onPress={() => {
                            setShowCreateModal(false);
                            navigation.navigate(ASSESSMENT_TYPES[index + 1].screen, { user });
                          }}
                        >
                          <Text style={styles.createModalBtnText}>{ASSESSMENT_TYPES[index + 1].title}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                ))}
              </View>
              <TouchableOpacity 
                style={styles.createModalReturnBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.createModalReturnBtnText}>Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    minHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
    width: '100%',
    minWidth: 1500,
    maxWidth: 1500,
    alignSelf: 'center',
  },
  headerLeft: {
    flex: 2,
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'left',
    paddingLeft: 18,
  },
  headerMid: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'right',
    paddingRight: 18,
  },
  headerRightWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 18,
  },
  cardsWrapper: {
    width: '100%',
    minWidth: 1500,
    maxWidth: 1500,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 25,
    paddingVertical: 0,
    paddingHorizontal: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    width: '100%',
    alignSelf: 'center',
    minWidth: 1500,
    height: 120,
  },
  finalCard: {
    marginTop: 12,
  },
  cardLeft: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 18,
    height: '100%',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
    textAlign: 'left',
  },
  cardMid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  cardPrerequisite: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  cardProgress: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  cardRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 18,
    height: '100%',
  },
  cardRightWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 18,
    height: '100%',
  },
  cardScore: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  createAssessmentContainer: {
    marginTop: 24,
    marginBottom: 12,
    alignItems: 'flex-start',
    maxWidth: 1500,
    alignSelf: 'center',
    width: '100%',
  },
  createAssessmentBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    width: 120,
  },
  createAssessmentIcon: {
    fontSize: 32,
    marginBottom: 2,
    marginLeft: 10,
  },
  createAssessmentText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
    padding: 28,
    alignItems: 'center',
    minWidth: 260,
    maxWidth: 340,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  closeBtnText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 16,
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModalBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    minWidth: 380,
    maxWidth: 420,
    width: 420,
    elevation: 8,
  },
  createModalHeader: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  createModalSub: {
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  createModalGrid: {
    width: '100%',
    marginBottom: 24,
  },
  createModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  createModalBtn: {
    backgroundColor: '#666',
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginHorizontal: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  createModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  createModalReturnBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  createModalReturnBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  resultsButton: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'center',
    elevation: 2,
  },
  resultsButtonText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  facilitatorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

