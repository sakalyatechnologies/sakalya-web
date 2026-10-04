import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";

import { createTheme, hex } from "@sakalya/tokens";

import {
  AppShell,
  Badge,
  BarChart,
  Button,
  Card,
  CardLink,
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
  Menu,
  Meter,
  Pagination,
  PhoneInput,
  RadioGroup,
  SearchInput,
  Select,
  Skeleton,
  StatCard,
  Switch,
  Tabs,
  TextArea,
  TextInput,
  ThemeScope,
  WeekGrid,
} from "./index.js";

afterEach(cleanup);

/**
 * Runs axe over the whole document, portals included. Colour contrast needs real layout, which
 * jsdom lacks; the theme engine's contrast tests cover it. `region` is off because the
 * catalogue renders components outside page landmarks on purpose.
 */
async function violations(): Promise<string[]> {
  const results = await axe.run(document.body, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
}

const theme = createTheme({ brand: hex("#14a89a"), mode: "light" });
const noop = () => undefined;

interface Row {
  id: string;
  name: string;
  amount: number;
}

function Catalogue() {
  return (
    <ThemeScope theme={theme}>
      <main>
        <h1>Catalogue</h1>
        <form>
          <Field label="Full name" hint="As on an ID card" error="Enter a full name" required>
            <TextInput />
          </Field>
          <Field label="Notes">
            <TextArea />
          </Field>
          <Field label="Role">
            <Select value="" placeholder="Choose…" options={[{ value: "admin", label: "Administrator" }]} onChange={noop} />
          </Field>
          <Field label="Start date">
            <DateInput />
          </Field>
          <Field label="Mobile number" error="Enter 10 digits">
            <PhoneInput value="98765" onChange={noop} />
          </Field>
          <Checkbox label="Send reminders" hint="By SMS" />
          <RadioGroup
            label="Contact preference"
            error="Choose one"
            value={null}
            onValueChange={noop}
            options={[
              { value: "sms", label: "Text message" },
              { value: "email", label: "Email", hint: "Receipts too" },
            ]}
          />
          <FormActions>
            <Button variant="secondary">Cancel</Button>
            <Button type="submit">Save</Button>
          </FormActions>
        </form>
        <Card title="Members" action={<CardLink href="#all">View all</CardLink>}>
          <DataTable<Row>
            caption="Members"
            rows={Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `Member ${String(i)}`, amount: i * 10 }))}
            rowKey={(row) => row.id}
            columns={[
              { id: "name", header: "Name", cell: (row) => row.name, sortValue: (row) => row.name },
              { id: "amount", header: "Amount", align: "end", cell: (row) => String(row.amount), sortValue: (row) => row.amount },
              { id: "status", header: "Status", cell: () => <Badge tone="success">Active</Badge> },
              {
                id: "actions",
                header: "Actions",
                hideHeader: true,
                cell: (row) => <Menu label={`Actions for ${row.name}`} icon={<span>⋯</span>} items={[{ id: "edit", label: "Edit" }]} onSelect={noop} />,
              },
            ]}
          />
        </Card>
        <DataTable<Row> caption="Loading" rows={[]} loading rowKey={(row) => row.id} columns={[{ id: "name", header: "Name", cell: (row) => row.name }]} />
        <EmptyState title="Nothing here yet" description="Add the first item." action={<Button>Add</Button>} />
        <ErrorState requestId="req_1" onRetry={noop} />
        <Skeleton />
        <Pagination page={2} pageCount={5} onPageChange={noop} summary="Showing 11–20 of 42" />
        <Tabs label="Views" items={[{ value: "a", label: "All", content: <p>All</p> }, { value: "b", label: "Mine", content: <p>Mine</p> }]} />
        <SearchInput label="Search members" value="" onValueChange={noop} />
        <StatCard
          label="Open items"
          value="12"
          icon={<span>#</span>}
          href="#open"
          trend={{ label: "3 more", direction: "up", good: false }}
          sparkline={[3, 5, 4, 7, 6, 9]}
        />
        <BarChart data={[{ label: "Mon", total: 4, part: 3 }]} totalLabel="Booked" partLabel="Done" summary="Bookings this week" />
        <DonutChart data={[{ label: "Restorative", value: 30 }, { label: "Ortho", value: 20 }]} summary="Revenue mix" centerValue="₹50k" centerLabel="total" />
        <Meter label="Composite A2 stock" value={4} max={40} lowAt={8} />
        <Switch label="Low-stock alerts" hint="Email the owner" defaultChecked />
        <ChipFilterGroup
          label="Filter members"
          options={[
            { value: "all", label: "All" },
            { value: "balance", label: "With balance" },
          ]}
          value={["all"]}
          onValueChange={noop}
        />
        <WeekGrid
          days={[
            { id: "mon", label: "Mon", dateLabel: "12" },
            { id: "tue", label: "Tue", dateLabel: "13", current: true },
          ]}
          startHour={9}
          endHour={12}
          blocks={[{ id: "a1", dayId: "mon", start: 9.5, duration: 1, label: "Root canal", tone: "primary" }]}
          summary="This week's appointments"
          onBlockSelect={noop}
        />
        {(["soft", "solid", "outline"] as const).map((variant) => (
          <Badge key={variant} tone="danger" variant={variant}>
            {variant}
          </Badge>
        ))}
      </main>
    </ThemeScope>
  );
}

describe("accessibility (axe)", () => {
  it("catches a real problem, so a pass means something", async () => {
    render(<button type="button" />);
    expect((await violations()).join()).toContain("button-name");
  });

  it("finds no violations across the form kit, data display and charts", async () => {
    render(<Catalogue />);
    expect(await violations()).toEqual([]);
  });

  it("finds no violations in the app shell", async () => {
    render(
      <ThemeScope theme={theme}>
        <AppShell brand={<span>Brand</span>} nav={[{ id: "home", label: "Home", icon: <span />, href: "#home" }]} activeId="home" onSearch={noop}>
          <h1>Home</h1>
        </AppShell>
      </ThemeScope>,
    );
    expect(await violations()).toEqual([]);
  });

  it("finds no violations with a dialog open in its portal", async () => {
    render(
      <ThemeScope theme={theme}>
        <main>
          <h1>Overlays</h1>
          <Dialog open onOpenChange={noop} title="Edit member" description="Changes save at once." footer={<Button>Save</Button>}>
            <Field label="Name">
              <TextInput />
            </Field>
          </Dialog>
        </main>
      </ThemeScope>,
    );
    await screen.findByRole("dialog", { name: "Edit member" });
    expect(await violations()).toEqual([]);
  });

  it("finds no violations with a drawer open in its portal", async () => {
    render(
      <ThemeScope theme={theme}>
        <main>
          <h1>Overlays</h1>
          <Drawer open onOpenChange={noop} title="Filters" footer={<Button>Apply</Button>}>
            <Checkbox label="Only active" />
          </Drawer>
        </main>
      </ThemeScope>,
    );
    await screen.findByRole("dialog", { name: "Filters" });
    expect(await violations()).toEqual([]);
  });

  it("finds no violations with a menu open in its portal", async () => {
    const user = userEvent.setup();
    render(
      <ThemeScope theme={theme}>
        <main>
          <h1>Overlays</h1>
          <Menu
            label="Sort"
            items={[{ id: "name", label: "Name" }, { id: "delete", label: "Delete", danger: true, separatorBefore: true }]}
            onSelect={noop}
          />
        </main>
      </ThemeScope>,
    );
    await user.click(screen.getByRole("button", { name: "Sort" }));
    await screen.findByRole("menu");
    expect(await violations()).toEqual([]);
  });
});
