/** A sample list page: tabs, search, a sortable paged table, row actions, and every state. */

import { Eye, MoreHorizontal, Plus, UserX } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  DataTable,
  Dialog,
  Drawer,
  ErrorState,
  Field,
  PageHeader,
  SearchInput,
  Tabs,
  TextInput,
  Menu,
  useToast,
  type DataTableColumn,
  type Tone,
} from "@sakalya/ui";

import { MEMBERS, ROLE_LABEL, type Member, type MemberStatus } from "./members.js";

type View = "all" | MemberStatus;
type Demo = "data" | "loading" | "empty" | "error";

const STATUS: Readonly<Record<MemberStatus, { label: string; tone: Tone }>> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invited", tone: "info" },
  suspended: { label: "Suspended", tone: "danger" },
};

const dates = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function SampleTable() {
  const toast = useToast();
  const [view, setView] = useState<View>("all");
  const [search, setSearch] = useState("");
  const [demo, setDemo] = useState<Demo>("data");
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<Member | null>(null);

  const query = search.trim().toLowerCase();
  const rows = MEMBERS.filter(
    (member) =>
      (view === "all" || member.status === view) &&
      (query === "" || member.name.toLowerCase().includes(query) || member.email.includes(query)),
  );

  const columns: readonly DataTableColumn<Member>[] = [
    {
      id: "name",
      header: "Name",
      sortValue: (member) => member.name,
      cell: (member) => (
        <span className="flex flex-col">
          <span className="font-semibold">{member.name}</span>
          <span className="text-xs text-muted">{member.email}</span>
        </span>
      ),
    },
    { id: "phone", header: "Mobile", hideOnMobile: true, cell: (member) => `+91 ${member.phone}` },
    { id: "role", header: "Role", sortValue: (member) => ROLE_LABEL[member.role], cell: (member) => ROLE_LABEL[member.role] },
    {
      id: "status",
      header: "Status",
      sortValue: (member) => member.status,
      cell: (member) => <Badge tone={STATUS[member.status].tone}>{STATUS[member.status].label}</Badge>,
    },
    { id: "joined", header: "Joined", sortValue: (member) => member.joined, cell: (member) => dates.format(new Date(member.joined)) },
    { id: "logins", header: "Sign-ins", align: "end", sortValue: (member) => member.logins, cell: (member) => member.logins },
    {
      id: "actions",
      header: "Actions",
      hideHeader: true,
      cell: (member) => (
        <Menu
          label={`Actions for ${member.name}`}
          icon={<MoreHorizontal />}
          items={[
            { id: "view", label: "View details", icon: <Eye /> },
            { id: "suspend", label: "Suspend", icon: <UserX />, danger: true, separatorBefore: true },
          ]}
          onSelect={(id) => {
            if (id === "view") {
              setViewing(member);
            } else {
              toast.show({ title: `${member.name} suspended`, tone: "warning" });
            }
          }}
        />
      ),
    },
  ];

  const listing = (
    <>
      <SearchInput label="Search members" placeholder="Search by name or email" value={search} onValueChange={setSearch} className="mb-4 sm:max-w-sm" />
      {demo === "error" ? (
        <ErrorState
          description="The member list could not be loaded. Check your connection and try again."
          requestId="req_01J9Z6K3M4QF"
          onRetry={() => {
            setDemo("data");
          }}
        />
      ) : (
        <DataTable
          caption="Members"
          columns={columns}
          rows={demo === "empty" ? [] : rows}
          rowKey={(member) => member.id}
          loading={demo === "loading"}
          defaultSort={{ columnId: "name", direction: "ascending" }}
          empty={
            query === ""
              ? { title: "No members yet", description: "Add someone to get started.", action: <Button onClick={() => { setAdding(true); }}>Add member</Button> }
              : { title: "No matches", description: `Nobody matches “${search}”.` }
          }
        />
      )}
    </>
  );

  const count = (status: View) => MEMBERS.filter((member) => status === "all" || member.status === status).length;
  // Each tab's panel holds the filtered list, so the tabs control what they show.
  const tab = (value: View, label: string) => ({ value, label: `${label} (${String(count(value))})`, content: listing });

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Members"
        subtitle="Everyone with access to this workspace."
        end={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => {
              setAdding(true);
            }}
          >
            Add member
          </Button>
        }
      />
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          Show state:
          {(["data", "loading", "empty", "error"] as const).map((option) => (
            <Button
              key={option}
              variant={demo === option ? "primary" : "secondary"}
              aria-pressed={demo === option}
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                setDemo(option);
              }}
            >
              {option}
            </Button>
          ))}
        </div>
        <Tabs<View>
          label="Member status"
          value={view}
          onValueChange={setView}
          items={[tab("all", "All"), tab("active", "Active"), tab("invited", "Invited"), tab("suspended", "Suspended")]}
        />
      </Card>
      <Dialog
        open={adding}
        onOpenChange={setAdding}
        title="Add a member"
        description="They get an invitation by SMS."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAdding(false); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAdding(false);
                toast.show({ title: "Invitation sent", tone: "success" });
              }}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <Field label="Full name" required>
          <TextInput autoComplete="name" />
        </Field>
      </Dialog>
      <Drawer
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "Member"}
        description={viewing === null ? undefined : viewing.email}
      >
        {viewing === null ? null : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted">Mobile</dt>
            <dd>+91 {viewing.phone}</dd>
            <dt className="text-muted">Role</dt>
            <dd>{ROLE_LABEL[viewing.role]}</dd>
            <dt className="text-muted">Status</dt>
            <dd>
              <Badge tone={STATUS[viewing.status].tone}>{STATUS[viewing.status].label}</Badge>
            </dd>
            <dt className="text-muted">Joined</dt>
            <dd>{dates.format(new Date(viewing.joined))}</dd>
          </dl>
        )}
      </Drawer>
    </div>
  );
}
