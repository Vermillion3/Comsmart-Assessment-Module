import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function FanTable({ options, onSelect, formatPrice }) {
  const specs = {
    'Wraith Stealth (Stock)': { rpm: '650 - 1900 RPM', noise: '12 - 42 dB', },
    'Cooler Master Hyper 212 Black Edition': { rpm: '650 - 2000 RPM', noise: '6.5 - 26 dB', },
    'ARCTIC Liquid Freezer III 360': { rpm: '200 - 2000 RPM', argb: 'A-RGB', },
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
          <Text style={styles.cell}>{spec.rpm || '—'}</Text>
          <Text style={styles.cell}>{spec.noise || '—'}</Text>
          <Text style={styles.cell}>{spec.argb || '—'} </Text>
          <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Fan RPM</Text>
        <Text style={styles.cellHeader}>Noise Level</Text>
        <Text style={styles.cellHeader}>A-RGB</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
