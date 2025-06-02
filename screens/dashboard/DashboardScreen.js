import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRecords } from '../../services/apiRecords';
import SidebarLayout from './SidebarLayout';

export default function DashboardScreen({ route }) {
  const navigation = useNavigation();
  const [active, setActive] = useState('Dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const records = await getRecords();
      setUser(records[0]);
    }
    fetchUser();
  }, []);

  return (
    <SidebarLayout activeTab="Dashboard" user={user}>
      <View style={styles.container}>
        <Text style={styles.text}>Dashboard Screen Placeholder</Text>
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
  content: {
    flex: 1,
    backgroundColor: '#ededed',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'relative',
  },
  contentInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
    opacity: 0.7,
  },
  userTypeFooter: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#FFD600',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  userTypeFooterText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});