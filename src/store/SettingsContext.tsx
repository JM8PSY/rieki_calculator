import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_MATERIALS } from '../domain/materials';
import { DEFAULT_PLATFORMS } from '../domain/platforms';
import type { Options, PackagingMaterial, Platform } from '../domain/types';

const STORAGE_KEY = 'rieki-calculator/settings/v2';

export const DEFAULT_OPTIONS: Options = {
  shippingMode: 'auto',
  manualShipping: 0,
  includePayoutFee: false,
  priceStep: 10,
};

type Stored = { platforms: Platform[]; options: Options; materials: PackagingMaterial[] };

type SettingsValue = Stored & {
  ready: boolean;
  updatePlatform: (id: string, patch: Partial<Platform>) => void;
  updateShippingFare: (platformId: string, methodId: string, fare: number) => void;
  updateMaterial: (id: string, patch: Partial<PackagingMaterial>) => void;
  addMaterial: (material: PackagingMaterial) => void;
  removeMaterial: (id: string) => void;
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

function mergeMaterials(saved: PackagingMaterial[] | undefined): PackagingMaterial[] {
  if (!saved?.length) return DEFAULT_MATERIALS;
  const savedById = new Map(saved.map((m) => [m.id, m]));
  const merged = DEFAULT_MATERIALS.map((def) => {
    const s = savedById.get(def.id);
    savedById.delete(def.id);
    // 価格・名前・表示ON/OFFはユーザーの編集を優先し、サイズ制限などはデフォルト側の更新を取り込む
    return s ? { ...def, price: s.price, name: s.name ?? def.name, hidden: s.hidden } : def;
  });
  return [...merged, ...savedById.values()];
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [options, setOptionsState] = useState<Options>(DEFAULT_OPTIONS);
  const [materials, setMaterials] = useState<PackagingMaterial[]>(DEFAULT_MATERIALS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setPlatforms(mergePlatforms(parsed.platforms));
          setMaterials(mergeMaterials(parsed.materials));
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ platforms, options, materials })).catch(
      () => {},
    );
  }, [platforms, options, materials, ready]);

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

  const updateMaterial = useCallback((id: string, patch: Partial<PackagingMaterial>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const addMaterial = useCallback((material: PackagingMaterial) => {
    setMaterials((prev) => [...prev, material]);
  }, []);

  const removeMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const setOptions = useCallback((patch: Partial<Options>) => {
    setOptionsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setPlatforms(DEFAULT_PLATFORMS);
    setMaterials(DEFAULT_MATERIALS);
    setOptionsState(DEFAULT_OPTIONS);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      platforms,
      options,
      materials,
      ready,
      updatePlatform,
      updateShippingFare,
      updateMaterial,
      addMaterial,
      removeMaterial,
      setOptions,
      resetAll,
    }),
    [
      platforms,
      options,
      materials,
      ready,
      updatePlatform,
      updateShippingFare,
      updateMaterial,
      addMaterial,
      removeMaterial,
      setOptions,
      resetAll,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
