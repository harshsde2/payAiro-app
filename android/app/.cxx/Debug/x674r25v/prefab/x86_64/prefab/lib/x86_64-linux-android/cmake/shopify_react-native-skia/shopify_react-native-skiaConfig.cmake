if(NOT TARGET shopify_react-native-skia::rnskia)
add_library(shopify_react-native-skia::rnskia SHARED IMPORTED)
set_target_properties(shopify_react-native-skia::rnskia PROPERTIES
    IMPORTED_LOCATION "/Users/cbnits-19/Documents/payAiro/payAiro/node_modules/@shopify/react-native-skia/android/build/intermediates/cxx/Debug/4m1t4g5r/obj/x86_64/librnskia.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/cbnits-19/Documents/payAiro/payAiro/node_modules/@shopify/react-native-skia/android/build/headers/rnskia"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

