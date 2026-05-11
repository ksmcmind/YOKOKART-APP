import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = (props) => {
  return (
    <TextInput style={styles.input} {...props} />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
});

export default Input;
