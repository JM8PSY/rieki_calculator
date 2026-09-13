import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PLATFORMS } from '../domain/platforms';
import type { Options, Platform } from '../domain/types';

const STORAGE_KEY = 'rieki-calculator/settings/v1';

export const DEFAULT_OPTIONS: Options = {
  shippingMode: 'auto',
  manualShipping: 0,
  includePayoutFee: false,
  priceStep: 10,
};

type Stored = { platforms: Platform[]; options: Options };

type SettingsValue = Stored & {
  ready: boolean;
  updatePlatform: (id: string, patch: Partial<Platform>) => void;
  updateShippingFare: (platformId: string, methodId: string, fare: number) => void;
  setOptions: (patch: Partial<Options>) => void;
  resetAll: () => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

/** 保存済みデータにデフォルト側の新項目をマージする（アプリ更新で項目が増えても壊れないように） */
function mergePlatforms(saved: Platform[] | undefined): Platform[] {
  if (!saved?.length) return DEFAULT_PLATFORMS;
  const savedById = new Map(saved.map((p) => [p.id, p]));
  const merged = DEFAULT_PLATFORMS.map((def) => {
    const s = savedById.get(def.id);
    savedById.delete(def.id);
    return s ? { ...def, ...s, shipping: { ...def.shipping, ...s.shipping } } : def;
  });
  // ユーザーが独自に追加したものは末尾に残す
  return [...merged, ...savedById.values()];
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [options, setOptionsState] = useState<Options>(DEFAULT_OPTIONS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setPlatforms(mergePlatforms(parsed.platforms));
          setOptionsState({ ...DEFAULT_OPTIONS, ...parsed.options });
        }
      } catch {
        // 読み込めなければデフォルトのまま使う
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ platforms, options })).catch(() => {});
  }, [platforms, options, ready]);

  const updatePlatform = useCallback((id: string, patch: Partial<Platform>) => {
    setPlatforms((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const updateShippingFare = useCallback((platformId: string, methodId: string, fare: number) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, shipping: { ...p.shipping, [methodId]: fare } } : p,
      ),
    );
  }, []);

  const setOptions = useCallback((patch: Partial<Options>) => {
    setOptionsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setPlatforms(DEFAULT_PLATFORMS);
    setOptionsState(DEFAULT_OPTIONS);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({ platforms, options, ready, updatePlatform, updateShippingFare, setOptions, resetAll }),
    [platforms, options, ready, updatePlatform, updateShippingFare, setOptions, resetAll],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
