import { StyleProp, ViewProps, ViewStyle } from "react-native";

export interface IconTextComponentProps extends ViewProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    label?:string;
    iconContainerStyle?:StyleProp<ViewStyle>;
    labelStyle?:StyleProp<ViewStyle>;
}

export interface FiatGraphSectionProps {
    selectedGraph: string;
    setselectedGraph: (value: string) => void;
    alloCationLists: any[]; // Replace `any` with your actual allocation item type if known
    memoizedAllocationLists: any[]; // Same here
  }
  