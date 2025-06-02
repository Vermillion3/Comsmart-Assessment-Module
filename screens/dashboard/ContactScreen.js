import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SidebarLayout from './SidebarLayout';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ContactScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } ;


  const handleSubmit = () => {
    if (email.trim() === '' || message.trim() === '') {
      console.log('Empty fields alert');
      alert('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    console.log('Showing success alert');
    alert('Message Submitted', `From: ${email}\n\n${message}`);
    setEmail('');
    setMessage('');
    navigation.navigate('Dashboard', { user })
  };


  return (
    <SidebarLayout activeTab="Contact">
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.header}>Get in Touch</Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>WHAT DO YOU HAVE IN MIND</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={12}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
    maxWidth: 800,
    height: '100%', 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 25,
    width: '75%',
    maxWidth: 500,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#FFD305',
    paddingVertical: 14,
    borderRadius: 4,
  },
  submitText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
});
