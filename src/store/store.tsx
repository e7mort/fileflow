import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ConditionId,
  Deal,
  DealId,
  Handoff,
  PartyRole,
  Person,
  PersonId,
  Stage,
  TaskId,
} from "../types";
import { addCondition, completeCondition } from "../domain/conditions";
import {
  addMention,
  clearHandoff,
  completeTask,
  moveStage,
  setHandoff,
} from "../domain/engine";
import { addParty, type AddPartyResult } from "../domain/parties";
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
  addDealCondition: (dealId: DealId, title: string) => void;
  completeDealCondition: (dealId: DealId, conditionId: ConditionId) => void;
  addDealParty: (
    dealId: DealId,
    input: { name: string; email: string; phone: string; role: PartyRole },
  ) => AddPartyResult | { ok: false; error: "not-found" };
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
      addDealCondition: (dealId, title) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) => {
            const result = addCondition(deal, title);
            return result.ok ? result.deal : deal;
          }),
        });
      },
      completeDealCondition: (dealId, conditionId) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) =>
            completeCondition(deal, conditionId),
          ),
        });
      },
      addDealParty: (dealId, input) => {
        const current = state.deals.find((deal) => deal.id === dealId);
        if (!current) {
          return { ok: false, error: "not-found" };
        }
        if (!canWrite) {
          return addParty(current, input);
        }
        const result = addParty(current, input);
        if (result.ok) {
          persist({
            ...state,
            deals: updateDeal(state.deals, dealId, () => result.deal),
          });
        }
        return result;
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
