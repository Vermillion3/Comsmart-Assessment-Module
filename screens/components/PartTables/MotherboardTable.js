import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function MotherboardTable({ options, onSelect, formatPrice }) {
  const specs = {
    'GIGABYTE B550M GAMING X WIFI6': { socket: 'AM4', form_factor: 'Micro-ATX', slots: 4, },
    'MSI B650 GAMING PLUS WIFI': { socket: 'AM5', form_factor: 'ATX', slots: 4, },
    'MSI B760 GAMING PLUS WIFI': { socket: 'LGA1700', form_factor: 'ATX', slots: 4, },
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
        <Text style={styles.cell}>{spec.socket}</Text>
        <Text style={styles.cell}>{spec.form_factor}</Text>
        <Text style={styles.cell}>{spec.slots}</Text>
        <Text style={styles.cell}>{formatPrice(item.price)}</Text>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Socket</Text>
        <Text style={styles.cellHeader}>Form</Text>
        <Text style={styles.cellHeader}>Slots</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}