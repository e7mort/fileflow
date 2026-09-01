import { TEAM, roleLabel } from "../domain/team";
import { hrefFor, type Route } from "../lib/route";
import { useStore } from "../store/store";

export function AppHeader({ route }: { route: Route }) {
  const { currentPerson, setCurrentPersonId, resetDemo } = useStore();

  return (
    <header className="app-header">
      <a className="wordmark" href="#/">
        File<span>flow</span>
      </a>
      <nav className="nav-links">
        <a
          href={hrefFor({ name: "today" })}
          className={route.name === "today" ? "active" : undefined}
        >
          Today
        </a>
        <a
          href="#/"
          className={route.name === "board" ? "active" : undefined}
        >
          Pipeline
        </a>
        <a
          href={hrefFor({ name: "calendar" })}
          className={route.name === "calendar" ? "active" : undefined}
        >
          Calendar
        </a>
        <a
          href={hrefFor({ name: "partners" })}
          className={route.name === "partners" || route.name === "partner" ? "active" : undefined}
        >
          Partners
        </a>
        <a
          href={hrefFor({ name: "invoices" })}
          className={route.name === "invoices" ? "active" : undefined}
        >
          Invoices
        </a>
      </nav>
      <div className="header-spacer" />
      <label className="subtle" htmlFor="person-switcher">
        Viewing as
      </label>
      <select
        id="person-switcher"
        className="people-switcher"
        data-testid="people-switcher"
        value={currentPerson.id}
        onChange={(event) => setCurrentPersonId(event.target.value)}
      >
        {TEAM.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name} · {roleLabel(person.role)}
          </option>
        ))}
      </select>
      <button type="button" className="btn secondary" onClick={resetDemo}>
        Reset demo
      </button>
    </header>
  );
}
