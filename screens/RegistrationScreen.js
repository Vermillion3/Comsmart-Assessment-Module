import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { addRecords } from '../services/apiRecords';
import supabase from '../services/supabase';

export default function RegistrationScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('');
  const [authStatus, setAuthStatus] = useState(null);

  const handleRegister = async () => {
    try {
      if (!username.trim() || !emailAddress.trim() || !password.trim() || !confirmPassword.trim() || !userType) {
        alert('Please fill in all fields and select a user type');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: emailAddress.trim(),
        password: password.trim(),
      });

      if (authError) {
        setAuthStatus('not_authenticated');
        alert(authError.message);
        return;
      } else {
        setAuthStatus('authentication sent');
      }

      await addRecords(username.trim(), password.trim(), userType, emailAddress.trim());
      alert('Registration successful. Please verify your email before logging in.');
      navigation.navigate('Login');
    } catch (error) {
      setAuthStatus('not_authenticated');
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={emailAddress}
        autoCapitalize="none"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={password}
        autoCapitalize="none"
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.showHideContainer} onPress={() => setShowPassword(!showPassword)}>
        <Text style={styles.showHide}>{showPassword ? 'Hide Password' : 'Show Password'}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Re-type Password"
        secureTextEntry={!showConfirmPassword}
        value={confirmPassword}
        autoCapitalize="none"
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.showHideContainer} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
        <Text style={styles.showHide}>{showConfirmPassword ? 'Hide Password' : 'Show Password'}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Select User Type:</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setUserType('participant')}
        >
          <Text style={userType === 'participant' ? styles.selected : styles.unselected}>
            Participant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setUserType('facilitator')}
        >
          <Text style={userType === 'facilitator' ? styles.selected : styles.unselected}>
            Facilitator
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={handleRegister} />
      </View>
      <View style={styles.authStatusContainer}>
        {authStatus === 'authenticated' && (
          <Text style={styles.authenticated}>authenticated</Text>
        )}
        {authStatus === 'not_authenticated' && (
          <Text style={styles.notAuthenticated}>not authenticated</Text>
        )}
      </View>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center horizontally
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    width: 260, // Compact width
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showHideContainer: {
    width: 260,
    alignItems: 'flex-end',
    marginTop: -4,
    marginBottom: 8,
  },
  showHide: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    width: 260,
  },
  radioButton: {
    padding: 8,
  },
  selected: {
    fontWeight: 'bold',
    color: 'blue',
  },
  unselected: {
    color: 'black',
  },
  buttonContainer: {
    width: 160,
    marginTop: 16,
    alignSelf: 'center',
  },
  authStatusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  authenticated: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notAuthenticated: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
  },
});
