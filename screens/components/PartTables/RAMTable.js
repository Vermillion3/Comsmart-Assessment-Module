import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function RamTable({ options, onSelect, formatPrice, formatPriceDecimals }) {
  const specs = {
    'Kingston HyperX Fury 8 GB': { speed: 'DDR4-2666', size: '8', cas: '16', },
    'Corsair Vengeance LPX 16 GB': { speed: 'DDR4-3000', size: '16', cas: '16', },
    'G.Skill Ripjaws V 32 GB': { speed: 'DDR4-3200', size: '32', cas: '16', },
  };

  const renderItem = ({ item }) => {
    const spec = specs[item.value] || {};
    const sizeInGB = parseFloat(spec.size);
    const price = item.price;
    const pricePerGB = (price && sizeInGB) ? price / sizeInGB : null;
    
    return (
      <HoverableOpacity
        onPress={() => onSelect(item)}
        outerStyle={styles.row}
        hoverStyle={styles.rowHovered}
      >
        <>
          <Text style={styles.cell}>{item.value}</Text>
          <Text style={styles.cell}>{spec.speed || '—'}</Text>
          <Text style={styles.cell}>{pricePerGB ? formatPriceDecimals(pricePerGB) : '—'}</Text>
          <Text style={styles.cell}>{spec.cas || '—'} </Text>
          <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Speed</Text>
        <Text style={styles.cellHeader}>Price / GB</Text>
        <Text style={styles.cellHeader}>CAS Latency</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
