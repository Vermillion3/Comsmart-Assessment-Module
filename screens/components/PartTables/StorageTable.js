import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import HoverableOpacity from '../HoverableOpacity'
import styles from './TableStyles';

export default function StorageTable({ options, onSelect, formatPrice, formatPriceDecimals }) {
  const specs = {
    'SAMSUNG 870 EVO': { capacity: '1 TB', type: 'SSD', unit:'TB', cache: '1024 MB', form_factor: '2.5"', },
    'Crucial P3 Plus': { capacity: '500 GB', type: 'SSD', unit:'GB', form_factor: 'M.2', },
    'Seagate BarraCuda': { capacity: '4 TB', type: 'HDD', unit:'TB', form_factor: '3.5"', },
  };

  const renderItem = ({ item }) => {
    const spec = specs[item.value] || {};
    const size = parseFloat(spec.capacity);
    const unit = spec.unit || 'GB'; // Default to GB if missing
    const sizeInGB = unit === 'TB' ? size * 1024 : size;

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
          <Text style={styles.cell}>{spec.capacity || '—'}</Text>
          <Text style={styles.cell}>{pricePerGB ? formatPriceDecimals(pricePerGB) : '—'}</Text>
          <Text style={styles.cell}>{spec.type || '—'}</Text>
          <Text style={styles.cell}>{spec.cache || '—'}</Text>
          <Text style={styles.cell}>{spec.form_factor || '—'}</Text>
          <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
        </>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Capacity</Text>
        <Text style={styles.cellHeader}>Price / GB</Text>
        <Text style={styles.cellHeader}>Type</Text>
        <Text style={styles.cellHeader}>Cache</Text>
        <Text style={styles.cellHeader}>Form Factor</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList data={options} keyExtractor={item => item.value} renderItem={renderItem} />
    </>
  );
}
