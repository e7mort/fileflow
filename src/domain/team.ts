import type { Person } from "../types";

export const TEAM: Person[] = [
  { id: "p-morgan", name: "Morgan Broker", role: "broker" },
  { id: "p-riley", name: "Riley Assistant", role: "processor" },
  { id: "p-casey", name: "Casey Underwriter", role: "underwriter" },
  { id: "p-taylor", name: "Taylor Marketing", role: "viewer" },
];

export const DEFAULT_PERSON_ID = "p-morgan";

export function personById(id: string): Person | undefined {
  return TEAM.find((person) => person.id === id);
}

export function roleLabel(role: Person["role"]): string {
  switch (role) {
    case "broker":
      return "Broker";
    case "processor":
      return "Processor / assistant";
    case "underwriter":
      return "Underwriter";
    case "viewer":
      return "Viewer";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function canMutateFiles(role: Person["role"]): boolean {
  return role !== "viewer";
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
