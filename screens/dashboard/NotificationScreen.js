import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SidebarLayout from './SidebarLayout';

export default function NotificationScreen() {
  return (
    <SidebarLayout activeTab="Notification">
      <View style={styles.container}>
        <Text style={styles.text}>Notification Screen Placeholder</Text>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 22,
    color: '#333',
  },
});
