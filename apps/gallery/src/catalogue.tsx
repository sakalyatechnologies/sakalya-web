/** Every component and variant, for checking a theme at a glance. */

import { Bell, Download, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  Badge,
  BarChart,
  Button,
  Card,
  Checkbox,
  ChipFilterGroup,
  DataTable,
  DateInput,
  Dialog,
  DonutChart,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  IconButton,
  Menu,
  Meter,
  Pagination,
  PhoneInput,
  Pill,
  RadioGroup,
  SearchInput,
  Select,
  Skeleton,
  StatCard,
  Switch,
  Tabs,
  TextArea,
  TextInput,
  WeekGrid,
  useToast,
  type Tone,
  type ToastTone,
} from "@sakalya/ui";

const TONES: readonly Tone[] = ["neutral", "primary", "success", "warning", "danger", "info"];
const TOAST_TONES: readonly ToastTone[] = ["neutral", "success", "warning", "danger", "info"];
const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="flex flex-col gap-5">{children}</div>
    </Card>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function Overlays() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState<"left" | "right" | null>(null);
  const toast = useToast();
  return (
    <Section title="Overlays">
      <Row>
        <Button
          onClick={() => {
            setDialog(true);
          }}
        >
          Open dialog
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDrawer("right");
          }}
        >
          Drawer from the right
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDrawer("left");
          }}
        >
          Drawer from the left
        </Button>
        <Menu
          label="Actions"
          onSelect={(id) => {
            toast.show({ title: `Chose ${id}` });
          }}
          items={[
            { id: "edit", label: "Edit", icon: <Pencil /> },
            { id: "export", label: "Export", icon: <Download /> },
            { id: "archive", label: "Archive", disabled: true },
            { id: "delete", label: "Delete", icon: <Trash2 />, danger: true, separatorBefore: true },
          ]}
        />
        <Menu label="More actions" icon={<MoreHorizontal />} items={[{ id: "share", label: "Share" }]} onSelect={() => undefined} />
      </Row>
      <Row>
        {TOAST_TONES.map((tone) => (
          <Button
            key={tone}
            variant="ghost"
            onClick={() => {
              toast.show({ title: `A ${tone} toast`, description: "It disappears after five seconds.", tone });
            }}
          >
            Toast: {tone}
          </Button>
        ))}
      </Row>
      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title="Rename list"
        description="The new name shows everywhere the list is used."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDialog(false);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Field label="Name">
          <TextInput defaultValue="Weekly report" />
        </Field>
      </Dialog>
      <Drawer
        open={drawer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDrawer(null);
          }
        }}
        side={drawer ?? "right"}
        title="Filters"
        description="Narrow the list."
        footer={
          <Button
            onClick={() => {
              setDrawer(null);
            }}
          >
            Apply
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Checkbox label="Only active" defaultChecked />
          <Field label="Role">
            <Select options={ROLES} defaultValue="" placeholder="Any role" />
          </Field>
        </div>
      </Drawer>
    </Section>
  );
}

