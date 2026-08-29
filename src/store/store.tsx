import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ConditionId,
  Consult,
  Conversation,
  ConversationId,
  Deal,
  DealId,
  Handoff,
  PartnerPulse,
  PartyRole,
  Person,
  PersonId,
  ResidentialPurpose,
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
import { TEAM, canMutateFiles, personById } from "../domain/team";
import { logFirstTouch, touchDeal } from "../domain/touch";
import { replyToLead, startConversation } from "../domain/acquire";
import { defaultState, loadState, saveState } from "../lib/storage";

function demoNow(): string {
  return DEMO_TODAY.toISOString();
}

type Store = {
  deals: Deal[];
  pulses: PartnerPulse[];
  conversations: Conversation[];
  consults: Consult[];
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
  markFirstTouch: (dealId: DealId) => void;
  receiveSharedCondition: (dealId: DealId, conditionId: ConditionId) => void;
  sendLeadReply: (conversationId: ConversationId, text: string) => ConversationId;
  startCapture: (input: {
    name: string;
    phone: string;
    purpose: ResidentialPurpose | null;
  }) => ConversationId;
  startInboundSms: () => ConversationId;
  markThreadRead: (conversationId: ConversationId) => void;
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
      pulses: state.pulses,
      conversations: state.conversations,
      consults: state.consults,
      currentPerson,
      canWrite,
      setCurrentPersonId: (id) => persist({ ...state, currentPersonId: id }),
      completeDealTask: (dealId, taskId) => {
        if (!canWrite) {
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
        if (!current) {
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
      sendLeadReply: (conversationId, text) => {
        const current = state.conversations.find((item) => item.id === conversationId);
        if (!current || !text.trim()) {
          return conversationId;
        }
        const turn = replyToLead(current, text.trim(), state.consults, new Date().toISOString());
        persist({
          ...state,
          conversations: state.conversations.map((item) =>
            item.id === conversationId ? turn.conversation : item,
          ),
          deals: turn.deal ? [turn.deal, ...state.deals] : state.deals,
          consults: turn.consult ? [turn.consult, ...state.consults] : state.consults,
        });
        return conversationId;
      },
      startCapture: (input) => {
        const id = `c-web-${Date.now()}`;
        const now = new Date().toISOString();
        const conversation = startConversation({
          id,
          channel: "web",
          name: input.name.trim() || "Web Lead",
          phone: input.phone.trim() || "000-555-0100",
          purpose: input.purpose,
          now,
        });
        persist({
          ...state,
          conversations: [conversation, ...state.conversations],
        });
        return id;
      },
      startInboundSms: () => {
        const id = `c-sms-${Date.now()}`;
        const now = new Date().toISOString();
        const conversation = startConversation({
          id,
          channel: "sms",
          name: "Dana Textin",
          phone: "250-555-0110",
          firstLeadLine: "Hi, just saw the site. Can someone look at my mortgage?",
          now,
        });
        persist({
          ...state,
          conversations: [conversation, ...state.conversations],
        });
        return id;
      },
      markThreadRead: (conversationId) => {
        persist({
          ...state,
          conversations: state.conversations.map((item) =>
            item.id === conversationId ? { ...item, unread: false } : item,
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
