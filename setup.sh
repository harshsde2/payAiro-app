set -e

printf "NPM installing\n"
npm install --legacy-peer-deps

printf "Copying PDF assets to Android\n"
mkdir -p android/app/src/main/assets/pdf
cp src/assets/pdf/*.pdf android/app/src/main/assets/pdf/

cd ios
printf "Pod installation\n"
#### Pod install
pod install
printf "Completed! (:\n"
