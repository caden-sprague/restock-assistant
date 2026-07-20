import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type RestockChange = {
  id: string;
  product: string;
  count: number;
  originalCommand: string;
};

type AddChangeInput = {
  product: string;
  count: number;
  originalCommand: string;
};

type RestockSessionContextValue = {
  changes: RestockChange[];
  addChange: (change: AddChangeInput) => void;
  updateChange: (
    id: string,
    updates: Partial<Pick<RestockChange, "product" | "count">>
  ) => void;
  removeChange: (id: string) => void;
  clearSession: () => void;
};

const RestockSessionContext =
  createContext<RestockSessionContextValue | null>(null);

type RestockSessionProviderProps = {
  children: ReactNode;
};

export function RestockSessionProvider({
  children,
}: RestockSessionProviderProps) {
  const [changes, setChanges] = useState<RestockChange[]>([]);

  function addChange(change: AddChangeInput) {
    const newChange: RestockChange = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      product: change.product,
      count: change.count,
      originalCommand: change.originalCommand,
    };

    setChanges((currentChanges) => [
      ...currentChanges,
      newChange,
    ]);
  }

  function updateChange(
    id: string,
    updates: Partial<Pick<RestockChange, "product" | "count">>
  ) {
    setChanges((currentChanges) =>
      currentChanges.map((change) =>
        change.id === id
          ? {
              ...change,
              ...updates,
            }
          : change
      )
    );
  }

  function removeChange(id: string) {
    setChanges((currentChanges) =>
      currentChanges.filter((change) => change.id !== id)
    );
  }

  function clearSession() {
    setChanges([]);
  }

  const value = useMemo(
    () => ({
      changes,
      addChange,
      updateChange,
      removeChange,
      clearSession,
    }),
    [changes]
  );

  return (
    <RestockSessionContext.Provider value={value}>
      {children}
    </RestockSessionContext.Provider>
  );
}

export function useRestockSession() {
  const context = useContext(RestockSessionContext);

  if (!context) {
    throw new Error(
      "useRestockSession must be used inside RestockSessionProvider"
    );
  }

  return context;
}