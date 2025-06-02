import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SidebarLayout from './SidebarLayout';
import { useRoute } from '@react-navigation/native';

export default function LearningMaterialsScreen() {
  const route = useRoute();
  const user = route.params?.user;

  return (
    <SidebarLayout activeTab="Learning materials" user={user}>
      <View style={styles.container}>
        <Text style={styles.text}>Learning Materials Screen Placeholder</Text>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    color: '#333',
  },
});
