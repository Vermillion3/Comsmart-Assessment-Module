import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MotherboardTable from './PartTables/MotherboardTable';
import GpuTable from './PartTables/GPUTable';
import CpuTable from './PartTables/CPUTable';
import FanTable from './PartTables/FanTable';
import RamTable from './PartTables/RAMTable';
import PsuTable from './PartTables/PSUTable';
import StorageTable from './PartTables/StorageTable';
import CaseTable from './PartTables/CaseTable';
import DefaultTable from './PartTables/DefaultTable';

export default function PartPickerModal({ visible, selectedPart, partOptions, onSelect, onClose }) {
  const formatPrice = (price) => {
    const rounded = Math.round(price);
    const formattedNumber = rounded.toLocaleString();
    return price <= 0 ? '' : `₱${formattedNumber}`;
  };

  const formatPriceDecimals = (price) => {
    if (price <= 0 || isNaN(price)) return '';
      const formattedNumber = price.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return formattedNumber;
  };


  const handleSelect = (item) => {
    onSelect(item);
    onClose();
  };

  const renderTable = () => {
    const label = selectedPart?.label;

    switch (label) {
      case 'MOTHERBOARD':
        return (
          <MotherboardTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
      case 'GPU':
        return (
          <GpuTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
      case 'CPU':
        return (
          <CpuTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
      case 'FAN':
        return (
          <FanTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
      case 'RAM':
        return (
          <RamTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
            formatPriceDecimals={formatPriceDecimals}
          />
        );
      case 'PSU':
        return (
          <PsuTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
      case 'STORAGE':
        return (
          <StorageTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
            formatPriceDecimals={formatPriceDecimals}
          />
        );
      case 'CASE':
        return (
          <CaseTable
            options={partOptions[label]}
            onSelect={handleSelect}
            formatPrice={formatPrice}
            formatPriceDecimals={formatPriceDecimals}
          />
        );
      default:
        return (
          <DefaultTable
            options={partOptions[label] || []}
            onSelect={handleSelect}
            formatPrice={formatPrice}
          />
        );
    }
  };

  return (
    <Modal visible={visible} 
        animationType='fade' 
        animationInTiming={0.25}
        animationOutTiming={0.25} 
        useNativeDriver={true} 
        transparent={true}
        onRequestClose={onClose}>
      <View style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>{selectedPart?.label}</Text>
          {renderTable()}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  container: { 
    margin: 80,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '70%',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  closeButton: { 
    marginTop: 20, 
    padding: 10, 
    backgroundColor: '#ccc', 
    borderRadius: 5 
  },
  closeText: { 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
});
