import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import SidebarLayout from './SidebarLayout';
import { useRoute } from '@react-navigation/native';
import Gauge from '../components/Gauge';
import PartPickerModal from '../components/PartPickerModal';

export default function PCRecommendationScreen() {
  const route = useRoute();
  const user = route.params?.user;

  const partImages = {
    MOTHERBOARD: require('../../assets/part_icons/MOBO.png'),
    GPU: require('../../assets/part_icons/GPU.png'),
    CPU: require('../../assets/part_icons/CPU.png'),
    FAN: require('../../assets/part_icons/FAN.png'),
    RAM: require('../../assets/part_icons/RAM.png'),
    PSU: require('../../assets/part_icons/PSU.png'),
    STORAGE: require('../../assets/part_icons/STORAGE.png'),
    CASE: require('../../assets/part_icons/CASE.png'),
  };

  const partOptions = {
    MOTHERBOARD: [
      { value: 'GIGABYTE B550M GAMING X WIFI6', price: 13908, },
      { value: 'MSI B650 GAMING PLUS WIFI', price: 8866, },
      { value: 'MSI B760 GAMING PLUS WIFI', price: 9143, },
    ],
    GPU: [
      { value: 'NVIDIA RTX 3060', price: 28482 },
      { value: 'NVIDIA RTX 4070', price: 75915 },
      { value: 'RADEON RX 6800', price: 26598 },
    ],
    CPU: [
      { value: 'RYZEN 5 5600', price: 6538 },
      { value: 'RYZEN 7 5800X', price: 8893 },
      { value: 'Intel i5 12400F', price: 6040 },
    ],
    FAN: [
      { value: 'Wraith Stealth (Stock)', price: 0 },
      { value: 'Cooler Master Hyper 212 Black Edition', price: 1662 },
      { value: 'ARCTIC Liquid Freezer III 360', price: 7757 },
    ],
    RAM: [
      { value: 'Kingston HyperX Fury 8 GB', price: 2942 },
      { value: 'Corsair Vengeance LPX 16 GB', price: 4600 },
      { value: 'G.Skill Ripjaws V 32 GB', price: 7900 },
    ],
    PSU: [
      { value: 'CORSAIR CX650M', price: 4433 },
      { value: 'MSI MAG A750GL PCIE5', price: 6095 },
      { value: 'Thermaltake Smart', price: 2216 },
    ],
    STORAGE: [
      { value: 'SAMSUNG 870 EVO', price: 5264 },
      { value: 'Crucial P3 Plus', price: 3435 },
      { value: 'Seagate BarraCuda', price: 4653 },
    ],
    CASE: [
      { value: 'Fractal Design North', price: 7757 },
      { value: 'Phanteks XT PRO', price: 3823 },
      { value: 'Cooler Master MasterBox Q300L', price: 2221 },
    ],
  };

  const initialComponents = Object.entries(partOptions).map(([label, options]) => ({
    label,
    value: options[0].value,
    price: options[0].price,
    image: partImages[label],
  }));
  
  const [components, setComponents] = useState(initialComponents);
  
  const formatPrice = (num) => {
    const rounded = Math.round(num);
    const formattedNumber = rounded.toLocaleString(); // Adds commas
    return num <= 0 ? '' : `₱${formattedNumber}`;
  };
  
  const totalPrice = components.reduce((sum, comp) => sum + (comp.price || 0), 0);

  const benchmarkScores = {
    'NVIDIA RTX 3060': 12000,
    'NVIDIA RTX 4070': 19000,
    'RADEON RX 6800': 16000,
    'RYZEN 5 5600': 4000,
    'RYZEN 7 5800X': 5000,
    'Intel i5 12400F': 4500,
  };

  const powerUsages = {
    'NVIDIA RTX 3060': 170,
    'NVIDIA RTX 4070': 200,
    'RADEON RX 6700 XT': 230,
    'RYZEN 5 5600': 65,
    'RYZEN 7 5800X': 105,
    'Intel i5 12400F': 65,
  };

  const psuOutput = {
    'CORSAIR CX 650M': 650,
    'MSI MAG A750GL PCIE5': 750,
    'Thermaltake Smart': 600,
  }

  const psuComponent = components.find((comp) => comp.label === 'PSU');
  const psuWatts = psuOutput[psuComponent?.value] || 0;

  const benchmarkScore = components.reduce((sum, comp) => {
    return sum + (benchmarkScores[comp.value] || 0);
  }, 0);

  const powerUsage = components.reduce((sum, comp) => {
    return sum + (powerUsages[comp.value] || 0);
  }, 0);

  const budget = 70000;

  const gauges = [
    {
      label: 'Budget',
      size: 200,
      value: totalPrice,
      limit: budget,
      max: Math.round(budget + (budget * 0.25)),
      isPrice: true,
    },
    {
      label: 'Benchmark Score',
      size: 200,
      value: benchmarkScore,
      limit: 15000,
      max: 25000,
      invertColor: true,
    },
    {
      label: 'Power Usage',
      size: 200,
      value: powerUsage,
      limit: Math.round(psuWatts * 0.8),
      max: psuWatts,
    },
  ];

  const buttons = [
    { label: 'RECOMMEND',
      color: '#FFD305',
    },
    { label: 'SAVE BUILD',
      color: '#81CE65',
    },
  ];

  const [selectedPart, setSelectedPart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePartPress = (item) => {
    setSelectedPart(item);
    setModalVisible(true);
  };

  const handleRecommendButton = () => {
    setComponents(initialComponents);
    alert('Parts Recommended');
  }

  const handleSaveButton = () => {
    alert('Build Saved');
  }

  const handlePartSelect = (selectedPartLabel, selectedOption) => {
    const updatedComponents = components.map(comp => {
      if (comp.label === selectedPartLabel) {
        return {
          ...comp,
          value: selectedOption.value,
          price: selectedOption.price,
        };
      }
      return comp;
    });
    setComponents(updatedComponents);
  };

  return (

    <SidebarLayout activeTab="PC Recommendation" user={user}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.header}>Recommendations</Text>
        <View style={styles.divider} />

        <View style={styles.grid}>
          {components.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.partsCard}
              onPress={() => handlePartPress(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.label}>{item.label}</Text>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.label}>{formatPrice(item.price)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.grid}>
          <TouchableOpacity onPress={handleRecommendButton} style={[styles.buttonsCard, styles.recommendButton]}>
            <Text style={styles.buttonText}>Recommend</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPrice}>Total Price: {formatPrice(gauges[0].value)}</Text>
        </View>
        
        <View style={styles.gaugeGrid}>
          {gauges.map((gauges, index) => (
            <View key={index} style={styles.gaugeCard}>
              <Text style={styles.gaugeLabel}>{gauges.label}</Text>
              <Gauge size={gauges.size} value={gauges.value} limit={gauges.limit} max={gauges.max} isPrice={gauges.isPrice} invertColor={gauges.invertColor}/>
            </View>
          ))}
        </View>
        
        <View style={styles.grid}>
          <TouchableOpacity onPress={handleSaveButton} style={[styles.buttonsCard, styles.saveButton]}>
            <Text style={styles.buttonText}>Save Build</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    
      <PartPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedPart={selectedPart}
        partOptions={partOptions}
        onSelect={(item) => {
          handlePartSelect(selectedPart.label, item);
          setModalVisible(false);
        }}
        components={components}
        setComponents={setComponents}
        formatPrice={formatPrice}
      />

    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: -5,
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 12,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  gaugeCard: {
    backgroundColor: '#00000040',
    borderRadius: 2.5,
    borderColor: '#00000080',
    borderWidth: 1,
    padding: 12,
    marginTop: 0,
    margin: 8,
    width: '20%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 160,
  },
  partsCard: {
    backgroundColor: '#00000040',
    borderRadius: 2.5,
    borderColor: '#00000080',
    borderWidth: 1,
    padding: 12,
    margin: 8,
    width: '10%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 160,
  },
  buttonsCard: {
    borderRadius: 5,
    padding: 12,
    margin: 8,
    marginBottom: 20,
    width: '10%',
    alignItems: 'center',
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    minWidth: 160,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#81CE65',
  },
  recommendButton: {
    backgroundColor: '#FFD305',
  },
  image: {
    width: 70,
    height: 70,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 6,
    textAlign: 'center',
  },
  gaugeLabel: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#444',
    textAlign: 'center',
    marginBottom: 6,
    textAlign: 'center',
  },
  totalPriceContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#00000040',
    marginTop: 5,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    width: '62%',
  },
  totalPrice: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#444',
    marginVertical: 4,
  },
});
