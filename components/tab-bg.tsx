import React from "react";
import Svg, { Path } from "react-native-svg";
import { Dimensions } from "react-native";

export function TabBg({ color }: { color: string }) {
  const { width } = Dimensions.get("window");

  // Curva ajustada: menos profunda e com transição mais suave
  const d = `
    M 0 0 
    L ${width / 2 - 50} 0 
    C ${width / 2 - 35} 0, ${width / 2 - 35} 32, ${width / 2} 32 
    C ${width / 2 + 35} 32, ${width / 2 + 35} 0, ${width / 2 + 50} 0 
    L ${width} 0 
    L ${width} 85 
    L 0 85 
    Z
  `;

  return (
    <Svg
      width={width}
      height={85}
      style={{ position: "absolute", bottom: 0 }}
      viewBox={`0 0 ${width} 85`}
    >
      <Path d={d} fill={color} />
    </Svg>
  );
}
