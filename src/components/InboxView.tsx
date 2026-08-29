import { useEffect, useMemo, useState } from "react";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";
import type { Conversation } from "../types";

function lastLine(thread: Conversation): string {
  return thread.messages.at(-1)?.body ?? "No messages";
}

export function InboxView({ conversationId }: { conversationId: string | null }) {
  const {
    conversations,
    sendLeadReply,
    startInboundSms,
    markThreadRead,
  } = useStore();
  const ordered = useMemo(
    () =>
      [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations],
  );
  const active = ordered.find((item) => item.id === conversationId) ?? ordered[0];
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (active && active.unread) {
      markThreadRead(active.id);
    }
  }, [active, markThreadRead]);

  return (
    <div className="inbox-page" data-testid="inbox">
      <aside className="thread-list">
        <div className="board-toolbar">
          <div>
            <h1>Inbox</h1>
            <p className="subtle">
              SMS / WhatsApp desk. The bot qualifies and books. A person still
              owns the file.
            </p>
          </div>
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="btn secondary"
            data-testid="simulate-inbound"
            onClick={() => {
              const id = startInboundSms();
              window.location.hash = `#/inbox/${id}`;
            }}
          >
            Simulate inbound SMS
          </button>
          <a className="btn secondary" href="#/capture">
            Open capture page
          </a>
        </div>
        <div className="thread-stack">
          {ordered.map((thread) => (
            <a
              key={thread.id}
              className={`thread-row${active?.id === thread.id ? " active" : ""}`}
              href={hrefFor({ name: "inbox", conversationId: thread.id })}
              data-testid={`thread-${thread.id}`}
            >
              <strong>
                {thread.contactName}
                {thread.unread ? <span className="unread-dot" /> : null}
              </strong>
              <span className="subtle">
                {thread.channel} · {thread.phone}
              </span>
              <span className="thread-preview">{lastLine(thread)}</span>
            </a>
          ))}
        </div>
      </aside>
      {active ? (
        <section className="thread-pane" data-testid="thread-pane">
          <header className="thread-head">
            <div>
              <h2>{active.contactName}</h2>
              <p className="subtle">
                {active.channel} · {active.phone}
                {active.dealId ? (
                  <>
                    {" · "}
                    <a href={hrefFor({ name: "file", dealId: active.dealId })}>
                      Open file
                    </a>
                  </>
                ) : null}
              </p>
            </div>
            <span className="badge">{active.step}</span>
          </header>
          <div className="bubble-list">
            {active.messages.map((item) => (
              <div
                key={item.id}
                className={`bubble ${item.from}`}
                data-testid={`bubble-${item.from}`}
              >
                <span className="bubble-from">
                  {item.from === "lead" ? active.contactName : "Desk"}
                </span>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) {
                return;
              }
              sendLeadReply(active.id, draft);
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Reply as the lead…"
              data-testid="inbox-composer"
            />
            <button type="submit" className="btn" data-testid="inbox-send">
              Send
            </button>
          </form>
        </section>
      ) : (
        <p className="subtle">No threads yet. Simulate an inbound SMS.</p>
      )}
    </div>
  );
}
