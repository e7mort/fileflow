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
  Invoice,
  PartnerPulse,
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
import { DEMO_TODAY } from "../domain/maturity";
import { pulseForStageMove } from "../domain/partners";
import { addParty, type AddPartyResult } from "../domain/parties";
import { TEAM, canCompleteTask, canEditDocList, canMutateFiles, personById, stageAdvanceBlock } from "../domain/team";
import { logFirstTouch, touchDeal } from "../domain/touch";

import { defaultState, loadState, saveState } from "../lib/storage";

function demoNow(): string {
  return DEMO_TODAY.toISOString();
}

type Store = {
  deals: Deal[];
  invoices: Invoice[];
  pulses: PartnerPulse[];
  currentPerson: Person;
  canWrite: boolean;
  canEditDocs: boolean;
  canCompleteDealTask: (dealId: DealId, taskId: TaskId) => boolean;
  stageBlocked: (dealId: DealId, stage: Stage) => string | null;
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
  markFirstTouch: (dealId: DealId) => void;
  receiveSharedCondition: (dealId: DealId, conditionId: ConditionId) => void;
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
    const canEditDocs = canEditDocList(currentPerson.role);
    return {
      deals: state.deals,
      invoices: state.invoices,
      pulses: state.pulses,
      currentPerson,
      canWrite,
      canEditDocs,
      canCompleteDealTask: (dealId, taskId) => {
        const deal = state.deals.find((item) => item.id === dealId);
        const task = deal?.tasks.find((item) => item.id === taskId);
        if (!task) {
          return false;
        }
        return canCompleteTask(currentPerson.role, task);
      },
      stageBlocked: (dealId, stage) => {
        const deal = state.deals.find((item) => item.id === dealId);
        if (!deal) {
          return "File not found";
        }
        return stageAdvanceBlock(deal, stage, currentPerson.role);
      },
      setCurrentPersonId: (id) => persist({ ...state, currentPersonId: id }),
      completeDealTask: (dealId, taskId) => {
        const current = state.deals.find((deal) => deal.id === dealId);
        const task = current?.tasks.find((item) => item.id === taskId);
        if (!current || !task || !canCompleteTask(currentPerson.role, task)) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) =>
            touchDeal(completeTask(deal, taskId), demoNow()),
          ),
        });
      },
      changeStage: (dealId, stage) => {
        if (!canWrite) {
          return;
        }
        const current = state.deals.find((deal) => deal.id === dealId);
        if (!current || stageAdvanceBlock(current, stage, currentPerson.role)) {
          return;
        }
        const moved = touchDeal(moveStage(current, stage), demoNow());
        const pulse = pulseForStageMove(moved, current.stage, stage, demoNow());
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, () => moved),
          pulses: pulse ? [pulse, ...state.pulses] : state.pulses,
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
        if (!canEditDocs) {
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
      markFirstTouch: (dealId) => {
        if (!canWrite) {
          return;
        }
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) =>
            logFirstTouch(deal, demoNow()),
          ),
        });
      },
      receiveSharedCondition: (dealId, conditionId) => {
        persist({
          ...state,
          deals: updateDeal(state.deals, dealId, (deal) =>
            completeCondition(deal, conditionId),
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
