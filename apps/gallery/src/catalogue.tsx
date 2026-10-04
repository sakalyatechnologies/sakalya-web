/** Every component and variant, for checking a theme at a glance. */

import { Bell, Download, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  Badge,
  BarChart,
  Button,
  Card,
  Checkbox,
  DataTable,
  DateInput,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  IconButton,
  Menu,
  Pagination,
  PhoneInput,
  Pill,
  RadioGroup,
  SearchInput,
  Select,
  Skeleton,
  Tabs,
  TextArea,
  TextInput,
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

function DataDisplay() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(2);
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
        </div>
        <FormActions>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </FormActions>
      </Section>
      <Overlays />
      <DataDisplay />
    </div>
  );
}
