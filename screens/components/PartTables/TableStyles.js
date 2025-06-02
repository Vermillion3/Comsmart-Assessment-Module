import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8 ,
  },
  rowHovered: {
    backgroundColor: '#e0e0e0',
  },
  cell: { 
    flex: 1, 
    textAlign: 'center' 
  },
  cellHeader: { 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginVertical: 4,
    alignItems: 'center',
  },
});
