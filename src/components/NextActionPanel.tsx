import { useState } from "react";
import { isTerminalStage } from "../domain/stages";
import { firstName, personById, TEAM } from "../domain/team";
import { formatDate } from "../lib/format";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function NextActionPanel({ deal }: { deal: Deal }) {
  const { canWrite, canCompleteDealTask, completeDealTask, handoff, finishHandoff, currentPerson } =
    useStore();
  const [personId, setPersonId] = useState(TEAM[1]?.id ?? "p-riley");
  const [reason, setReason] = useState("");
  const [due, setDue] = useState("");
  const owner = deal.nextAction.ownerId
    ? personById(deal.nextAction.ownerId)
    : undefined;
  const waiting = deal.nextAction.waitingOn
    ? personById(deal.nextAction.waitingOn.personId)
    : undefined;
  const closed = isTerminalStage(deal.stage);
  const nextTask = deal.tasks.find((task) => task.id === deal.nextAction.taskId);
  const canCompleteNext = Boolean(
    nextTask && canCompleteDealTask(deal.id, nextTask.id),
  );

  return (
    <section className="panel next-panel" data-testid="next-action">
      <h2>Current next action</h2>
      <p className="next-title">{deal.nextAction.title}</p>
      <div className="facts">
        <div className="fact">
          <label>Owner</label>
          <p>{owner ? owner.name : "Unassigned"}</p>
        </div>
        <div className="fact">
          <label>Due</label>
          <p>{formatDate(deal.nextAction.due)}</p>
        </div>
      </div>
      {waiting && deal.nextAction.waitingOn ? (
        <div className="waiting-chip" data-testid="file-waiting">
          Waiting on {waiting.name}. {deal.nextAction.waitingOn.reason}
          {deal.nextAction.waitingOn.due
            ? ` · due ${formatDate(deal.nextAction.waitingOn.due)}`
            : ""}
        </div>
      ) : (
        <p className="subtle">No handoff. This file is not waiting on anyone.</p>
      )}
      {!closed && canWrite ? (
        <div className="row-actions">
          {deal.nextAction.taskId && canCompleteNext ? (
            <button
              type="button"
              className="btn"
              data-testid="complete-next-task"
              onClick={() => {
                if (deal.nextAction.taskId) {
                  completeDealTask(deal.id, deal.nextAction.taskId);
                }
              }}
            >
              Complete this action
            </button>
          ) : null}
          {deal.nextAction.waitingOn ? (
            <button
              type="button"
              className="btn secondary"
              data-testid="clear-handoff"
              onClick={() => finishHandoff(deal.id)}
            >
              Clear handoff
            </button>
          ) : null}
        </div>
      ) : null}
      {!closed && canWrite ? (
        <form
          className="handoff-form"
          data-testid="handoff-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!reason.trim()) {
              return;
            }
            handoff(deal.id, {
              personId,
              reason: reason.trim(),
              due: due || null,
            });
            setReason("");
          }}
        >
          <div className="field">
            <label htmlFor="handoff-person">Hand off to</label>
            <select
              id="handoff-person"
              value={personId}
              onChange={(event) => setPersonId(event.target.value)}
            >
              {TEAM.filter((person) => person.role !== "marketing").map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="handoff-due">Due</label>
            <input
              id="handoff-due"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
          </div>
          <textarea
            required
            placeholder="Reason the file is waiting"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            data-testid="handoff-reason"
          />
          <button type="submit" className="btn" data-testid="create-handoff">
            Set waiting-on
          </button>
        </form>
      ) : null}
      {!canWrite ? (
        <p className="viewer-note">
          Marketing is read-only. Switch to LO, Assistant, UW, or Compliance to
          complete work or create a handoff.
        </p>
      ) : null}
      {canWrite && nextTask && !canCompleteNext ? (
        <p className="viewer-note">
          {currentPerson.role === "assistant"
            ? "Assistant can chase named income docs and schedule. This action is licensed work (not chase)."
            : `${currentPerson.name} can complete compliance / AML checklist items. Switch to LO, Assistant, or UW for this action.`}
        </p>
      ) : null}
      {waiting ? (
        <p className="subtle">
          Board cards show this wait as “Waiting on {firstName(waiting.name)}”.
        </p>
      ) : null}
    </section>
  );
}
