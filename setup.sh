set -e

printf "NPM installing\n"
npm install --legacy-peer-deps

cd ios
printf "Pod installation\n"
#### Pod install
pod install
printf "Completed! (:\n"
