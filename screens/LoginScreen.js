import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { getRecords } from '../services/apiRecords';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const records = await getRecords();
      const user = records.find(
        (user) => user.username === username.trim() && user.password === password.trim()
      );
      if (user) {
        //Removed alert for faster login
        //alert(`Login successful as ${user.userType}`);

        navigation.navigate('Dashboard', { user });
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          autoCapitalize="none"
          onChangeText={setUsername}
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
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
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
  form: {
    alignItems: 'center',
    width: 280,
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
    width: 260,
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
  buttonContainer: {
    width: 160,
    marginTop: 16,
    alignSelf: 'center',
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
