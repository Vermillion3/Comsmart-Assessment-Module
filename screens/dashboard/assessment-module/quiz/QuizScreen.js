import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, useWindowDimensions } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute } from '@react-navigation/native';
import CreateQuizForm from './CreateQuizForm';

// static
const DEFAULT_QUESTIONS = [
  {
    question: '1. WHAT IS THE MAIN CIRCUIT BOARD OF A COMPUTER CALLED?',
    options: ['CPU', 'RAM', 'MOTHERBOARD', 'HARD DRIVE'],
    type: 'single',
  },
  {
    question: '2. WHICH COMPONENT IS RESPONSIBLE FOR TEMPORARILY STORING DATA FOR QUICK ACCESS BY THE CPU?',
    options: ['SSD', 'ROM', 'ROM', 'ROM'],
    type: 'single',
  },
  {
    question: '3. COMPUTER HARDWARE QUIZ (TRUE OR FALSE)',
    options: ['TRUE', 'FALSE'],
    type: 'single',
  },
  {
    question: '4. RAM IS A TYPE OF PERMANENT STORAGE THAT KEEPS DATA EVEN WHEN THE COMPUTER IS TURNED OFF.',
    options: ['TRUE', 'FALSE'],
    type: 'single',
  },
  {
    question: '5. THE ________ IS RESPONSIBLE FOR CONVERTING AC POWER FROM THE WALL OUTLET INTO DC POWER FOR THE COMPUTER COMPONENTS.',
    options: [],
    type: 'input',
  },
  {
    question: '6. WHICH COMPONENT IS RESPONSIBLE FOR TEMPORARILY STORING DATA FOR QUICK ACCESS BY THE CPU?',
    options: [],
    type: 'input',
  },
  {
    question: '7. The form factor of the motherboard must be the same with the Case when selecting both hardware.',
    options: ['TRUE', 'FALSE'],
    type: 'single',
  },
  {
    question: '8. LGA (land grid array) socket is only compatible for AMD Ryzen processors.',
    options: ['TRUE', 'FALSE'],
    type: 'single',
  },
];

const normalizeQuestions = (questions) =>
  questions.map((q) => {
    let type = q.type;
    let choices = q.choices || q.options || [];
    if (type === 'single' || type === 'multiple') type = 'multiple';
    if (type === 'input' || type === 'fill') type = 'fill';
    if (type === 'truefalse') choices = ['TRUE', 'FALSE'];
    return { ...q, type, choices };
  });

