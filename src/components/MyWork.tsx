import { workForPerson } from "../domain/engine";
import { firstName } from "../domain/team";
import { formatCad } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import { BookBadge } from "./BookBadge";

export function MyWork() {
  const { deals, currentPerson } = useStore();
  const work = workForPerson(deals, currentPerson.id);

  return (
    <div className="work-page" data-testid="my-work">
      <h1>My Work</h1>
      <p className="subtle">
        Next actions owned by {currentPerson.name}, files waiting on{" "}
        {firstName(currentPerson.name)}, and open checklist items assigned to
        them. Switch people in the header. This is not a login.
      </p>
      <div className="work-columns">
        <section>
          <h2>Your next actions</h2>
          <div className="work-list">
            {work.nextActions.length === 0 ? (
              <p className="subtle">No files currently owned by this person.</p>
            ) : (
              work.nextActions.map((deal) => (
                <a
                  key={deal.id}
                  className="work-item"
                  href={hrefFor({ name: "file", dealId: deal.id })}
                >
                  <BookBadge book={deal.book} />
                  <p className="borrower">{deal.borrower.name}</p>
                  <p className="subtle">{deal.nextAction.title}</p>
                  <p className="amount">{formatCad(deal.amount)}</p>
                </a>
              ))
            )}
          </div>
        </section>
        <section>
          <h2>Waiting on you</h2>
          <div className="work-list">
            {work.waitingOnYou.length === 0 ? (
              <p className="subtle">Nobody is waiting on this person.</p>
            ) : (
              work.waitingOnYou.map((deal) => (
                <a
                  key={deal.id}
                  className="work-item"
                  href={hrefFor({ name: "file", dealId: deal.id })}
                  data-testid={`work-waiting-${deal.id}`}
                >
                  <BookBadge book={deal.book} />
                  <p className="borrower">{deal.borrower.name}</p>
                  <p className="subtle">{deal.nextAction.waitingOn?.reason}</p>
                </a>
              ))
            )}
          </div>
        </section>
        <section>
          <h2>Open tasks</h2>
          <div className="work-list">
            {work.openTasks.length === 0 ? (
              <p className="subtle">No open checklist items for this person.</p>
            ) : (
              work.openTasks.map(({ deal, task }) => (
                <a
                  key={`${deal.id}-${task.id}`}
                  className="work-item"
                  href={hrefFor({ name: "file", dealId: deal.id })}
                >
                  <BookBadge book={deal.book} />
                  <p className="borrower">{deal.borrower.name}</p>
                  <p className="subtle">{task.title}</p>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
