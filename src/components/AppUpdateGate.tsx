import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import useAppUpdate from '../hooks/useAppUpdate';
import {
  checkForUpdate,
  startAppUpdateListener,
  stopAppUpdateListener,
} from '../services/appUpdate';
import UpdateModal from './UpdateModal';

/**
 * Root-level force-update guard. Listens to Firebase /hanumanchalisaandbhakti and
 * re-checks whenever the app returns to the foreground (which also covers coming
 * back from the store). While the installed build is older than the required one,
 * the whole app is replaced by the update screen; otherwise children render as normal.
 * Reading chapters and shloks never needs the network, so offline users are never blocked.
 */
const AppUpdateGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, installedVersion, requiredVersion, message, storeUrl } = useAppUpdate();

  useEffect(() => {
    startAppUpdateListener();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') checkForUpdate();
    });
    return () => {
      sub.remove();
      stopAppUpdateListener();
    };
  }, []);

  if (status === 'required') {
    return (
      <UpdateModal
        installedVersion={installedVersion}
        requiredVersion={requiredVersion}
        message={message}
        storeUrl={storeUrl}
      />
    );
  }

  return <>{children}</>;
};

export default AppUpdateGate;
