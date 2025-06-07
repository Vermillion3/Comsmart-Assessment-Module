import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

// Simple radio button component
function RadioButton({ selected, label, onPress }) {
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CreateQuizForm({ onClose, onSave, editQuiz }) {
  // If editing, initialize state from editQuiz
  const [type, setType] = useState(editQuiz?.type || 'multiple');
  const [question, setQuestion] = useState(editQuiz?.question || '');
  const [choices, setChoices] = useState(editQuiz?.choices || ['', '', '', '']);
  const [answer, setAnswer] = useState(editQuiz?.answer || '');
  const [trueFalse, setTrueFalse] = useState(editQuiz?.type === 'truefalse' ? (editQuiz?.answer || 'TRUE') : 'TRUE');

  const handleChoiceChange = (idx, value) => {
    const updated = [...choices];
    updated[idx] = value;
    setChoices(updated);
  };

  const handleSave = () => {
    let quiz = { question, type };
    if (type === 'multiple') {
      quiz.choices = choices;
      quiz.answer = answer; // answer is 'a', 'b', 'c', or 'd'
    } else if (type === 'fill') {
      quiz.answer = answer;
    } else if (type === 'truefalse') {
      quiz.answer = trueFalse;
    }
    if (onSave) onSave(quiz);
    else onClose();
  };

  return (
    <View style={styles.box}>
      <Text style={styles.header}>Create Quiz</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity style={[styles.typeBtn, type === 'multiple' && styles.typeBtnActive]} onPress={() => setType('multiple')}>
          <Text style={[styles.typeBtnText, type === 'multiple' && styles.typeBtnTextActive]}>Multiple Choice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === 'fill' && styles.typeBtnActive]} onPress={() => setType('fill')}>
          <Text style={[styles.typeBtnText, type === 'fill' && styles.typeBtnTextActive]}>Fill in the Blank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === 'truefalse' && styles.typeBtnActive]} onPress={() => setType('truefalse')}>
          <Text style={[styles.typeBtnText, type === 'truefalse' && styles.typeBtnTextActive]}>True/False</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter question"
        value={question}
        onChangeText={setQuestion}
        placeholderTextColor="#888"
      />
      {type === 'multiple' && (
        <>
          {['a', 'b', 'c', 'd'].map((id, idx) => (
            <View key={id} style={styles.choiceRow}>
              <RadioButton
                selected={answer === id}
                label={id.toUpperCase()}
                onPress={() => setAnswer(id)}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder={`Choice ${idx + 1}`}
                value={choices[idx]}
                onChangeText={v => handleChoiceChange(idx, v)}
                placeholderTextColor="#888"
              />
            </View>
          ))}
          <Text style={styles.correctLabel}>
            Correct Answer: {answer ? answer.toUpperCase() : 'None selected'}
          </Text>
        </>
      )}
      {type === 'fill' && (
        <TextInput
          style={styles.input}
          placeholder="Correct Answer"
          value={answer}
          onChangeText={setAnswer}
          placeholderTextColor="#888"
        />
      )}
      {type === 'truefalse' && (
        <View style={styles.trueFalseRow}>
          <TouchableOpacity style={[styles.trueFalseBtn, trueFalse === 'TRUE' && styles.trueFalseBtnActive]} onPress={() => setTrueFalse('TRUE')}>
            <Text style={[styles.trueFalseText, trueFalse === 'TRUE' && styles.trueFalseTextActive]}>TRUE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.trueFalseBtn, trueFalse === 'FALSE' && styles.trueFalseBtnActive]} onPress={() => setTrueFalse('FALSE')}>
            <Text style={[styles.trueFalseText, trueFalse === 'FALSE' && styles.trueFalseTextActive]}>FALSE</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 24,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    elevation: 4,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 18,
    textAlign: 'center',
    color: '#222',
    letterSpacing: 1,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 18,
    justifyContent: 'space-between',
    backgroundColor: '#ededed',
    borderRadius: 8,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#ededed',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#FFD305',
  },
  typeBtnText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 15,
  },
  typeBtnTextActive: {
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    color: '#222',
  },
  trueFalseRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 12,
  },
  trueFalseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#ededed',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  trueFalseBtnActive: {
    backgroundColor: '#FFD305',
  },
  trueFalseText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#666',
  },
  trueFalseTextActive: {
    color: '#222',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginLeft: 8,
  },
  saveBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  cancelBtn: {
    backgroundColor: '#ededed',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginLeft: 8,
  },
  cancelBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD305',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#FFD305',
    backgroundColor: '#FFD305',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#222',
  },
  radioLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginRight: 4,
    minWidth: 18,
  },
  correctLabel: {
    fontWeight: 'bold',
    color: '#222',
    marginTop: 6,
    marginBottom: 2,
    fontSize: 15,
  },
});
