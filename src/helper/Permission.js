import {Platform} from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export const checkCameraPremission = () => {
  return new Promise((resolve, reject) => {
    let hasPermission = false;
    // This is for IOS Camera
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.CAMERA)
        .then(result => {
          switch (result) {
            case RESULTS.DENIED:
              hasPermission = false;
              break;
            case RESULTS.BLOCKED:
              hasPermission = false;
              break;
            case RESULTS.GRANTED:
              hasPermission = true;
              break;
          }
          resolve(hasPermission);
        })
        .catch(() => {
          reject(false);
        });
    }

    // This is for Android Camera
    if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.CAMERA)
        .then(result => {
          switch (result) {
            case RESULTS.DENIED:
              hasPermission = false;
              break;
            case RESULTS.BLOCKED:
              hasPermission = false;
              break;
            case RESULTS.GRANTED:
              hasPermission = true;
              break;
          }
          resolve(hasPermission);
        })
        .catch(() => {
          reject(false);
        });
    }
  });
};

export const askCameraPremission = () => {
  return new Promise((resolve, reject) => {
    // This is for IOS Camera and Loaction
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.CAMERA)
        .then(statuses => {
          console.log('permissions===>', statuses);
          resolve(statuses);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      // This is for Android Camera and Loaction
      request(PERMISSIONS.ANDROID.CAMERA)
        .then(statuses => {
          console.log('permissions===>', statuses);
          resolve(statuses);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
};

export const checkMediaPremission = () => {
  return new Promise((resolve, reject) => {
    let hasPermission = false;
    // This is for IOS Camera
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.MEDIA_LIBRARY)
        .then(result => {
          switch (result) {
            case RESULTS.DENIED:
              hasPermission = false;
              break;
            case RESULTS.BLOCKED:
              hasPermission = false;
              break;
            case RESULTS.GRANTED:
              hasPermission = true;
              break;
          }
          resolve(hasPermission);
        })
        .catch(() => {
          reject(false);
        });
    }

    // This is for Android Camera
    if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION)
        .then(result => {
          switch (result) {
            case RESULTS.DENIED:
              hasPermission = false;
              break;
            case RESULTS.BLOCKED:
              hasPermission = false;
              break;
            case RESULTS.GRANTED:
              hasPermission = true;
              break;
          }
          resolve(hasPermission);
        })
        .catch(() => {
          reject(false);
        });
    }
  });
};

export const askMediaPremission = () => {
  return new Promise((resolve, reject) => {
    // This is for IOS Camera and Loaction
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.CAMERA)
        .then(statuses => {
          console.log('permissions===>', statuses);
          resolve(statuses);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      // This is for Android Camera and Loaction
      request(PERMISSIONS.ANDROID.CAMERA)
        .then(statuses => {
          console.log('permissions===>', statuses);
          resolve(statuses);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
};
