if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/cbnits-19/.gradle/caches/8.10.2/transforms/1383fcf8557c5ed321a45a1c3467a80f/transformed/hermes-android-0.76.3-release/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/cbnits-19/.gradle/caches/8.10.2/transforms/1383fcf8557c5ed321a45a1c3467a80f/transformed/hermes-android-0.76.3-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

