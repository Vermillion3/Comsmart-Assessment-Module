import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';

const STEPS = [
  {
    label: 'Step 1',
    title: 'Step Example',
    image: require('../../../../assets/hardware/mobo.png'),
  },
  {
    label: 'Step 2',
    title: 'Step Example',
    image: require('../../../../assets/hardware/moboWithProccessor.png'),
  },
];

export default function FinalAssessmentAssemblyScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const [step, setStep] = useState(0);
  const [descriptions, setDescriptions] = useState(['', '']);
  const [editing, setEditing] = useState(true);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    setEditing(true);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleDescChange = (text) => {
    const newDescs = [...descriptions];
    newDescs[step] = text;
    setDescriptions(newDescs);
  };

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outer}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Assembly</Text>
          <Text style={styles.finalLabel}>Final</Text>
        </View>
        <View style={styles.stepBar}>
          <Text style={styles.stepBarText}>{STEPS[step].label}</Text>
        </View>
        <View style={styles.contentRow}>
          <View style={styles.leftCol}>
            <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
            {editing ? (
              <>
                <TextInput
                  style={styles.stepDescInput}
                  multiline
                  value={descriptions[step]}
                  onChangeText={handleDescChange}
                  placeholder="Enter step description..."
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.stepDesc}>{descriptions[step]}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.rightCol}>
            <Image source={STEPS[step].image} style={styles.stepImage} />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
            onPress={handleBack}
            disabled={step === 0}
          >
            <Text style={styles.navBtnText}>BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, step === STEPS.length - 1 && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={step === STEPS.length - 1}
          >
            <Text style={styles.navBtnText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#ededed',
    padding: 0,
    width: '100%',
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingTop: 24,
    marginBottom: 8,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222',
  },
  finalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    opacity: 0.7,
    marginBottom: 2,
  },
  stepBar: {
    backgroundColor: '#bbb',
    marginHorizontal: 32,
    borderRadius: 4,
    marginBottom: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  stepBarText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    width: '100%',
    flex: 1,
  },
  leftCol: {
    flex: 1,
    maxWidth: 400,
    marginRight: 32,
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#222',
  },
  stepDesc: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    minHeight: 40,
  },
  stepDescInput: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 10,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  saveBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
  },
  editBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  editBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    letterSpacing: 1,
  },
  rightCol: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepImage: {
    width: 735, // 420 * 1.75
    height: 560, // 320 * 1.75
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    marginTop: 12,
    gap: 16,
  },
  navBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 38,
    marginLeft: 12,
    minWidth: 110,
    alignItems: 'center',
    elevation: 2,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
  },
});

