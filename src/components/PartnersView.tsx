import { PARTNERS, pulsesForPartner } from "../domain/partners";
import { formatDate } from "../lib/format";
import { hrefFor } from "../lib/route";
import { useStore } from "../store/store";

export function PartnersView({ partnerId }: { partnerId?: string }) {
  const { pulses } = useStore();
  const selected = partnerId
    ? PARTNERS.find((partner) => partner.id === partnerId)
    : undefined;

  if (selected) {
    const items = pulsesForPartner(pulses, selected.id);
    return (
      <div className="work-page" data-testid="partner-detail">
        <a className="subtle" href={hrefFor({ name: "partners" })}>
          ← Partners
        </a>
        <h1>{selected.name}</h1>
        <p className="subtle">
          In-app pulse only. Stage moves on their files show up here. Nothing
          is emailed or texted.
        </p>
        <div className="work-list">
          {items.length === 0 ? (
            <p className="subtle">No pulses yet. Move a file they referred.</p>
          ) : (
            items.map((pulse) => (
              <a
                key={pulse.id}
                className="work-item"
                href={hrefFor({ name: "file", dealId: pulse.dealId })}
                data-testid={`pulse-${pulse.id}`}
              >
                <p>{pulse.body}</p>
                <p className="subtle">{formatDate(pulse.createdAt.slice(0, 10))}</p>
              </a>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="work-page" data-testid="partners">
      <h1>Realtor partners</h1>
      <p className="subtle">
        Referral partners. Open one, then move a file they sit on and come
        back to see the pulse.
      </p>
      <div className="work-list">
        {PARTNERS.map((partner) => (
          <a
            key={partner.id}
            className="work-item"
            href={hrefFor({ name: "partner", partnerId: partner.id })}
            data-testid={`partner-${partner.id}`}
          >
            <p className="borrower">{partner.name}</p>
            <p className="subtle">
              {pulsesForPartner(pulses, partner.id).length} pulses · {partner.phone}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
