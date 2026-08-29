import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, type ViewStyle } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { bottomSheetStyles } from '@new-ui/styles/components/bottomSheetStyles';
import type {
  IBottomSheetConfig,
  IBottomSheetContextValue,
} from '../BottomSheet/types';

type SnapPoint = NonNullable<IBottomSheetConfig['snapPoints']>[number];

type GorhomBottomSheetProviderProps = {
  children: ReactNode;
};

const defaultConfig: Required<
  Pick<
    IBottomSheetConfig,
    | 'snapPoints'
    | 'initialSnapIndex'
    | 'enableDrag'
    | 'enableBackdropPress'
    | 'backdropOpacity'
  >
> &
  Omit<IBottomSheetConfig, 'snapPoints' | 'initialSnapIndex' | 'enableDrag' | 'enableBackdropPress' | 'backdropOpacity'> = {
  snapPoints: ['50%'],
  initialSnapIndex: 0,
  enableDrag: true,
  enableBackdropPress: true,
  backdropOpacity: 0.5,
};

const GorhomBottomSheetContext = createContext<IBottomSheetContextValue | undefined>(undefined);

export const GorhomBottomSheetProvider: React.FC<GorhomBottomSheetProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const styles = bottomSheetStyles(theme);

  const bottomSheetModalRef = useRef<any>(null);

  const [content, setContent] = useState<ReactNode>(null);
  const [config, setConfig] = useState<IBottomSheetConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [openSeq, setOpenSeq] = useState(0);

  const configRef = useRef<IBottomSheetConfig>(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const pendingOnOpenRef = useRef<(() => void) | null>(null);
  const pendingOnOpenIndexRef = useRef<number>(0);
  const shouldPresentRef = useRef(false);

  const snapPoints = useMemo<(string | number)[]>(() => {
    const points =
      config.snapPoints && config.snapPoints.length > 0
        ? config.snapPoints
        : defaultConfig.snapPoints;

    return points as (string | number)[];
  }, [config.snapPoints]);

  const index = useMemo(() => {
    const i = config.initialSnapIndex ?? 0;
    if (snapPoints.length === 0) return 0;
    return Math.min(Math.max(i, 0), snapPoints.length - 1);
  }, [config.initialSnapIndex, snapPoints.length]);

  const expand = useCallback(() => {
    bottomSheetModalRef.current?.snapToIndex(Math.max(0, snapPoints.length - 1));
  }, [snapPoints.length]);

  const collapse = useCallback(() => {
    bottomSheetModalRef.current?.snapToIndex(0);
  }, []);

  const snapToIndex = useCallback((snapIndex: number) => {
    bottomSheetModalRef.current?.snapToIndex(snapIndex);
  }, []);

  const close = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const open = useCallback((sheetContent: ReactNode, sheetConfig?: IBottomSheetConfig) => {
    const merged: IBottomSheetConfig = {
      ...defaultConfig,
      ...sheetConfig,
      snapPoints: sheetConfig?.snapPoints ?? defaultConfig.snapPoints,
      initialSnapIndex: sheetConfig?.initialSnapIndex ?? defaultConfig.initialSnapIndex,
      enableDrag: sheetConfig?.enableDrag ?? defaultConfig.enableDrag,
      enableBackdropPress: sheetConfig?.enableBackdropPress ?? defaultConfig.enableBackdropPress,
      backdropOpacity: sheetConfig?.backdropOpacity ?? defaultConfig.backdropOpacity,
    };

    pendingOnOpenRef.current = merged.onOpen ?? null;
    pendingOnOpenIndexRef.current = merged.initialSnapIndex ?? 0;

    setConfig(merged);
    setContent(sheetContent);
    setIsOpen(true);
    shouldPresentRef.current = true;
    setOpenSeq((s) => s + 1);
  }, []);

  useEffect(() => {
    if (!shouldPresentRef.current) return;
    shouldPresentRef.current = false;
    bottomSheetModalRef.current?.present();
  }, [openSeq]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    setContent(null);

    const onClose = configRef.current.onClose;
    setConfig(defaultConfig);

    onClose?.();
  }, []);

  const handleSheetChange = useCallback((nextIndex: number) => {
    const currentConfig = configRef.current;
    currentConfig.onChange?.(nextIndex);

    if (
      pendingOnOpenRef.current &&
      nextIndex === pendingOnOpenIndexRef.current
    ) {
      pendingOnOpenRef.current();
      pendingOnOpenRef.current = null;
    }
  }, []);

  const enableDrag = config.enableDrag !== false;
  const enableBackdropPress = config.enableBackdropPress !== false;

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={config.backdropOpacity ?? defaultConfig.backdropOpacity}
        pressBehavior={enableBackdropPress ? 'close' : 'none'}
      />
    ),
    [config.backdropOpacity, enableBackdropPress]
  );

  const backgroundStyle = useMemo<ViewStyle>(() => {
    // bottomSheetStyles(theme).container is for the custom sheet; gorhom needs a "backgroundStyle".
    return {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 16,
    };
  }, [theme]);

  const handleIndicatorStyle = useMemo<ViewStyle>(() => {
    // Pull the colors from the existing bottom sheet look.
    const base = styles.handleIndicator as ViewStyle;
    return {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: (base as ViewStyle).backgroundColor,
    };
  }, [styles.handleIndicator]);

  const contextValue: IBottomSheetContextValue = useMemo(
    () => ({
      open,
      close,
      snapToIndex,
      expand,
      collapse,
      isOpen,
    }),
    [collapse, close, expand, isOpen, open, snapToIndex]
  );

  return (
    <GorhomBottomSheetContext.Provider value={contextValue}>
      {children}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={index}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={enableDrag}
        enableHandlePanningGesture={enableDrag}
        enableContentPanningGesture={enableDrag}
        style={config.containerStyle}
        handleIndicatorStyle={[handleIndicatorStyle, config.handleIndicatorStyle] as any}
        backgroundStyle={backgroundStyle}
      >
        <View style={config.contentContainerStyle}>
          {content}
        </View>
      </BottomSheetModal>
    </GorhomBottomSheetContext.Provider>
  );
};

export const useGorhomBottomSheet = (): IBottomSheetContextValue => {
  const context = useContext(GorhomBottomSheetContext);
  if (!context) {
    throw new Error('useGorhomBottomSheet must be used within a GorhomBottomSheetProvider');
  }
  return context;
};

