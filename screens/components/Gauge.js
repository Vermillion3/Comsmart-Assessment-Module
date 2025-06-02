import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

const Gauge = ({ size = 200, strokeWidth = 10, value = 50, limit = 80, max = 100, isPrice = false, invertColor = false }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const overshootFactor = 1.05; // 10% over
  const clampedAngle = Math.min(Math.max(value, 0), max);
  const angle = (clampedAngle / max) * Math.PI * overshootFactor; // radians from 0 (left) to π (right)

  // Needle dimensions
  const needleLength = radius - 8;
  const needleWidth = 6;

  // Needle tip
  const tipX = center + needleLength * Math.cos(angle);
  const tipY = center + needleLength * Math.sin(angle);

  // Needle base (perpendicular offset from center)
  const perpAngle = angle + Math.PI / 2;
  const baseLeftX = center + needleWidth * Math.cos(perpAngle);
  const baseLeftY = center + needleWidth * Math.sin(perpAngle);
  const baseRightX = center - needleWidth * Math.cos(perpAngle);
  const baseRightY = center - needleWidth * Math.sin(perpAngle);

  // Rounded base radius (half the width)
  const baseRadius = needleWidth;

  // Arc sweep flag 0 = arc drawn the "short way" (less than 180deg)
  const d = `
    M ${tipX} ${tipY}
    L ${baseLeftX} ${baseLeftY}
    A ${baseRadius} ${baseRadius} 0 0 1 ${baseRightX} ${baseRightY}
    Z
  `;

  const circumference = Math.PI * radius;
  
  const formatValue = (num) => {
    const rounded = Math.round(num);
    const formattedNumber = rounded.toLocaleString(); // Adds commas
    return isPrice ? `₱${formattedNumber}` : formattedNumber;
  };

  const overLimit = value > limit;

  const firstColor = invertColor ? '#68B24E' : '#FF6961'; // green or red
  const secondColor = invertColor ? '#FF6961' : '#68B24E'; // red or green
  const valueContainerColor = overLimit ? firstColor : secondColor; // handles the value container


  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 2}>
        <G rotation="180" origin={`${center},${center}`}>
          {/* Background semicircle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={firstColor}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Foreground semicircle (progress) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={secondColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeDashoffset={(1 - limit / max) * circumference}
            strokeLinecap="round"
          />

          {/* Tapered needle */}
          <Path
            d={d}
            fill="#222222"
            stroke="#222222"
            strokeWidth={1}
            strokeLinejoin="round"
            transform="translate(0, 10)"
          />
        </G>
      </Svg>
      <View style={[styles.valueContainer, {backgroundColor: valueContainerColor}]}>
        <Text style={styles.valueText}>{formatValue(value)} / {formatValue(limit)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  valueContainer: {
    alignItems: 'center',
    padding: 5,
    margin: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 500,
    paddingLeft: 10,
    paddingRight: 10,
    color: '#333',
  },
});

export default Gauge;
