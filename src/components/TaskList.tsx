import { isTaskUnlocked } from "../domain/engine";
import { STAGE_LABELS } from "../domain/stages";
import { firstName, personById } from "../domain/team";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function TaskList({ deal }: { deal: Deal }) {
  const { canCompleteDealTask, completeDealTask } = useStore();

  return (
    <section className="panel" data-testid="task-list">
      <h2>Stage-gated checklist</h2>
      <p className="subtle">
        Public CA pack labels (Pre-approval through Review) for the {deal.book}{" "}
        book. Locked items unlock when the file reaches that stage. One next
        action on the file — this is not a task board.
      </p>
      {deal.tasks.map((task) => {
        const unlocked = isTaskUnlocked(task, deal.stage);
        const owner = task.ownerId ? personById(task.ownerId) : undefined;
        const gate = task.unlockStages[0];
        return (
          <div
            key={task.id}
            className={`task-row${task.completed ? " done" : ""}${unlocked ? "" : " locked"}`}
          >
            <div>
              <div className="task-title">
                {task.packLabel ? (
                  <span className="pack-label">{task.packLabel}</span>
                ) : null}{" "}
                {task.title}
              </div>
              <div className="subtle">
                {owner ? `Owner ${firstName(owner.name)}` : "Owner unassigned"}
                {unlocked
                  ? ""
                  : gate
                    ? ` · unlocks at ${STAGE_LABELS[gate]}`
                    : ""}
              </div>
            </div>
            {task.completed ? (
              <span className="subtle">Done</span>
            ) : (
              <button
                type="button"
                className="btn secondary"
                disabled={!canCompleteDealTask(deal.id, task.id) || !unlocked}
                onClick={() => completeDealTask(deal.id, task.id)}
              >
                Complete
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
