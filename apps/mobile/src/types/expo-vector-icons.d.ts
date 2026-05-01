declare module "@expo/vector-icons" {
  import type { ComponentProps } from "react";
  import type { TextStyle } from "react-native";

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  }

  export class Ionicons extends React.Component<IconProps> {}
  export class MaterialIcons extends React.Component<IconProps> {}
  export class FontAwesome extends React.Component<IconProps> {}
  export class AntDesign extends React.Component<IconProps> {}
  export class Feather extends React.Component<IconProps> {}
  export class MaterialCommunityIcons extends React.Component<IconProps> {}
}
