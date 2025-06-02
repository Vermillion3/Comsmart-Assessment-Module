import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import SidebarLayout from './SidebarLayout';
import { useRoute } from '@react-navigation/native';
import { getRecords } from '../../services/apiRecords';
import supabase from '../../services/supabase';

export default function UserAccountScreen() {
  const route = useRoute();
  const user = route.params?.user;
  const [info, setInfo] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    participantType: '',
    age: '',
    gender: '',
    contactNo: '',
  });
  const [editing, setEditing] = useState(false);
  const [infoId, setInfoId] = useState(null);
  const [loading, setLoading] = useState(true);
// dynamic
  useEffect(() => {
    async function fetchUserInfo() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('userInformation')
        .select('*')
        .eq('userID', user.id) 
        .single();

      if (error) {
        console.error("Fetch error:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setInfo({
          firstName: data.firstName || '',
          middleInitial: data.middleInitial || '',
          lastName: data.lastName || '',
          participantType: data.participantType || '',
          age: data.age ? String(data.age) : '',
          gender: data.gender || '',
          contactNo: data.contactNo || '',
        });
        setInfoId(data.id);
      }
      setLoading(false);
    }
    fetchUserInfo();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const payload = {
      userID: user.id,
      firstName: info.firstName,
      middleInitial: info.middleInitial,
      lastName: info.lastName,
      participantType: info.participantType,
      age: info.age ? parseInt(info.age) : null,
      gender: info.gender,
      contactNo: info.contactNo,
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });

    let error;
    if (infoId) {
      ({ error } = await supabase
        .from('userInformation')
        .update(payload)
        .eq('id', infoId));
    } else {
      const { error: insertError, data } = await supabase
        .from('userInformation')
        .insert([payload])
        .select()
        .single();
      error = insertError;
      if (data) setInfoId(data.id);
    }

    if (error) {
      console.error("Save error:", error);
      Alert.alert('Error', 'Failed to save user information.');
    } else {
      Alert.alert('Success', 'User information saved.');
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!infoId) return;
    const { error } = await supabase
      .from('userInformation')
      .delete()
      .eq('id', infoId);
    if (error) {
      Alert.alert('Error', 'Failed to delete user information.');
    } else {
      setInfo({
        firstName: '',
        middleInitial: '',
        lastName: '',
        participantType: '',
        age: '',
        gender: '',
        contactNo: '',
      });
      setInfoId(null);
      setEditing(false);
      Alert.alert('Deleted', 'User information deleted.');
    }
  };

  const sidebarUser = { ...user, imageUrl: info.imagepath };

  return (
    <SidebarLayout activeTab="User Account" user={sidebarUser}>
      <View style={styles.container}>
        <Text style={styles.header}>User Account</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Image</Text>
          <View style={styles.profileImageRow}>
            <Image
              source={require('../../assets/cosmart_logo_white.png')}
              style={styles.profileImage}
            />
            {/* saka nani */}
            {/* {editing ? (
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <Text style={styles.uploadButtonText}>Upload a new Profile Image</Text>
              </TouchableOpacity>
            ) : null} */}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Name:</Text>
            {editing ? (
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={info.firstName}
                  onChangeText={v => setInfo({ ...info, firstName: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="M.I."
                  value={info.middleInitial}
                  onChangeText={v => setInfo({ ...info, middleInitial: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={info.lastName}
                  onChangeText={v => setInfo({ ...info, lastName: v })}
                />
              </View>
            ) : (
              <Text>
                {info.firstName} {info.middleInitial} {info.lastName}
              </Text>
            )}
            <Text style={styles.infoLabel}>Participant type:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Participant Type"
                value={info.participantType}
                onChangeText={v => setInfo({ ...info, participantType: v })}
              />
            ) : (
              <Text>{info.participantType}</Text>
            )}
            <Text style={styles.infoLabel}>Age:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={info.age}
                onChangeText={v => setInfo({ ...info, age: v })}
              />
            ) : (
              <Text>{info.age ? `${info.age} years old` : ''}</Text>
            )}
            <Text style={styles.infoLabel}>Gender:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Gender"
                value={info.gender}
                onChangeText={v => setInfo({ ...info, gender: v })}
              />
            ) : (
              <Text>{info.gender}</Text>
            )}
            <Text style={styles.infoLabel}>Email:</Text>
            <Text>{user?.emailAddress}</Text>
            <Text style={styles.infoLabel}>Contact:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Contact No."
                value={info.contactNo}
                onChangeText={v => setInfo({ ...info, contactNo: v })}
              />
            ) : (
              <Text>{info.contactNo}</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonRowWithMargin}>
          {editing ? (
            <>
              <Button title="Cancel" onPress={() => setEditing(false)} />
              <Button
                title="Save"
                onPress={async () => {
                  await handleSave();
                  setEditing(false); // Ensure exit from editing after save
                }}
              />
            </>
          ) : (
            <>
              <Button title="Edit" onPress={() => setEditing(true)} />
              {infoId && <Button title="Delete" color="red" onPress={handleDelete} />}
            </>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Competency</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Learning Progression:</Text>
            <Text>n/a</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button title="Reset Password" onPress={() => Alert.alert('Reset Password', 'Feature not implemented.')} />
        </View>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ededed',
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  profileImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    marginRight: 16,
  },
  uploadButton: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoBox: {
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 6,
    marginVertical: 4,
    marginRight: 4,
    minWidth: 80,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  buttonRowWithMargin: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
    marginBottom: 32, // Add space below the button row
  },
});
