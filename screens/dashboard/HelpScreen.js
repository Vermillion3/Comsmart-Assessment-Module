import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import SidebarLayout from './SidebarLayout';
import { useNavigation, useRoute } from '@react-navigation/native';


const teamMembers = [
  {
    name: 'Arkady Achondo',
    role: 'Student',
    task: 'Assessment & PC Recommendation',
    email: 'eijiarkady.achondo@unc.edu.ph',
    image: require('../../assets/contact/arkady.png'),
  },
  {
    name: 'John Jabez Cabañero',
    role: 'Student',
    task: 'Learning Management',
    email: 'johnjabez.cabanero@unc.edu.ph',
    image: require('../../assets/contact/jabez.png'),
  },
  {
    name: 'Jose Emmanuel Dometita',
    role: 'Student',
    task: 'Assessment Management',
    email: 'joseemmanuel.dometita@unc.edu.ph',
    image: require('../../assets/contact/jose.png'),
  },
];

export default function HelpScreen() {

  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;

  return (
    <SidebarLayout activeTab="Help">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Our Team</Text>
        <Text style={styles.subtitle}>Meet Our Team</Text>
        <View style={styles.teamContainer}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.card}>
              <Image source={member.image} style={styles.image} />
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.role}>{member.role}</Text>
              <Text style={styles.task}>{member.task}</Text>
              <Text style={styles.email}>{member.email}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Contact', { user })}>
          <Text style={styles.contactButtonText}>Contact Us</Text>
        </TouchableOpacity>
      </ScrollView>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 35,
  },
  card: {
    alignItems: 'center',
    width: 300,
    padding: 10,
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 200,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  role: {
    fontSize: 14,
    color: '#888',
  },
  task: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 4,
  },
  email: {
    fontSize: 12,
    color: '#0066cc',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#FFD305',
    paddingVertical: 12,
    paddingHorizontal: 150,
    borderRadius: 8,
    marginTop: 20,
  },
  contactButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
