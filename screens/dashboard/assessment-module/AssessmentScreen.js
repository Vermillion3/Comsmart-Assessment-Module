import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import SidebarLayout from '../SidebarLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
// static
const ASSESSMENTS = [
  {
    title: 'PRACTICE ASSESSMENT: QUIZ',
    subtitle: 'GENERATED ASSESSMENT',
    prerequisite: 'Chapter 1',
    progress: 'Completed',
    progressColor: '#2ecc40',
    score: '7/15',
    scoreColor: '#f1c40f',
  },
  {
    title: 'PRACTICE ASSESSMENT: COMPATIBILITY',
    subtitle: 'GENERATED ASSESSMENT',
    prerequisite: 'Chapter 2',
    progress: 'Completed',
    progressColor: '#2ecc40',
    score: '5/5',
    scoreColor: '#2ecc40',
  },
  {
    title: 'PRACTICE ASSESSMENT: PART-PICKER',
    subtitle: 'GENERATED ASSESSMENT',
    prerequisite: 'Chapter 2',
    progress: 'In Progress',
    progressColor: '#f1c40f',
    score: '-/15',
    scoreColor: '#333',
  },
  {
    title: 'FINAL ASSESSMENT',
    subtitle: 'SIR REYMOND REDDINGTON',
    prerequisite: 'Learning Materials Completion',
    progress: 'Not Started',
    progressColor: '#e74c3c',
    score: '-/100',
    scoreColor: '#333',
    isFinal: true,
  },
];

export default function AssessmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isFacilitator = user?.userType === 'facilitator';

  const handleResults = (assessment) => {
    navigation.navigate('AssessmentResultsScreen', { user, assessmentType: assessment.title });
  };

  const handlePress = (assessment) => {
    if (assessment.title === 'PRACTICE ASSESSMENT: QUIZ') {
      navigation.navigate('QuizScreen', { user });
      return;
    }
    if (assessment.title === 'PRACTICE ASSESSMENT: COMPATIBILITY') {
      navigation.navigate('CompatibilityScreen', { user });
      return;
    }
    if (assessment.title === 'PRACTICE ASSESSMENT: PART-PICKER') {
      navigation.navigate('PartPickerScreen', { user });
      return;
    }
    if (assessment.title === 'FINAL ASSESSMENT') {
      navigation.navigate('FinalAssessmentScreen', { user });
      return;
    }
    if (assessment.title === 'Create Assessment') {
      setShowCreateModal(true);
      return;
    }
    setSelectedAssessment(assessment);
    setModalVisible(true);
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
            {ASSESSMENTS.map((a, idx) => (
              <View key={a.title} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={[
                    styles.card,
                    a.isFinal && styles.finalCard,
                  ]}
                  onPress={() => handlePress(a)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>{a.title}</Text>
                    <Text style={styles.cardSubtitle}>{a.subtitle}</Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={styles.cardPrerequisite}>{a.prerequisite}</Text>
                  </View>
                  <View style={styles.cardMid}>
                    <Text style={[styles.cardProgress, { color: a.progressColor }]}>{a.progress}</Text>
                  </View>
                  {/* Results button aligned with header */}
                  <View style={styles.cardRightWrapper}>
                    <View style={styles.cardRight}>
                      {isFacilitator ? (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#FFD305',
                            borderRadius: 6,
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            alignSelf: 'center',
                            elevation: 2,
                          }}
                          onPress={() => handleResults(a)}
                        >
                          <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 15 }}>Results</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.cardScore, { color: a.scoreColor }]}>{a.score}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.createAssessmentContainer}>
            <TouchableOpacity style={styles.createAssessmentBtn} onPress={() => handlePress({ title: 'Create Assessment' })}>
              <Text style={styles.createAssessmentIcon}>📊</Text>
              <Text style={styles.createAssessmentText}>CREATE ASSESSMENT</Text>
            </TouchableOpacity>
          </View>
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
                <View style={styles.createModalRow}>
                  <TouchableOpacity style={styles.createModalBtn} onPress={() => { setShowCreateModal(false); navigation.navigate('QuizScreen', { user }); }}>
                    <Text style={styles.createModalBtnText}>QUIZ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createModalBtn} onPress={() => { setShowCreateModal(false); navigation.navigate('PartPickerScreen', { user }); }}>
                    <Text style={styles.createModalBtnText}>PART-PICKER</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.createModalRow}>
                  <TouchableOpacity style={styles.createModalBtn} onPress={() => { setShowCreateModal(false); navigation.navigate('CompatibilityScreen', { user }); }}>
                    <Text style={styles.createModalBtnText}>COMPATIBILITY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createModalBtn} onPress={() => { setShowCreateModal(false); navigation.navigate('FinalAssessmentScreen', { user }); }}>
                    <Text style={styles.createModalBtnText}>FINAL ASSESSMENT</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.createModalReturnBtn} onPress={() => setShowCreateModal(false)}>
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
});

