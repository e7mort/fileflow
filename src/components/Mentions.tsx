import { useState } from "react";
import { firstName, personById, TEAM } from "../domain/team";
import { useStore } from "../store/store";
import type { Deal } from "../types";

export function Mentions({ deal }: { deal: Deal }) {
  const { mention, currentPerson } = useStore();
  const [body, setBody] = useState("");

  return (
    <section className="panel" data-testid="mentions">
      <h2>File notes</h2>
      <p className="subtle">
        In-app only. Mention someone with @Morgan, @Riley, @Casey, or @Taylor.
        Nothing is emailed.
      </p>
      <div className="mentions">
        {deal.mentions.map((item) => {
          const author = personById(item.authorId);
          const named = item.mentionedPersonIds
            .map((id) => personById(id)?.name)
            .filter((name): name is string => Boolean(name));
          return (
            <div className="mention" key={item.id}>
              <div className="subtle">
                {author ? firstName(author.name) : "Unknown"} ·{" "}
                {new Date(item.createdAt).toLocaleString("en-CA")}
                {named.length ? ` · to ${named.join(", ")}` : ""}
              </div>
              <p>{item.body}</p>
            </div>
          );
        })}
      </div>
      <form
        className="mention-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!body.trim()) {
            return;
          }
          mention(deal.id, body.trim());
          setBody("");
        }}
      >
        <div className="field">
          <label htmlFor="mention-body">Note as {currentPerson.name}</label>
          <textarea
            id="mention-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="@Riley can you take title?"
          />
        </div>
        <div className="row-actions">
          <button type="submit" className="btn secondary">
            Add note
          </button>
          <span className="subtle">
            Shop: {TEAM.map((person) => `@${firstName(person.name)}`).join(" ")}
          </span>
        </div>
      </form>
    </section>
  );
}
