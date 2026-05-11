import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Toast = () => {
  return (
    <View style={styles.container}>
      <Text>Toast Message</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 8,
  },
});

export default Toast;