export default function QuizScreen() {
  const route = useRoute();
  const user = route.params?.user;
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const { width } = useWindowDimensions();
  const isFacilitator = user?.userType === 'facilitator';

  const handleCreateQuiz = (quiz) => {
    setCreatedQuizzes((prev) => [...prev, quiz]);
    setShowCreateModal(false);
  };

  const handleSelect = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };
  const handleInput = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };
  const handleSubmit = () => {
    setShowModal(true);
  };

  const quizCardWidth = width > 1500 ? 1200 : width - 48;

  const allQuestions = normalizeQuestions(
    createdQuizzes.length > 0 ? createdQuizzes : DEFAULT_QUESTIONS
  );

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.mainContainer}>
        {isFacilitator ? (
          <>
            <TouchableOpacity
              style={styles.createQuizBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createQuizBtnText}>＋ Create Quiz</Text>
            </TouchableOpacity>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.quizWrapper}>
                <Text style={styles.header}>FACILITATOR: QUIZ MANAGEMENT</Text>
                {createdQuizzes.length === 0 && (
                  <Text style={{ marginBottom: 16, color: '#888' }}>No quizzes created yet.</Text>
                )}
                {createdQuizzes.map((q, idx) => (
                  <View key={idx} style={[styles.questionCard, { maxWidth: quizCardWidth, minWidth: Math.min(quizCardWidth, 900), width: '100%' }]}>
                    <Text style={styles.question}>{`${idx + 1}. ${q.question}`}</Text>
                    {q.type === 'multiple' && (
                      <View style={styles.optionsRow}>
                        {q.choices.map((opt, oIdx) => (
                          <View key={oIdx} style={styles.optionBtn}>
                            <Text style={styles.optionText}>{opt}</Text>
                          </View>
                        ))}
                        <Text style={{ marginTop: 10, color: '#888' }}>Correct answer: {q.answer}</Text>
                      </View>
                    )}
                    {q.type === 'fill' && (
                      <Text style={{ marginTop: 10, color: '#888' }}>Correct answer: {q.answer}</Text>
                    )}
                    {q.type === 'truefalse' && (
                      <Text style={{ marginTop: 10, color: '#888' }}>Correct answer: {q.answer}</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
            <Modal
              visible={showCreateModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCreateModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.createQuizModalBox}>
                  <CreateQuizForm onClose={() => setShowCreateModal(false)} onSave={handleCreateQuiz} />
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.quizWrapper}>
                <Text style={styles.header}>PARTICIPANT: TAKE QUIZ</Text>
                {allQuestions.map((q, idx) => (
                  <View key={idx} style={[styles.questionCard, { maxWidth: quizCardWidth, minWidth: Math.min(quizCardWidth, 900), width: '100%' }]}>
                    <Text style={styles.question}>{`${idx + 1}. ${q.question.replace(/^\d+\.\s*/, '')}`}</Text>
                    {q.type === 'multiple' && q.choices.length > 0 && (
                      <View style={styles.optionsRow}>
                        {q.choices.map((opt, oIdx) => (
                          <TouchableOpacity
                            key={oIdx}
                            style={[
                              styles.optionBtn,
                              answers[idx] === opt && styles.optionBtnSelected,
                            ]}
                            onPress={() => handleSelect(idx, opt)}
                          >
                            <Text style={[
                              styles.optionText,
                              answers[idx] === opt && styles.optionTextSelected,
                            ]}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {q.type === 'fill' && (
                      <TouchableOpacity
                        activeOpacity={1}
                        style={styles.inputBox}
                        onPress={() => {
                          Alert.prompt(
                            'Enter your answer',
                            '',
                            (text) => handleInput(idx, text),
                            'plain-text',
                            answers[idx] || ''
                          );
                        }}
                      >
                        <Text style={styles.inputText}>
                          {answers[idx] || 'Tap to type your answer'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {q.type === 'truefalse' && (
                      <View style={styles.optionsRow}>
                        {['TRUE', 'FALSE'].map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.optionBtn,
                              answers[idx] === opt && styles.optionBtnSelected,
                            ]}
                            onPress={() => handleSelect(idx, opt)}
                          >
                            <Text style={[
                              styles.optionText,
                              answers[idx] === opt && styles.optionTextSelected,
                            ]}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>SUBMIT</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Modal
              visible={showModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Submission Received</Text>
                  <Text style={styles.modalContent}>Your answers have been submitted. (Static Demo)</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowModal(false)}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  createQuizBtn: {
    position: 'absolute',
    top: 18,
    right: 32, // Move to right
    zIndex: 20,
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
  },
  createQuizBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
    height: '100%',
    overflow: 'auto',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    minHeight: 'min-content',
  },
  quizWrapper: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1500,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    marginBottom: 18,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginRight: 12,
    marginBottom: 8,
  },
  optionBtnSelected: {
    backgroundColor: '#333',
  },
  optionText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  optionTextSelected: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  inputBox: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputText: {
    fontSize: 15,
    color: '#333',
  },
  inputFake: {
    marginLeft: 10,
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputFakeText: {
    color: '#222',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 32,
  },
  submitBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
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
  createQuizModalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 0,
    alignItems: 'center',
    minWidth: 420,
    maxWidth: 440,
    width: 420,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#bbb',
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
});

const webStyles = `
  .quiz-scroll {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
  .quiz-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .quiz-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .quiz-scroll::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = webStyles;
  document.head.appendChild(style);
}
