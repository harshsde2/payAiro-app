import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ViewToken,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useTheme } from "styles";
import Video from "react-native-video"; // make sure this is installed

const { width } = Dimensions.get("window");

// Type for image prop (can be a number for require(...) or { uri: string } for remote)
type ImageSource = string;

interface ImageCarouselProps {
  images: ImageSource[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const mainRef = useRef<FlatList<ImageSource> | null>(null);
  const thumbRef = useRef<FlatList<ImageSource> | null>(null);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const index = viewableItems[0].index!;
        setSelectedIndex(index);
        thumbRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  ).current;

  const shadowBox = {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  };

  const isVideo = (uri: string) =>
    uri.endsWith(".mp4") || uri.endsWith(".mov") || uri.endsWith(".webm");

  return (
    <View>
      {/* Main Carousel */}
      <View style={[shadowBox]}>
        <FlatList
          data={images}
          ref={mainRef}
          style={[{ borderRadius: theme.spacing.spacing[3] }]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          keyExtractor={(_, index) => `main-${index}`}
          renderItem={({ item }) => (
            <View style={{ width: width - 60 }}>
              {isVideo(item) ? (
                <Video
                  source={{
                    uri: item,
                  }}
                  style={styles.mainImage}
                  controls
                  resizeMode="contain"
                  paused={selectedIndex !== images.indexOf(item)} // optional: only play selected
                  // onError={(e) => console.log("Video error", e)}
                  onError={(e) =>
                    console.log("Video Error:", JSON.stringify(e, null, 2))
                  }
                  onLoadStart={() => console.log("Video loading started")}
                  onLoad={() => console.log("Video loaded")}
                  onBuffer={({ isBuffering }) =>
                    console.log("Buffering:", isBuffering)
                  }
                />
              ) : (
                <Image source={{ uri: item }} style={styles.mainImage} />
              )}
            </View>
          )}
        />
      </View>

      {/* Thumbnail Carousel */}
      <FlatList
        data={images as any}
        ref={thumbRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `thumb-${index}`}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedIndex(index);
              mainRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            {isVideo(item) ? (
              <Video
                source={{
                  uri: item,
                }}
                style={[
                  styles.thumbnailImage,
                  {
                    borderColor:
                      index === selectedIndex
                        ? theme.colors.palette.green300
                        : "transparent",
                  },
                ]}
                paused
              />
            ) : (
              // <Image source={{ uri: item }} style={styles.mainImage} />
              <Image
                source={{ uri: item } as any}
                style={[
                  styles.thumbnailImage,
                  {
                    borderColor:
                      index === selectedIndex
                        ? theme.colors.palette.green300
                        : "transparent",
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainImage: {
    width: width - 32,
    height: 250,
    resizeMode: "contain",
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    resizeMode: "contain",
  },
});

export default ImageCarousel;
