import { useState } from "react";
import type { ResidentialPurpose } from "../types";
import { useStore } from "../store/store";

const PURPOSES: { value: ResidentialPurpose; label: string }[] = [
  { value: "renewal", label: "Renewal" },
  { value: "purchase", label: "Purchase" },
  { value: "refinance", label: "Refinance" },
  { value: "switch", label: "Switch" },
];

export function CapturePage() {
  const { startCapture } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState<ResidentialPurpose | "">("renewal");

  return (
    <div className="capture-page" data-testid="capture-page">
      <div className="capture-hero">
        <p className="capture-kicker">Fileflow demo · not a live lender</p>
        <h1>Don&apos;t auto-renew with your bank.</h1>
        <p className="capture-lede">
          One shop. A 20-minute consult. A person still takes the file. The
          desk qualifies you here, books the slot, and hands the next action to
          reception.
        </p>
        <form
          className="capture-form"
          onSubmit={(event) => {
            event.preventDefault();
            const id = startCapture({
              name,
              phone,
              purpose: purpose || null,
            });
            window.location.hash = `#/inbox/${id}`;
          }}
        >
          <label className="field">
            Your name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dana Textin"
              required
              data-testid="capture-name"
            />
          </label>
          <label className="field">
            Mobile
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="604-555-0100"
              required
              data-testid="capture-phone"
            />
          </label>
          <label className="field">
            What do you need
            <select
              value={purpose}
              onChange={(event) =>
                setPurpose(event.target.value as ResidentialPurpose)
              }
              data-testid="capture-purpose"
            >
              {PURPOSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn" data-testid="capture-submit">
            Start the desk
          </button>
        </form>
        <p className="subtle">
          No ads fire from this page. Submit drops you into the same SMS /
          WhatsApp thread the shop sees in Inbox.
        </p>
        <p>
          <a href="#/inbox">Back to inbox</a>
          {" · "}
          <a href="#/">Pipeline</a>
        </p>
      </div>
    </div>
  );
}