function StatCards() {
  return (
    <Section title="Stat cards">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Appointments today"
          value="42"
          icon={<span>#</span>}
          trend={{ label: "12% vs yesterday", direction: "up", good: true }}
          sparkline={[28, 31, 35, 30, 38, 42]}
        />
        <StatCard label="Waiting" value="3" icon={<span>⏱</span>} tone="warning" />
        <StatCard
          label="Collected"
          value="₹28,500"
          icon={<span>₹</span>}
          tone="success"
          trend={{ label: "18% vs yesterday", direction: "up", good: true }}
          href="#billing"
        />
      </div>
    </Section>
  );
}

function Schedule() {
  return (
    <Section title="Schedule">
      <WeekGrid
        days={[
          { id: "mon", label: "Mon", dateLabel: "12" },
          { id: "tue", label: "Tue", dateLabel: "13" },
          { id: "wed", label: "Wed", dateLabel: "14" },
          { id: "thu", label: "Thu", dateLabel: "15" },
          { id: "fri", label: "Fri", dateLabel: "16", current: true },
        ]}
        startHour={9}
        endHour={17}
        summary="This week's appointments"
        onBlockSelect={() => undefined}
        blocks={[
          { id: "a1", dayId: "mon", start: 9.5, duration: 1, label: "Root canal", subtitle: "Room 1", tone: "primary" },
          { id: "a2", dayId: "mon", start: 11, duration: 0.5, label: "Cleaning", tone: "success" },
          { id: "a3", dayId: "wed", start: 10, duration: 1.5, label: "Braces", subtitle: "Room 2", tone: "warning" },
          { id: "a4", dayId: "fri", start: 14, duration: 1, label: "New consult", tone: "info" },
        ]}
      />
    </Section>
  );
}

function DataDisplay() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(2);
  const [filter, setFilter] = useState<readonly string[]>(["all"]);
  return (
    <Section title="Data display">
      <Tabs
        label="Views"
        items={[
          { value: "all", label: "All", content: <p className="text-sm text-muted">Every item.</p> },
          { value: "mine", label: "Assigned to me", content: <p className="text-sm text-muted">Items you own.</p> },
          { value: "closed", label: "Closed", content: <p className="text-sm text-muted">Finished items.</p> },
          { value: "locked", label: "Locked", disabled: true, content: null },
        ]}
      />
      <SearchInput label="Search" placeholder="Search by name" value={search} onValueChange={setSearch} />
      <p className="text-sm text-muted">Debounced value: “{search}”</p>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <Skeleton shape="circle" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-1/2" />
          <Skeleton className="w-3/4" />
        </div>
      </div>
      <Skeleton shape="block" />
      <Pagination page={page} pageCount={5} onPageChange={setPage} summary={`Showing ${String(page * 10 - 9)}–${String(page * 10)} of 50`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border">
          <EmptyState title="No items yet" description="Items you add appear here." action={<Button icon={<Plus className="size-4" />}>Add item</Button>} />
        </div>
        <div className="rounded-card border border-border">
          <ErrorState description="The list could not be loaded." requestId="req_01J9Z6K3M4" onRetry={() => undefined} />
        </div>
      </div>
      <DataTable
        caption="Loading table"
        loading
        rows={[]}
        rowKey={(row: { id: string }) => row.id}
        columns={[
          { id: "name", header: "Name", cell: () => null },
          { id: "status", header: "Status", cell: () => null },
          { id: "amount", header: "Amount", align: "end", cell: () => null },
        ]}
      />
      <div className="max-w-xl">
        <BarChart
          data={[
            { label: "Mon", total: 6, part: 4 },
            { label: "Tue", total: 8, part: 8 },
            { label: "Wed", total: 5, part: 2 },
            { label: "Thu", total: 7, part: 0 },
            { label: "Fri", total: 4, part: 3 },
          ]}
          totalLabel="Planned"
          partLabel="Done"
          categoryLabel="Day"
          summary="Planned and done tasks by day, busiest on Tuesday"
        />
      </div>
      <div className="max-w-sm">
        <DonutChart
          data={[
            { label: "Restorative", value: 30 },
            { label: "Ortho", value: 20 },
            { label: "Surgical", value: 15 },
            { label: "Consults", value: 35 },
          ]}
          summary="Revenue mix this week"
          centerValue="₹1.2L"
          centerLabel="this week"
        />
      </div>
      <ChipFilterGroup
        label="Filter members"
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "balance", label: "With balance" },
          { value: "recalls", label: "Recalls due" },
          { value: "new", label: "New this month" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Meter label="Composite A2 stock" value={28} max={40} lowAt={8} />
        <Meter label="Gloves (box)" value={4} max={40} lowAt={8} />
      </div>
    </Section>
  );
}

/** The catalogue. Overlays open inside the theme they were opened from. */
export function Catalogue() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <Section title="Buttons">
        <Row>
          <Button icon={<Plus className="size-4" />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <IconButton label="Notifications" badge={3}>
            <Bell className="size-5" />
          </IconButton>
          <IconButton label="Team">
            <Users className="size-5" />
          </IconButton>
        </Row>
      </Section>
      <Section title="Badges and pills">
        {(["soft", "solid", "outline"] as const).map((variant) => (
          <Row key={variant}>
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone} variant={variant}>
                {tone}
              </Badge>
            ))}
          </Row>
        ))}
        <Row>
          {TONES.map((tone) => (
            <Pill key={tone} tone={tone}>
              {tone}
            </Pill>
          ))}
        </Row>
      </Section>
      <Section title="Form controls">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" hint="As written on an ID card" required>
            <TextInput placeholder="Full name" />
          </Field>
          <Field label="Email" error="Enter an email address like name@example.com">
            <TextInput type="email" defaultValue="name@" />
          </Field>
          <Field label="Amount" hint="Including tax">
            <TextInput type="number" inputMode="decimal" startAddon="₹" endAddon="INR" defaultValue="1200" />
          </Field>
          <Field label="Disabled" disabled>
            <TextInput defaultValue="Cannot change" />
          </Field>
          <Field label="Role">
            <Select options={ROLES} defaultValue="" placeholder="Choose a role" />
          </Field>
          <Field label="Start date">
            <DateInput defaultValue="2026-10-03" />
          </Field>
          <Field label="Mobile number" hint="10 digits">
            <PhoneInput defaultValue="9876543210" />
          </Field>
          <Field label="Phone (other country)">
            <PhoneInput callingCode="+44" />
          </Field>
          <Field label="Notes" className="md:col-span-2">
            <TextArea placeholder="Anything we should know" />
          </Field>
          <RadioGroup
            label="Contact preference"
            defaultValue="sms"
            options={[
              { value: "sms", label: "Text message", hint: "Fastest" },
              { value: "email", label: "Email" },
              { value: "call", label: "Phone call", disabled: true },
            ]}
          />
          <RadioGroup
            label="Plan"
            orientation="horizontal"
            error="Choose a plan"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Checkbox label="Send reminders" hint="The day before" defaultChecked />
          <Checkbox label="I accept the terms" error="Accept the terms to continue" />
          <Switch label="Low-stock alerts" hint="Email the owner when stock runs low" defaultChecked />
          <Switch label="Quiet hours" disabled />
        </div>
        <FormActions>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </FormActions>
      </Section>
      <Overlays />
      <StatCards />
      <DataDisplay />
      <Schedule />
    </div>
  );
}
