import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  checkForUpdate,
  isBannerShownInSession,
  markBannerShownInSession,
  shouldShowCriticalModal,
  markCriticalModalShownInSession,
  incrementCriticalModalCount,
  UpdateInfo,
} from '../utils/versionCheck';

interface UpdateContextValue {
  softUpdate: UpdateInfo | null;
  criticalUpdate: UpdateInfo | null;
  dismissBanner: () => void;
  dismissModal: () => void;
}

const UpdateContext = createContext<UpdateContextValue>({
  softUpdate: null,
  criticalUpdate: null,
  dismissBanner: () => {},
  dismissModal: () => {},
});

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [softUpdate, setSoftUpdate] = useState<UpdateInfo | null>(null);
  const [criticalUpdate, setCriticalUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const info = await checkForUpdate();
      if (!info || !mounted) return;

      if (info.type === 'critical') {
        const show = await shouldShowCriticalModal();
        if (show && mounted) {
          markCriticalModalShownInSession();
          await incrementCriticalModalCount();
          setCriticalUpdate(info);
        }
      } else if (info.type === 'soft') {
        if (!isBannerShownInSession() && mounted) {
          markBannerShownInSession();
          setSoftUpdate(info);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const dismissBanner = () => setSoftUpdate(null);
  const dismissModal = () => setCriticalUpdate(null);

  return (
    <UpdateContext.Provider value={{ softUpdate, criticalUpdate, dismissBanner, dismissModal }}>
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdateContext(): UpdateContextValue {
  return useContext(UpdateContext);
}
