import React from 'react';
import LottieView from 'lottie-react-native';
import type { LottieViewProps } from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

export default function LottiePlayer({ source, style }: { source: LottieViewProps['source']; style?: StyleProp<ViewStyle> }) {
  return <LottieView source={source} autoPlay loop style={style} />;
}
