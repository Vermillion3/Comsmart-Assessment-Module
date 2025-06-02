import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function PsuTable({ options, onSelect, formatPrice }) {
  const specs = {
    'CORSAIR CX650M': { type: 'ATX', efficiency: '80+ Bronze', wattage: '650 W', modular: 'Yes', },
    'MSI MAG A750GL PCIE5': { type: 'ATX', efficiency: '80+ Gold', wattage: '750 W', modular: 'Yes', },
    'Thermaltake Smart': { type: 'ATX', efficiency: '80+', wattage: '500 W', modular: 'Yes', },
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
          <Text style={styles.cell}>{spec.type || '—'}</Text>
          <Text style={styles.cell}>{spec.efficiency || '—'}</Text>
          <Text style={styles.cell}>{spec.wattage || '—'}</Text>
          <Text style={styles.cell}>{spec.modular || '—'}</Text>
          <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Type</Text>
        <Text style={styles.cellHeader}>Efficiency Rating</Text>
        <Text style={styles.cellHeader}>Wattage</Text>
        <Text style={styles.cellHeader}>Modular</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
