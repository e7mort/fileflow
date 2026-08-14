import { isTaskUnlocked } from "../domain/engine";
import { STAGE_LABELS } from "../domain/stages";
import { firstName, personById } from "../domain/team";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function TaskList({ deal }: { deal: Deal }) {
  const { canWrite, completeDealTask } = useStore();

  return (
    <section className="panel" data-testid="task-list">
      <h2>Stage-gated checklist</h2>
      <p className="subtle">
        Templates for the {deal.book} book. Locked items unlock when the file
        reaches that stage.
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
              <div className="task-title">{task.title}</div>
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
                disabled={!canWrite || !unlocked}
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
