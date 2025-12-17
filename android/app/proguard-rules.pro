# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep BuildConfig for react-native-config
# Prevents ProGuard from renaming or removing BuildConfig class
-keep class com.payairo.BuildConfig { *; }

# Keep react-native-config resources
-keepresources string/build_config_package
