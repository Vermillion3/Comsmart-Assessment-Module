import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function CaseTable({ options, onSelect, formatPrice }) {
  const specs = {
    'Fractal Design North': { type: 'ATX Mid Tower', color: 'White', side_panel: 'Tempered Glass', volume: '45.1 L', bays: '2' },
    'Phanteks XT PRO': { type: 'ATX Mid Tower', color: 'Black', side_panel: 'Tempered Glass', volume: '51.8 L', bays: '2' },
    'Cooler Master MasterBox Q300L': { type: 'MicroATX Mini Tower', color: 'Black', side_panel: 'Acrylic', volume: '33.6 L', bays: '1' },
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
          <Text style={styles.cell}>{spec.color || '—'}</Text>
          <Text style={styles.cell}>{spec.side_panel || '—'}</Text>
          <Text style={styles.cell}>{spec.volume || '—'}</Text>
          <Text style={styles.cell}>{spec.bays || '—'}</Text>
          <Text style={styles.cell}>{formatPrice(item.price)}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Type</Text>
        <Text style={styles.cellHeader}>Color</Text>
        <Text style={styles.cellHeader}>Side Panel</Text>
        <Text style={styles.cellHeader}>External Volume</Text>
        <Text style={styles.cellHeader}>Drive Bays</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
