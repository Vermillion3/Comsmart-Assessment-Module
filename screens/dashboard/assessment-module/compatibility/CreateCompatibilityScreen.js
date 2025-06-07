import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert } from 'react-native';
import SidebarLayout from '../../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PC_COMPONENTS = [
  { label: 'GPU', icon: require('../../../../assets/part_icons/GPU.png') },
  { label: 'MOTHERBOARD', icon: require('../../../../assets/part_icons/MOBO.png') },
  { label: 'CPU', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'CASE', icon: require('../../../../assets/part_icons/CASE.png') },
];

const HARDWARE_OPTIONS = [
  { label: 'RYZEN 5 2600', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'Intel i7-7700K', icon: require('../../../../assets/part_icons/CPU.png') },
  { label: 'RYZEN 7 5800x', icon: require('../../../../assets/part_icons/CPU.png') },
];

export default function CreateCompatibilityScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  
  
  if (user?.userType !== 'facilitator') {
    return (
      <SidebarLayout activeTab="Assessment" user={user}>
        <View style={styles.container}>
          <Text style={styles.header}>Access Denied</Text>
          <Text>Only facilitators can create assessments.</Text>
        </View>
      </SidebarLayout>
    );
  }

  const [pairs, setPairs] = useState([]);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selecting, setSelecting] = useState({ pairIdx: null, side: null }); 
  const [componentSelect, setComponentSelect] = useState({ step: 0, left: null, right: null });

  
  const handleAddPair = () => {
    setComponentSelect({ step: 1, left: null, right: null });
    setShowComponentModal(true);
    setSearch('');
  };

  
  const handleSelectComponent = (component) => {
    if (componentSelect.step === 1) {
      setComponentSelect({ ...componentSelect, left: component, step: 2 });
      setSearch('');
    } else if (componentSelect.step === 2) {
      setPairs([...pairs, {
        left: { component, hardware: null },
        right: { component: componentSelect.left, hardware: null }
      }]);
      setShowComponentModal(false);
      setComponentSelect({ step: 0, left: null, right: null });
      setSearch('');
    }
  };

  
  const handleAddHardware = (pairIdx, side) => {
    setSelecting({ pairIdx, side });
    setShowHardwareModal(true);
    setSearch('');
  };

  
  const handleSelectHardware = (hardware) => {
    const updated = [...pairs];
    updated[selecting.pairIdx][selecting.side].hardware = hardware;
    setPairs(updated);
    setShowHardwareModal(false);
    setSelecting({ pairIdx: null, side: null });
    setSearch('');
  };

  
  const handleRemovePair = (idx) => {
    setPairs(pairs.filter((_, i) => i !== idx));
  };

  
  const handleRemoveHardware = (pairIdx, side) => {
    const updated = [...pairs];
    updated[pairIdx][side].hardware = null;
    setPairs(updated);
  };

  
  const filteredComponents = PC_COMPONENTS.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) &&
    (componentSelect.step !== 2 || c.label !== componentSelect.left.label)
  );
  const filteredHardware = HARDWARE_OPTIONS.filter(h =>
    h.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeploy = async () => {
    try {
      // Validate if there are pairs to deploy
      if (pairs.length === 0) {
        Alert.alert('Error', 'Please add at least one component pair');
        return;
      }

      // Validate if left hardware is selected for each pair
      const missingLeftHardware = pairs.some(pair => !pair.left.hardware);
      if (missingLeftHardware) {
        Alert.alert('Error', 'Please add hardware for all left components');
        return;
      }

      // Create assessment object
      const newAssessment = {
        id: `comp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        pairs: pairs,
        results: {}
      };

      // Get existing assessments or initialize empty array
      const stored = await AsyncStorage.getItem('DEPLOYED_COMPATIBILITY');
      let assessments = [];
      if (stored) {
        assessments = JSON.parse(stored);
      }

      // Add new assessment and save
      const updatedAssessments = [...assessments, newAssessment];
      await AsyncStorage.setItem('DEPLOYED_COMPATIBILITY', JSON.stringify(updatedAssessments));

      Alert.alert(
        'Success',
        'Assessment deployed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Deploy error:', error);
      Alert.alert('Error', 'Failed to deploy assessment');
    }
  };

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outerWrapper}>
        <Text style={styles.header}>CREATE COMPATIBILITY ASSESSMENT</Text>
        <ScrollView style={styles.scrollArea}>
          {pairs.map((pair, idx) => (
            <View key={idx} style={styles.row}>
              {/* Left Card */}
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Image source={pair.left.component.icon} style={styles.icon} />
                  <Text style={styles.cardLabel}>{pair.left.component.label}</Text>
                  {pair.left.hardware && (
                    <View style={styles.selectedHardware}>
                      <Image source={pair.left.hardware.icon} style={styles.selectedIcon} />
                      <Text style={styles.selectedLabel}>{pair.left.hardware.label}</Text>
                      <TouchableOpacity onPress={() => handleRemoveHardware(idx, 'left')}>
                        <Text style={styles.removeHardwareBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {!pair.left.hardware && (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddHardware(idx, 'left')}
                  >
                    <Text style={styles.addBtnText}>＋ Add Hardware</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Compatible To */}
              <View style={styles.compatibleTo}>
                <Text style={styles.compatibleText}>COMPATIBLE TO:</Text>
              </View>
              {/* Right Card - No Add Hardware button */}
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Image source={pair.right.component.icon} style={styles.icon} />
                  <Text style={styles.cardLabel}>{pair.right.component.label}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.addComponentBtn} onPress={handleAddPair}>
          <Text style={styles.addComponentBtnText}>＋ Add PC Component Pair</Text>
        </TouchableOpacity>
        {/* Add Deploy button at bottom left */}
        {pairs.length > 0 && (
          <TouchableOpacity 
            style={styles.deployButton}
            onPress={handleDeploy}
          >
            <Text style={styles.deployButtonText}>DEPLOY ASSESSMENT</Text>
          </TouchableOpacity>
        )}
        <Modal
          visible={showComponentModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowComponentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {componentSelect.step === 1 ? 'SELECT FIRST PC COMPONENT' : 'SELECT SECOND PC COMPONENT TO COMPARE'}
              </Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search:"
                value={search}
                onChangeText={setSearch}
              />
              <ScrollView style={{ width: '100%' }}>
                {filteredComponents.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.hardwareOption}
                    onPress={() => handleSelectComponent(c)}
                  >
                    <Image source={c.icon} style={styles.hardwareIcon} />
                    <Text style={styles.hardwareLabel}>{c.label}</Text>
                    <Text style={styles.infoIcon}>ⓘ</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.returnBtn} onPress={() => setShowComponentModal(false)}>
                <Text style={styles.returnBtnText}>Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showHardwareModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHardwareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>PICK A COMPATIBLE HARDWARE</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search:"
                value={search}
                onChangeText={setSearch}
              />
              <ScrollView style={{ width: '100%' }}>
                {filteredHardware.map((h, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.hardwareOption}
                    onPress={() => handleSelectHardware(h)}
                  >
                    <Image source={h.icon} style={styles.hardwareIcon} />
                    <Text style={styles.hardwareLabel}>{h.label}</Text>
                    <Text style={styles.infoIcon}>ⓘ</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.returnBtn} onPress={() => setShowHardwareModal(false)}>
                <Text style={styles.returnBtnText}>Return</Text>
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
    backgroundColor: '#ededed',
    padding: 32,
    alignItems: 'flex-start',
    width: '100%',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 24,
    marginLeft: 4,
  },
  scrollArea: {
    width: '100%',
    maxHeight: 480,
    marginBottom: 24,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  removeBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  removeBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addComponentBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addComponentBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
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
  removeHardwareBtn: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  deployButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  
  deployButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    letterSpacing: 1,
  },
});
