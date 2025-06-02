import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function GpuTable({ options, onSelect, formatPrice }) {
  const specs = {
    'NVIDIA RTX 3060': { memory: '8GB', tdp: '115W', core_clock: '1320 MHz', boost_clock: '1777 MHz' },
    'NVIDIA RTX 4070': { memory: '12GB', tdp: '200W', core_clock: '1980 MHz', boost_clock: '2505 MHz' },
    'RADEON RX 6800': { memory: '16GB', tdp: '250W', core_clock: '1700 MHz', boost_clock: '2105 MHz' },
  };

  const renderItem = ({ item }) => {
    const spec = specs[item.value] || {};
    return (
      <HoverableOpacity
        onPress={() => onSelect(item)}
        outerStyle={styles.row}
        hoverStyle={styles.rowHovered}
      >
        <>
          <Text style={styles.cell}>{item.value}</Text>
          <Text style={styles.cell}>{spec.memory || '—'}</Text>
          <Text style={styles.cell}>{spec.tdp || '—'}</Text>
          <Text style={styles.cell}>{spec.core_clock || '—'}</Text>
          <Text style={styles.cell}>{spec.boost_clock || '—'}</Text>
          <Text style={styles.cell}>{formatPrice(item.price)}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Memory</Text>
        <Text style={styles.cellHeader}>TDP</Text>
        <Text style={styles.cellHeader}>Core Clock</Text>
        <Text style={styles.cellHeader}>Boost Clock</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
