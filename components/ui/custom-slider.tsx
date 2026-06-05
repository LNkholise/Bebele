import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface CustomRangeSliderProps {
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  trackColor?: string;
  thumbColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  containerWidth?: number;
  thumbWidth?: number;
}

const CustomRangeSlider: React.FC<CustomRangeSliderProps> = ({
  minValue = 0,
  maxValue = 100,
  initialValue = 50,
  step = 1,
  onValueChange,
  trackColor = '#F2F2F2',
  thumbColor = '#FFFFFF',
  activeTextColor = '#000000',
  inactiveTextColor = '#AAAAAA',
  containerWidth = 320,
  thumbWidth = 110,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);

  const PADDING = 5;
  const usableWidth = containerWidth - thumbWidth - PADDING * 2;

  const initialRatio = Math.max(
    0,
    Math.min(1, (initialValue - minValue) / (maxValue - minValue))
  );
  const initialX = initialRatio * usableWidth;

  const thumbTranslateX = useRef(new Animated.Value(initialX)).current;
  const lastX = useRef(initialX);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          thumbTranslateX.setOffset(lastX.current);
          thumbTranslateX.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          const maxDrag = usableWidth - lastX.current;
          const minDrag = -lastX.current;
          const newDx = Math.max(minDrag, Math.min(gestureState.dx, maxDrag));

          thumbTranslateX.setValue(newDx);

          const currentAbsoluteX = lastX.current + newDx;
          let value = minValue + (currentAbsoluteX / usableWidth) * (maxValue - minValue);
          value = Math.max(
            minValue,
            Math.min(maxValue, Math.round(value / step) * step)
          );

          setCurrentValue(value);
          onValueChange?.(value);
        },
        onPanResponderRelease: (_, gestureState) => {
          const maxDrag = usableWidth - lastX.current;
          const minDrag = -lastX.current;
          const newDx = Math.max(minDrag, Math.min(gestureState.dx, maxDrag));

          lastX.current += newDx;
          thumbTranslateX.flattenOffset();
        },
      }),
    [usableWidth, minValue, maxValue, step, onValueChange]
  );

  return (
    <View
      style={[
        styles.sliderContainer,
        {
          backgroundColor: trackColor,
          width: containerWidth,
        },
      ]}
    >
      <View style={styles.maxValueContainer}>
        <Text style={[styles.inactiveText, { color: inactiveTextColor }]}>
          {maxValue}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.thumbContainer,
          {
            width: thumbWidth,
            backgroundColor: thumbColor,
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={[styles.activeText, { color: activeTextColor }]}>
          {currentValue}
        </Text>
        <View style={styles.gripIcon}>
          <View style={styles.gripLine} />
          <View style={styles.gripLine} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 12,
  },
  maxValueContainer: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  inactiveText: {
    fontSize: 18,
    fontWeight: '400',
  },
  thumbContainer: {
    height: 38,
    position: 'absolute',
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderRadius: 12,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  activeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gripIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gripLine: {
    width: 2,
    height: 14,
    backgroundColor: '#BBBBBB',
    marginLeft: 2,
    borderRadius: 1,
  },
});

export default CustomRangeSlider;