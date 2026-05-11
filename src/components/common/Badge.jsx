import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = () => {
  return (
    <View style={styles.container}>
      <Text>BadgeComponent</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
});

export default Badge;
