import type {
  Book,
  Deal,
  Handoff,
  Mention,
  Person,
  PersonId,
  Stage,
  Task,
  TaskId,
} from "../types";
import { isTerminalStage, STAGE_DEFAULT_NEXT, stageIndex } from "./stages";
import { earliestUnlockIndex, templatesForBook } from "./templates";
import { firstName, TEAM } from "./team";

export function instantiateTasks(input: {
  book: Book;
  owners?: Partial<Record<string, PersonId | null>>;
}): Task[] {
  return templatesForBook(input.book).map((template) => ({
    id: `task-${input.book}-${template.id}`,
    templateId: template.id,
    title: template.title,
    unlockStages: template.unlockStages,
    ownerId: input.owners?.[template.id] ?? null,
    due: null,
    completed: false,
    completedAt: null,
  }));
}

export function isTaskUnlocked(task: Task, stage: Stage): boolean {
  if (isTerminalStage(stage)) {
    return false;
  }
  return stageIndex(stage) >= earliestUnlockIndex(task.unlockStages);
}

export function unlockedOpenTasks(deal: Deal): Task[] {
  return deal.tasks.filter(
    (task) => !task.completed && isTaskUnlocked(task, deal.stage),
  );
}

export function assignNextAction(deal: Deal): Deal {
  if (isTerminalStage(deal.stage)) {
    return {
      ...deal,
      nextAction: {
        taskId: null,
        title: STAGE_DEFAULT_NEXT[deal.stage],
        ownerId: null,
        due: null,
        waitingOn: null,
      },
    };
  }

  const unlocked = unlockedOpenTasks(deal);
  const currentStage = unlocked.filter((task) =>
    task.unlockStages.includes(deal.stage),
  );
  const nextTask = currentStage[0] ?? unlocked[0];
  if (!nextTask) {
    return {
      ...deal,
      nextAction: {
        taskId: null,
        title: STAGE_DEFAULT_NEXT[deal.stage],
        ownerId: null,
        due: null,
        waitingOn: null,
      },
    };
  }

  return {
    ...deal,
    nextAction: {
      taskId: nextTask.id,
      title: nextTask.title,
      ownerId: nextTask.ownerId,
      due: nextTask.due,
      waitingOn: null,
    },
  };
}

export function completeTask(deal: Deal, taskId: TaskId): Deal {
  const tasks = deal.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          completed: true,
          completedAt: new Date().toISOString(),
        }
      : task,
  );
  const updated = { ...deal, tasks };
  if (deal.nextAction.taskId !== taskId) {
    return updated;
  }
  return assignNextAction(updated);
}

function mergeTemplates(deal: Deal): Task[] {
  const existingIds = new Set(deal.tasks.map((task) => task.templateId));
  const additions = templatesForBook(deal.book)
    .filter((template) => !existingIds.has(template.id))
    .map((template) => ({
      id: `task-${deal.id}-${template.id}`,
      templateId: template.id,
      title: template.title,
      unlockStages: template.unlockStages,
      ownerId: null,
      due: null,
      completed: false,
      completedAt: null,
    }));
  return [...deal.tasks, ...additions];
}

export function moveStage(deal: Deal, stage: Stage): Deal {
  const tasks = mergeTemplates(deal);
  return assignNextAction({ ...deal, stage, tasks });
}

export function setHandoff(deal: Deal, handoff: Handoff): Deal {
  return {
    ...deal,
    nextAction: {
      ...deal.nextAction,
      waitingOn: {
        personId: handoff.personId,
        reason: handoff.reason,
        due: handoff.due,
      },
    },
  };
}

export function clearHandoff(deal: Deal): Deal {
  return {
    ...deal,
    nextAction: {
      ...deal.nextAction,
      waitingOn: null,
    },
  };
}

export function parseMentionedIds(body: string, people: Person[] = TEAM): PersonId[] {
  const found = new Set<PersonId>();
  const mentionPattern = /@([A-Za-z]+)/g;
  for (const match of body.matchAll(mentionPattern)) {
    const token = match[1];
    if (!token) {
      continue;
    }
    const person = people.find(
      (member) => firstName(member.name).toLowerCase() === token.toLowerCase(),
    );
    if (person) {
      found.add(person.id);
    }
  }
  return [...found];
}

export function addMention(
  deal: Deal,
  input: { authorId: PersonId; body: string; createdAt: string },
): Deal {
  const mention: Mention = {
    id: `m-${input.createdAt}-${input.authorId}`,
    authorId: input.authorId,
    body: input.body,
    mentionedPersonIds: parseMentionedIds(input.body),
    createdAt: input.createdAt,
  };
  return { ...deal, mentions: [...deal.mentions, mention] };
}

export type PersonWork = {
  nextActions: Deal[];
  waitingOnYou: Deal[];
  openTasks: { deal: Deal; task: Task }[];
};

export function workForPerson(deals: Deal[], personId: PersonId): PersonWork {
  return {
    nextActions: deals.filter(
      (deal) =>
        deal.nextAction.ownerId === personId && !isTerminalStage(deal.stage),
    ),
    waitingOnYou: deals.filter(
      (deal) => deal.nextAction.waitingOn?.personId === personId,
    ),
    openTasks: deals.flatMap((deal) =>
      deal.tasks
        .filter((task) => !task.completed && task.ownerId === personId)
        .map((task) => ({ deal, task })),
    ),
  };
}
