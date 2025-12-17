import { useContext } from 'react';
import { AppLockContext } from '../contexts/AppLockContext';
import { AppLockContextType } from '../types/appLock.types';

export const useAppLock = (): AppLockContextType => {
  const context = useContext(AppLockContext);
  
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  
  return context;
};
