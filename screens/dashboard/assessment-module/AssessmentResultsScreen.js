import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SidebarLayout from '../SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';


const SAMPLE_RESULTS = {
  'PRACTICE ASSESSMENT: QUIZ': [
    { name: 'Jim Halpert', score: '12/15', status: 'Completed' },
    { name: 'Ron Swanson', score: '9/15', status: 'Completed' },
    { name: 'Lalo Salamanca', score: '7/15', status: 'In Progress' },
  ],
  'PRACTICE ASSESSMENT: COMPATIBILITY': [
    { name: 'Jim Halpert', score: '5/5', status: 'Completed' },
    { name: 'Ron Swanson', score: '4/5', status: 'Completed' },
    { name: 'Lalo Salamanca', score: '-/5', status: 'Not Started' },
  ],
  'PRACTICE ASSESSMENT: PART-PICKER': [
    { name: 'Jim Halpert', score: '13/15', status: 'Completed' },
    { name: 'Ron Swanson', score: '10/15', status: 'In Progress' },
    { name: 'Lalo Salamanca', score: '-/15', status: 'Not Started' },
  ],
  'FINAL ASSESSMENT': [
    { name: 'Jim Halpert', score: '85/100', status: 'Completed' },
    { name: 'Ron Swanson', score: '70/100', status: 'Completed' },
    { name: 'Lalo Salamanca', score: '-/100', status: 'Not Started' },
  ],
};

export default function AssessmentResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  const assessmentType = route.params?.assessmentType;

  const results = SAMPLE_RESULTS[assessmentType] || [];

  return (
    <SidebarLayout activeTab="Assessment" user={user}>
      <View style={styles.outer}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>{assessmentType} - Results</Text>
          <TouchableOpacity style={styles.returnBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.returnBtnText}>Return</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.cellHeader, { flex: 2 }]}>Participant</Text>
          <Text style={[styles.cell, styles.cellHeader]}>Score</Text>
          <Text style={[styles.cell, styles.cellHeader]}>Status</Text>
        </View>
        <ScrollView style={{ width: '100%' }}>
          {results.map((r, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]}>{r.name}</Text>
              <Text style={styles.cell}>{r.score}</Text>
              <Text style={styles.cell}>{r.status}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#ededed',
    padding: 32,
    alignItems: 'flex-start',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 0,
    marginLeft: 4,
    color: '#222',
  },
  returnBtn: {
    backgroundColor: '#FFD305',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
  },
  returnBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  tableHeader: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFD305',
    borderRadius: 6,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    textAlign: 'left',
  },
  cellHeader: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
});
