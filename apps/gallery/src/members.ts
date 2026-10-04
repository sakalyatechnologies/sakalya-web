/** Made-up people for the sample pages. */

export type MemberStatus = "active" | "invited" | "suspended";
export type MemberRole = "admin" | "member" | "viewer";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  /** ISO date. */
  joined: string;
  logins: number;
}

const FIRST = ["Asha", "Ravi", "Meera", "Kabir", "Ira", "Arjun", "Nisha", "Dev", "Tara", "Vikram", "Leela", "Omar"];
const LAST = ["Kulkarni", "Shah", "Rao", "Menon", "Iyer", "Joshi", "Desai", "Khan", "Patel", "Nair"];
const ROLES: readonly MemberRole[] = ["admin", "member", "member", "viewer"];
const STATUSES: readonly MemberStatus[] = ["active", "active", "active", "invited", "suspended"];

function pick<T>(list: readonly T[], index: number, fallback: T): T {
  return list[index % list.length] ?? fallback;
}

export const MEMBERS: readonly Member[] = Array.from({ length: 37 }, (_, index) => {
  const first = pick(FIRST, index * 7, "Asha");
  const last = pick(LAST, index * 3, "Rao");
  const day = String((index % 27) + 1).padStart(2, "0");
  const month = String((index % 9) + 1).padStart(2, "0");
  return {
    id: `m${String(index + 1)}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${index > 11 ? String(index) : ""}@example.com`,
    phone: `98${String(10000000 + index * 7919).slice(0, 8)}`,
    role: pick(ROLES, index, "member"),
    status: pick(STATUSES, index * 2, "active"),
    joined: `2026-${month}-${day}`,
    logins: (index * 37) % 120,
  };
});

export const ROLE_LABEL: Readonly<Record<MemberRole, string>> = { admin: "Administrator", member: "Member", viewer: "Viewer" };
