import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.buttonBase,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
      ]}
    >
      <View
        style={[ styles.iconContainer, isPrimary ? styles.iconContainerPrimary : styles.iconContainerSecondary,]}
      >
        {icon ? (
          icon
        ) : (
          <Feather
            name="arrow-up-right" size={20} color={isPrimary ? '#18181B' : '#FFFFFF'}
          />
        )}
      </View>

      <Text
        style={[ styles.textBase, isPrimary ? styles.textPrimary : styles.textSecondary,]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 20,
    borderRadius: 18,
    marginVertical: 10,
  },
  buttonPrimary: {
    backgroundColor: '#18181B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F4F4F5',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerPrimary: {
    backgroundColor: '#FFFFFF',
  },
  iconContainerSecondary: {
    backgroundColor: '#18181B',
  },
  textBase: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#18181B',
  },
});