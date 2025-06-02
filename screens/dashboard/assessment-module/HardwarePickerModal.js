import React from 'react';
import { Modal, View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function HardwarePickerModal({
  visible,
  title = 'PICK A HARDWARE',
  search,
  setSearch,
  options,
  onSelect,
  onClose,
  styles: customStyles = {},
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, customStyles.modalOverlay]}>
        <View style={[styles.modalBox, customStyles.modalBox]}>
          <Text style={[styles.modalTitle, customStyles.modalTitle]}>{title}</Text>
          <TextInput
            style={[styles.searchInput, customStyles.searchInput]}
            placeholder="Search:"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView style={{ width: '100%' }}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.hardwareOption, customStyles.hardwareOption]}
                onPress={() => onSelect(opt)}
              >
                <Image source={opt.icon} style={[styles.hardwareIcon, customStyles.hardwareIcon]} />
                <Text style={[styles.hardwareLabel, customStyles.hardwareLabel]}>{opt.label}</Text>
                <Text style={[styles.infoIcon, customStyles.infoIcon]}>ⓘ</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.returnBtn, customStyles.returnBtn]} onPress={onClose}>
            <Text style={[styles.returnBtnText, customStyles.returnBtnText]}>Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    elevation: 5,
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
});
