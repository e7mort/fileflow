import { useState } from "react";
import { partyRoleLabel } from "../domain/parties";
import { useStore } from "../store/store";
import { PARTY_ROLES, type Deal, type PartyRole } from "../types";

export function PartiesPanel({ deal }: { deal: Deal }) {
  const { canWrite, addDealParty } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<PartyRole>("borrower");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="panel" data-testid="parties-panel">
      <h2>People on this file</h2>
      <p className="subtle">
        Borrowers, realtor, and lawyer / notary. The shop roster in the header
        is separate.
      </p>
      {deal.parties.map((party) => (
        <div className="task-row" key={party.id}>
          <div>
            <div>{party.name}</div>
            <div className="subtle">
              {partyRoleLabel(party.role)}
              {party.email ? ` · ${party.email}` : ""}
              {party.phone ? ` · ${party.phone}` : ""}
            </div>
          </div>
        </div>
      ))}
      {canWrite ? (
        <form
          className="handoff-form"
          data-testid="add-party-form"
          onSubmit={(event) => {
            event.preventDefault();
            const result = addDealParty(deal.id, { name, email, phone, role });
            if (!result.ok && result.error === "already-assigned") {
              setError(
                `${result.existing.name} is already assigned on this file as ${partyRoleLabel(result.existing.role).toLowerCase()}.`,
              );
              return;
            }
            if (!result.ok) {
              setError("Enter a name.");
              return;
            }
            setError(null);
            setName("");
            setEmail("");
            setPhone("");
          }}
        >
          <div className="field">
            <label htmlFor="party-name">Name</label>
            <input
              id="party-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              data-testid="party-name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="party-role">Role</label>
            <select
              id="party-role"
              value={role}
              onChange={(event) => {
                const next = PARTY_ROLES.find((item) => item === event.target.value);
                if (next) {
                  setRole(next);
                }
              }}
            >
              {PARTY_ROLES.map((item) => (
                <option key={item} value={item}>
                  {partyRoleLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="party-email">Email</label>
            <input
              id="party-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="party-phone">Phone</label>
            <input
              id="party-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <button type="submit" className="btn" data-testid="add-party">
            Add person
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="waiting-chip" data-testid="party-duplicate">
          {error}
        </p>
      ) : null}
    </section>
  );
}
