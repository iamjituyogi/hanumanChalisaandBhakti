import { useSyncExternalStore } from 'react';
import { getAppUpdateState, subscribeAppUpdateState } from '../services/appUpdate';

/** Current force-update state (status, versions, store link). */
const useAppUpdate = () => useSyncExternalStore(subscribeAppUpdateState, getAppUpdateState);

export default useAppUpdate;
