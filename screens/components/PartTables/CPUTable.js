import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function CpuTable({ options, onSelect, formatPrice }) {
  const specs = {
    'RYZEN 5 5600': { cores: '8GB', microarchitecture: '115W', core_clock: '1320', boost_clock: '1777' },
    'RYZEN 7 5800X': { cores: '12GB', microarchitecture: '200W', core_clock: '1980', boost_clock: '2505' },
    'Intel i5 12400F': { cores: '16GB', microarchitecture: '250W', core_clock: '1700', boost_clock: '2105' },
  };

  const renderItem = ({ item }) => {
    const spec = specs[item.value] || {};
    return (
      <HoverableOpacity
        onPress={() => onSelect(item)}
        outerStyle={styles.row}
        hoverStyle={styles.rowHovered}
      >
        <Text style={styles.cell}>{item.value}</Text>
        <Text style={styles.cell}>{spec.cores || '—'}</Text>
        <Text style={styles.cell}>{spec.microarchitecture || '—'}</Text>
        <Text style={styles.cell}>{spec.core_clock || '—'} MHz</Text>
        <Text style={styles.cell}>{spec.boost_clock || '—'} MHz</Text>
        <Text style={styles.cell}>{formatPrice(item.price)}</Text>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Core Count</Text>
        <Text style={styles.cellHeader}>Microarchitecture</Text>
        <Text style={styles.cellHeader}>Core Clock</Text>
        <Text style={styles.cellHeader}>Boost Clock</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}