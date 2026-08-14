import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Deal, DealId, Handoff, Person, PersonId, Stage, TaskId } from "../types";
import {
  addMention,
  clearHandoff,
  completeTask,
  moveStage,
  setHandoff,
} from "../domain/engine";
import { TEAM, canMutateFiles, personById } from "../domain/team";
import { defaultState, loadState, saveState } from "../lib/storage";

type Store = {
  deals: Deal[];
  currentPerson: Person;
  canWrite: boolean;
  setCurrentPersonId: (id: PersonId) => void;
  completeDealTask: (dealId: DealId, taskId: TaskId) => void;
  changeStage: (dealId: DealId, stage: Stage) => void;
  handoff: (dealId: DealId, waitingOn: Handoff) => void;
  finishHandoff: (dealId: DealId) => void;
  mention: (dealId: DealId, body: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

function updateDeal(deals: Deal[], dealId: DealId, updater: (deal: Deal) => Deal): Deal[] {
  return deals.map((deal) => (deal.id === dealId ? updater(deal) : deal));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => loadState());

  const persist = (next: typeof state) => {
    saveState(next);
    setState(next);
  };

  const currentPerson = personById(state.currentPersonId) ?? TEAM[0];
  if (!currentPerson) {
    throw new Error("Fileflow team roster is empty");
  }

  const value = useMemo<Store>(() => {
    const canWrite = canMutateFiles(currentPerson.role);
    return {
      deals: state.deals,
      currentPerson,
      canWrite,
      setCurrentPersonId: (id) => persist({ ...state, currentPersonId: id }),
      completeDealTask: (dealId, taskId) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) => completeTask(deal, taskId)),
        });
      },
      changeStage: (dealId, stage) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) => moveStage(deal, stage)),
        });
      },
      handoff: (dealId, waitingOn) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) => setHandoff(deal, waitingOn)),
        });
      },
      finishHandoff: (dealId) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) => clearHandoff(deal)),
        });
      },
      mention: (dealId, body) => {
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) =>
            addMention(deal, {
              authorId: currentPerson.id,
              body,
              createdAt: new Date().toISOString(),
            }),
          ),
        });
      },
      resetDemo: () => persist(defaultState()),
    };
  }, [state, currentPerson]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return store;
}
