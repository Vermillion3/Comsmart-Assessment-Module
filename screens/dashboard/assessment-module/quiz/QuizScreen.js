import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, useWindowDimensions, TextInput, Platform } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute } from '@react-navigation/native';
import CreateQuizForm from './CreateQuizForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const QUIZ_STORAGE_KEY = 'DEPLOYED_QUIZZES';
const QUIZ_RESULT_KEY = 'QUIZ_RESULTS';

const normalizeQuestions = (questions) =>
  questions.map((q) => {
    let type = q.type;
    let choices = q.choices || q.options || [];
    if (type === 'single' || type === 'multiple') type = 'multiple';
    if (type === 'input' || type === 'fill') type = 'fill';
    if (type === 'truefalse') choices = ['TRUE', 'FALSE'];
    return { ...q, type, choices };
  });

function getQuizId(route, deployedQuizzes) {
  // Use quizIdx from navigation params, fallback to 'main'
  if (typeof route?.params?.quizIdx === 'number') {
    return `quiz_${route.params.quizIdx}`;
  }
  // If creating a new quiz (not viewing deployed), use next index
  return `quiz_${deployedQuizzes.length}`;
}

export default function QuizScreen() {
  const route = useRoute();
  const user = route.params?.user;
  const quizIdx = typeof route?.params?.quizIdx === 'number' ? route.params.quizIdx : null;
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [deployedQuizzes, setDeployedQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [fillInputIdx, setFillInputIdx] = useState(null);
  const [fillInputValue, setFillInputValue] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { width } = useWindowDimensions();
  const isFacilitator = user?.userType === 'facilitator';
  const [editMode, setEditMode] = useState(false);
  const [editQuizIdx, setEditQuizIdx] = useState(null);

  // Add this state to control whether we're in quiz creation mode
  const [isCreatingNewQuiz] = useState(!route.params?.quizIdx);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCreateQuiz = (quiz) => {
    if (editMode && editQuizIdx !== null) {
      // Edit mode: update quiz at index
      const updated = [...createdQuizzes];
      updated[editQuizIdx] = quiz;
      setCreatedQuizzes(updated);
      setEditMode(false);
      setEditQuizIdx(null);
    } else {
      setCreatedQuizzes((prev) => [...prev, quiz]);
    }
    setShowCreateModal(false);
  };

  const handleSelect = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };
  const handleInput = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };
  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      Alert.alert("No Answers", "Please answer at least one question before submitting.");
      return;
    }

    // Calculate score
    let correctCount = 0;
    allQuestions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (!userAnswer) return;

      if (q.type === 'multiple') {
        const correctIdx = ['a', 'b', 'c', 'd'].indexOf(q.answer.toLowerCase());
        const correctAnswer = q.choices[correctIdx];
        if (userAnswer === correctAnswer) correctCount++;
      } else if (q.type === 'fill') {
        if (userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
          correctCount++;
        }
      } else if (q.type === 'truefalse') {
        if (userAnswer === q.answer) correctCount++;
      }
    });

    // Save result
    const quizId = getQuizId(route);
    const newResults = { ...quizResults };
    if (!newResults[quizId]) newResults[quizId] = {};
    
    newResults[quizId][user.id] = {
      name: user.username || user.emailAddress || 'Anonymous',
      answers,
      score: `${correctCount}/${allQuestions.length}`,
      submittedAt: new Date().toISOString()
    };

    await saveQuizResults(newResults);
    setShowModal(true);
    setHasSubmitted(true);
  };

  const quizCardWidth = width > 1500 ? 1200 : width - 48;

  // Load deployed quizzes, results, and check if participant has submitted
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) setDeployedQuizzes(JSON.parse(stored));
      const storedResults = await AsyncStorage.getItem(QUIZ_RESULT_KEY);
      if (storedResults) setQuizResults(JSON.parse(storedResults));
      // Check if participant has already submitted for this quiz
      if (user?.id && storedResults) {
        const quizId = getQuizId(route);
        const results = JSON.parse(storedResults);
        if (results[quizId] && results[quizId][user.id]) {
          setHasSubmitted(true);
        }
      }
    })();
  }, [user?.id, route?.params?.quizIdx]);

  // Save deployed quizzes to AsyncStorage
  const saveDeployedQuizzes = async (quizzes) => {
    setDeployedQuizzes(quizzes);
    await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
  };

  // Save quiz results to AsyncStorage
  const saveQuizResults = async (results) => {
    setQuizResults(results);
    await AsyncStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(results));
    if (user?.id) setHasSubmitted(true);
  };

  // Deploy quizzes (facilitator)
  const handleDeploy = async () => {
    if (createdQuizzes.length === 0) {
      alert('Please add at least one quiz item before deploying');
      return;
    }
    const quizzes = [...deployedQuizzes, createdQuizzes];
    await saveDeployedQuizzes(quizzes);
    setDeployedQuizzes(quizzes);
    setShowCreateModal(false);
    setEditMode(false);
    setEditQuizIdx(null);
    setCreatedQuizzes([]);
    alert('Quiz deployed! Participants can now view and answer.');
  };

  // Delete deployed quiz (facilitator)
  const handleDeleteQuiz = async () => {
    try {
      // Get current quiz ID
      const quizId = getQuizId(route);
      
      // Remove quiz from deployedQuizzes
      const updatedQuizzes = deployedQuizzes.filter((_, idx) => idx !== quizIdx);
      await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updatedQuizzes));
      
      // Remove associated results
      const updatedResults = { ...quizResults };
      delete updatedResults[quizId];
      await AsyncStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(updatedResults));
      
      // Update state
      setDeployedQuizzes(updatedQuizzes);
      setQuizResults(updatedResults);
      setShowDeleteConfirm(false);
      
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      Alert.alert('Error', 'Failed to delete quiz');
    }
  };

  // Edit quiz (facilitator)
  const handleEditQuiz = (idx) => {
    setEditQuizIdx(idx);
    setEditMode(true);
    setShowCreateModal(true);
  };

  // Remove quiz (facilitator, before deploy)
  const handleRemoveQuiz = (idx) => {
    const updated = [...createdQuizzes];
    updated.splice(idx, 1);
    setCreatedQuizzes(updated);
  };

  // For results viewing (facilitator)
  const getParticipantResults = () => {
    const quizId = getQuizId(route);
    const quiz = deployedQuizzes[quizIdx] || [];
    const results = quizResults[quizId] || {};
    return Object.values(results).map((r) => ({
      name: r.name,
      answers: r.answers,
      submittedAt: r.submittedAt,
      score: '-',
    }));
  };

  // For participant: get their own result
  const getMyResult = () => {
    const quizId = getQuizId(route);
    if (!user?.id) return null;
    const results = quizResults[quizId] || {};
    return results[user.id] || null;
  };

  // For web: handle fill in the blank input
  const handleFillInput = (idx) => {
    setFillInputIdx(idx);
    setFillInputValue(answers[idx] || '');
  };
  const handleFillInputSave = (idx) => {
    setAnswers((prev) => ({ ...prev, [idx]: fillInputValue }));
    setFillInputIdx(null);
    setFillInputValue('');
  };

  // Helper to check correctness for display
  const getCorrectness = (q, idx, ans) => {
    if (!q) return null;
    if (ans === undefined || ans === null || ans === '') {
      return {
        isCorrect: false,
        correctAnswer: q.answer,
        userAnswer: null,
        type: q.type,
        didNotAnswer: true,
      };
    }
    if (q.type === 'multiple') {
      // For multiple choice, answer is the choice string, correct is q.choices[q.answer] or q.choices[abc->idx]
      const correctIdx = ['a', 'b', 'c', 'd'].indexOf(q.answer);
      const correctAnswer = q.choices[correctIdx];
      return {
        isCorrect: ans === correctAnswer,
        correctAnswer,
        userAnswer: ans,
        type: 'multiple',
        correctLetter: q.answer ? q.answer.toUpperCase() : '',
      };
    }
    if (q.type === 'fill') {
      return {
        isCorrect: ans && q.answer && ans.trim().toLowerCase() === q.answer.trim().toLowerCase(),
        correctAnswer: q.answer,
        userAnswer: ans,
        type: 'fill',
      };
    }
    if (q.type === 'truefalse') {
      return {
        isCorrect: ans === q.answer,
        correctAnswer: q.answer,
        userAnswer: ans,
        type: 'truefalse',
      };
    }
    return null;
  };

  // Use deployed quiz for this screen, or default
  const allQuestions = normalizeQuestions(
    typeof quizIdx === 'number'
      ? (deployedQuizzes[quizIdx] || [])
      : createdQuizzes.length > 0
        ? createdQuizzes
        : (deployedQuizzes.length > 0 ? deployedQuizzes[0] : DEFAULT_QUESTIONS)
  );

  // For edit mode, pass quiz to CreateQuizForm
  const getEditQuiz = () => {
    if (editMode && editQuizIdx !== null && createdQuizzes[editQuizIdx]) {
      return createdQuizzes[editQuizIdx];
    }
    return null;
  };

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.mainContainer}>
        {isFacilitator ? (
          <>
            {/* Only show Add Quiz Item button during creation */}
            {isCreatingNewQuiz && (
              <TouchableOpacity
                style={styles.createQuizBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createQuizBtnText}>＋ Add Quiz Item</Text>
              </TouchableOpacity>
            )}

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.quizWrapper}>
                <Text style={styles.header}>
                  {isCreatingNewQuiz ? 'Create New Quiz' : `Quiz ${quizIdx + 1}`}
                </Text>

                {/* Display quiz items */}
                {(isCreatingNewQuiz ? createdQuizzes : deployedQuizzes[quizIdx] || []).map((q, idx) => (
                  <View key={idx} style={[styles.questionCard]}>
                    <Text style={styles.question}>
                      {idx + 1}. {q.question.replace(/^\d+\.\s*/, '')}
                    </Text>
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
                    {/* Edit/Remove buttons (only before deploy) */}
                    {isCreatingNewQuiz && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: '#FFD305', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 18 }}
                          onPress={() => handleEditQuiz(idx)}
                        >
                          <Text style={{ fontWeight: 'bold', color: '#222' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ backgroundColor: '#e74c3c', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 18 }}
                          onPress={() => handleRemoveQuiz(idx)}
                        >
                          <Text style={{ fontWeight: 'bold', color: '#fff' }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}

                {/* Results section for deployed quiz */}
                {!isCreatingNewQuiz && (
                  <View style={styles.resultsSection}>
                    <Text style={styles.resultsHeader}>Quiz Results</Text>
                    {getParticipantResults().length === 0 ? (
                      <Text style={styles.noResultsText}>No submissions yet</Text>
                    ) : (
                      <View style={{ marginTop: 8 }}>
                        {getParticipantResults().map((r, idx) => (
                          <View key={idx} style={styles.resultCard}>
                            <Text style={styles.resultName}>{r.name}</Text>
                            <Text style={styles.resultSubmitted}>
                              Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : ''}
                            </Text>
                            <Text style={styles.resultAnswersHeader}>Answers:</Text>
                            <View style={{ marginTop: 6 }}>
                              {normalizeQuestions(deployedQuizzes[quizIdx]).map((q, qIdx) => {
                                const ans = r.answers ? r.answers[qIdx] : undefined;
                                const correctness = getCorrectness(q, qIdx, ans);
                                if (!correctness) return (
                                  <Text key={qIdx} style={styles.resultAnswer}>
                                    Question no.{qIdx + 1}: did not answer <Text style={styles.resultType}>({q.type === 'multiple' ? 'multiple choice' : q.type === 'fill' ? 'fill in the blank' : 'true/false'})</Text>
                                  </Text>
                                );
                                let answerDisplay = '';
                                let correctDisplay = '';
                                let answerColor = {};
                                if (correctness.didNotAnswer) {
                                  answerDisplay = `Question no.${qIdx + 1}: did not answer`;
                                  answerColor = styles.didNotAnswerText;
                                  correctDisplay = '';
                                } else if (correctness.type === 'multiple') {
                                  const userIdx = q.choices.findIndex(c => c === correctness.userAnswer);
                                  const userLetter = ['A', 'B', 'C', 'D'][userIdx] || '';
                                  answerDisplay = `Question no.${qIdx + 1}: ${userLetter} (${correctness.userAnswer})`;
                                  correctDisplay = correctness.isCorrect
                                    ? <Text style={styles.correctText}> correct</Text>
                                    : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctLetter})</Text>;
                                  answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                                } else if (correctness.type === 'fill') {
                                  answerDisplay = `Question no.${qIdx + 1}: ${correctness.userAnswer}`;
                                  correctDisplay = correctness.isCorrect
                                    ? <Text style={styles.correctText}> correct</Text>
                                    : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctAnswer})</Text>;
                                  answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                                } else if (correctness.type === 'truefalse') {
                                  answerDisplay = `Question no.${qIdx + 1}: ${correctness.userAnswer}`;
                                  correctDisplay = correctness.isCorrect
                                    ? <Text style={styles.correctText}> correct</Text>
                                    : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctAnswer})</Text>;
                                  answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                                }
                                return (
                                  <Text key={qIdx} style={[styles.resultAnswer, answerColor]}>
                                    {answerDisplay} {correctDisplay} <Text style={styles.resultType}>({q.type === 'multiple' ? 'multiple choice' : q.type === 'fill' ? 'fill in the blank' : 'true/false'})</Text>
                                  </Text>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            {isCreatingNewQuiz ? (
              // Deploy button for new quiz
              createdQuizzes.length > 0 && (
                <TouchableOpacity
                  style={styles.deployQuizBtn}
                  onPress={handleDeploy}
                >
                  <Text style={styles.deployQuizBtnText}>Deploy Quiz</Text>
                </TouchableOpacity>
              )
            ) : (
              // Delete button for deployed quiz
              <TouchableOpacity
                style={styles.deleteQuizBtn}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text style={styles.deleteQuizBtnText}>Delete Quiz</Text>
              </TouchableOpacity>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
              visible={showDeleteConfirm}
              transparent
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Delete Quiz</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete this quiz and all its results?
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
                      onPress={handleDeleteQuiz}
                    >
                      <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showCreateModal}
              transparent
              animationType="fade"
              onRequestClose={() => {
                setShowCreateModal(false);
                setEditMode(false);
                setEditQuizIdx(null);
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.createQuizModalBox}>
                  <CreateQuizForm
                    onClose={() => {
                      setShowCreateModal(false);
                      setEditMode(false);
                      setEditQuizIdx(null);
                    }}
                    onSave={typeof quizIdx === 'number'
                      ? async (quiz) => {
                          // Add item to deployed quiz
                          const updated = deployedQuizzes[quizIdx] ? [...deployedQuizzes[quizIdx], quiz] : [quiz];
                          const quizzes = [...deployedQuizzes];
                          quizzes[quizIdx] = updated;
                          await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
                          setDeployedQuizzes(quizzes);
                          setShowCreateModal(false);
                        }
                      : handleCreateQuiz}
                    editQuiz={getEditQuiz()}
                  />
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
                {/* If already submitted, show result */}
                {hasSubmitted ? (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultName}>{user.username || user.emailAddress || 'You'}</Text>
                    <Text style={styles.resultSubmitted}>
                      Submitted: {(() => {
                        const myResult = getMyResult();
                        return myResult && myResult.submittedAt ? new Date(myResult.submittedAt).toLocaleString() : '';
                      })()}
                    </Text>
                    <Text style={styles.resultAnswersHeader}>Answers:</Text>
                    <View style={{ marginTop: 6 }}>
                      {allQuestions.map((q, qIdx) => {
                        const myResult = getMyResult();
                        const ans = myResult && myResult.answers ? myResult.answers[qIdx] : undefined;
                        const correctness = getCorrectness(q, qIdx, ans);
                        if (!correctness) return (
                          <Text key={qIdx} style={styles.resultAnswer}>
                            Question no.{qIdx + 1}: did not answer <Text style={styles.resultType}>({q.type === 'multiple' ? 'multiple choice' : q.type === 'fill' ? 'fill in the blank' : 'true/false'})</Text>
                          </Text>
                        );
                        let answerDisplay = '';
                        let correctDisplay = '';
                        let answerColor = {};
                        if (correctness.didNotAnswer) {
                          answerDisplay = `Question no.${qIdx + 1}: did not answer`;
                          answerColor = styles.didNotAnswerText;
                          correctDisplay = '';
                        } else if (correctness.type === 'multiple') {
                          const userIdx = q.choices.findIndex(c => c === correctness.userAnswer);
                          const userLetter = ['A', 'B', 'C', 'D'][userIdx] || '';
                          answerDisplay = `Question no.${qIdx + 1}: ${userLetter} (${correctness.userAnswer})`;
                          correctDisplay = correctness.isCorrect
                            ? <Text style={styles.correctText}> correct</Text>
                            : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctLetter})</Text>;
                          answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                        } else if (correctness.type === 'fill') {
                          answerDisplay = `Question no.${qIdx + 1}: ${correctness.userAnswer}`;
                          correctDisplay = correctness.isCorrect
                            ? <Text style={styles.correctText}> correct</Text>
                            : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctAnswer})</Text>;
                          answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                        } else if (correctness.type === 'truefalse') {
                          answerDisplay = `Question no.${qIdx + 1}: ${correctness.userAnswer}`;
                          correctDisplay = correctness.isCorrect
                            ? <Text style={styles.correctText}> correct</Text>
                            : <Text style={styles.incorrectText}> incorrect (correct: {correctness.correctAnswer})</Text>;
                          answerColor = correctness.isCorrect ? styles.correctText : styles.incorrectText;
                        }
                        return (
                          <Text key={qIdx} style={[styles.resultAnswer, answerColor]}>
                            {answerDisplay} {correctDisplay} <Text style={styles.resultType}>({q.type === 'multiple' ? 'multiple choice' : q.type === 'fill' ? 'fill in the blank' : 'true/false'})</Text>
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <>
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
                                onPress={() => setAnswers({ ...answers, [idx]: opt })}
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
                          <View style={styles.inputRow}>
                            <TextInput
                              style={styles.inputFill}
                              placeholder="Type your answer"
                              value={fillInputIdx === idx ? fillInputValue : answers[idx] || ''}
                              onChangeText={text => {
                                if (fillInputIdx === idx) setFillInputValue(text);
                                else setAnswers({ ...answers, [idx]: text });
                              }}
                              onFocus={() => {
                                setFillInputIdx(idx);
                                setFillInputValue(answers[idx] || '');
                              }}
                              onBlur={() => {
                                setAnswers({ ...answers, [idx]: fillInputValue });
                                setFillInputIdx(null);
                                setFillInputValue('');
                              }}
                              onSubmitEditing={() => {
                                setAnswers({ ...answers, [idx]: fillInputValue });
                                setFillInputIdx(null);
                                setFillInputValue('');
                              }}
                              autoFocus={fillInputIdx === idx}
                            />
                          </View>
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
                                onPress={() => setAnswers({ ...answers, [idx]: opt })}
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
                  </>
                )}
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
    padding: 24,
    marginBottom: 24,
    alignSelf: 'center', 
    width: '100%',
    maxWidth: 1200, // Fixed max width for consistency
    minWidth: 800, // Minimum width to prevent squishing
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  question: {
    fontWeight: 'bold',
    fontSize: 18, // Slightly larger font
    marginBottom: 18,
    color: '#222',
    lineHeight: 24, // Better readability
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  optionBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 160, // Minimum width for options
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  optionBtnSelected: {
    backgroundColor: '#FFD305',
    borderColor: '#222',
  },
  optionText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#222',
    fontWeight: 'bold',
  },
  inputRow: {
    marginTop: 12,
    width: '100%',
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
  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    elevation: 1,
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginBottom: 2,
  },
  resultSubmitted: {
    color: '#444',
    fontSize: 14,
    marginBottom: 6,
  },
  resultAnswer: {
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 8,
  },
  correctText: {
    color: 'green',
    fontWeight: 'bold',
  },
  incorrectText: {
    color: 'red',
    fontWeight: 'bold',
  },
  resultType: {
    color: '#888',
    fontSize: 13,
    fontStyle: 'italic',
  },
  deployQuizBtn: {
    position: 'absolute',
    left: 32,
    bottom: 32,
    backgroundColor: '#FFD305',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    elevation: 4,
    zIndex: 100,
  },
  deployQuizBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  deleteQuizBtn: {
    position: 'absolute',
    right: 32,
    bottom: 32,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    elevation: 4,
  },
  deleteQuizBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  inputFill: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    width: '100%',
    maxWidth: 400, // Limit input width
    marginBottom: 8,
  },
  resultAnswersHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 2,
    color: '#222',
  },
  didNotAnswerText: {
    color: '#111',
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 24,
  },
  
  resultsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
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
  
  deleteButtonText: {
    color: '#fff',
  },
  
  modalText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginTop: 8,
  },
  noResultsText: {
    color: '#666',
    fontSize: 15,
    fontStyle: 'italic',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },

  participantName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#444',
  },

  submissionTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },

  answersHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },

  answersContainer: {
    marginLeft: 16,
  },

  answerRow: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },

  correctAnswer: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },

  incorrectAnswer: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },

  noAnswer: {
    color: '#111',
    fontWeight: 'bold',
  },

  questionType: {
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 4,
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
