"use client";

import { useEffect } from "react";

export const dataRefreshEvent = "ci-data-updated";

export function notifyDataChanged() {
  localStorage.setItem(dataRefreshEvent, String(Date.now()));
  window.dispatchEvent(new Event(dataRefreshEvent));
}

export function useDataRefresh(callback: () => void) {
  useEffect(() => {
    function handleRefresh() {
      callback();
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === dataRefreshEvent) callback();
    }

    window.addEventListener(dataRefreshEvent, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("pageshow", handleRefresh);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(dataRefreshEvent, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("pageshow", handleRefresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, [callback]);
}
