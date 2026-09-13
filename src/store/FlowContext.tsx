import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CostInput, Dimensions } from '../domain/types';

const STORAGE_KEY = 'rieki-calculator/flow/v1';

/** 'all' なら全販路を比較、それ以外はそのプラットフォームIDに絞る */
export type PlatformSelection = string;

export type FlowState = {
  costs: CostInput;
  dims: Dimensions;
  /** 売る販路。'all' で全社比較 */
  platformId: PlatformSelection;
  /** 目標利益から価格を出すか、価格から利益を出すか */
  mode: 'target' | 'price';
  target: number;
  price: number;
  /** プラットフォームID -> 発送方法ID（結果画面で手動指定した場合） */
  methodOverrides: Record<string, string>;
};

export const INITIAL_FLOW: FlowState = {
  costs: { purchase: 0, materials: {}, other: 0 },
  dims: { length: 25, width: 18, height: 2, weight: 200 },
  platformId: 'all',
  mode: 'target',
  target: 500,
  price: 2000,
  methodOverrides: {},
};

type FlowValue = FlowState & {
  ready: boolean;
  setCosts: (patch: Partial<CostInput>) => void;
  setDims: (patch: Partial<Dimensions>) => void;
  setFlow: (patch: Partial<FlowState>) => void;
  /** 次の商品を入力するために、金額まわりだけ初期化する（サイズや資材は流用） */
  startOver: () => void;
};

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FlowState>(INITIAL_FLOW);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<FlowState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            costs: { ...prev.costs, ...parsed.costs },
            dims: { ...prev.dims, ...parsed.dims },
          }));
        }
      } catch {
        // 読めなければ初期値のまま
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const setCosts = useCallback((patch: Partial<CostInput>) => {
    setState((prev) => ({ ...prev, costs: { ...prev.costs, ...patch } }));
  }, []);

  const setDims = useCallback((patch: Partial<Dimensions>) => {
    setState((prev) => ({ ...prev, dims: { ...prev.dims, ...patch } }));
  }, []);

  const setFlow = useCallback((patch: Partial<FlowState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const startOver = useCallback(() => {
    setState((prev) => ({
      ...prev,
      costs: { ...prev.costs, purchase: 0, other: 0 },
      methodOverrides: {},
    }));
  }, []);

  const value = useMemo<FlowValue>(
    () => ({ ...state, ready, setCosts, setDims, setFlow, startOver }),
    [state, ready, setCosts, setDims, setFlow, startOver],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow(): FlowValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used inside <FlowProvider>');
  return ctx;
}
