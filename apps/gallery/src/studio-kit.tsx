/** The Studio kit: every component of the editorial workspace look, in every state. */

import { CalendarDays, Clock, Receipt, Users, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  ActionBar,
  Avatar,
  BentoCard,
  Button,
  Carousel,
  ChatThread,
  Composer,
  DeviceFrame,
  Heatmap,
  KpiRibbon,
  MiniMonth,
  PageHeader,
  Pills,
  QrCode,
  Stepper,
  Tag,
  type ChatMessage,
  type DeviceKind,
} from "@sakalya/ui";

const KPIS = [
  { id: "visits", label: "Visits today", value: 28, icon: <Users className="size-4" />, trend: 12, hint: "vs last Friday" },
  { id: "waiting", label: "Average wait", value: 14, suffix: " min", icon: <Clock className="size-4" />, trend: -8 },
  { id: "billed", label: "Billed", value: 52400, prefix: "₹", icon: <Receipt className="size-4" />, trend: 5 },
  { id: "collected", label: "Collected", value: 48900.5, prefix: "₹", decimals: 1, icon: <Wallet className="size-4" /> },
  { id: "booked", label: "Booked tomorrow", value: 31, icon: <CalendarDays className="size-4" />, hint: "3 free slots" },
] as const;

const HOURS = ["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"];
const HEAT_ROWS = [
  { id: "r1", label: "Room 1", values: [70, 95, 100, 85, 30, 75, 90, 100, 95, 60] },
  { id: "r2", label: "Room 2", values: [50, 80, 85, 60, 20, 55, 80, 90, 85, 45] },
  { id: "r3", label: "Room 3", values: [30, 55, 70, 40, 10, 45, 60, 75, 80, null] },
];

const STEPS = [
  { id: "details", label: "Details" },
  { id: "health", label: "Health" },
  { id: "consent", label: "Consent" },
];

const SLIDES = [
  { name: "Asha Rao", note: "10:30 · Follow-up · Room 2" },
  { name: "Ben Ito", note: "11:00 · New · Room 1" },
  { name: "Chen Wei", note: "11:30 · Follow-up · Room 3" },
].map((entry) => ({
  id: entry.name,
  label: entry.name,
  content: (
    <div className="flex items-center gap-3">
      <Avatar name={entry.name} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">{entry.name}</p>
        <p className="truncate text-xs">{entry.note}</p>
      </div>
    </div>
  ),
}));

const THREAD: ChatMessage[] = [
  { id: "1", author: "Asha Rao", text: "Closed on Monday. Please move bookings to Tuesday.", time: "9:02", flagged: true },
  { id: "2", author: "Ben Ito", text: "Noted, calling the four people now.", time: "9:05" },
  { id: "3", author: "You", text: "Thanks, tell me if anyone cannot move.", time: "9:06", mine: true },
];

const BUSY = ["2026-10-02", "2026-10-03", "2026-10-06", "2026-10-09", "2026-10-13", "2026-10-16", "2026-10-20", "2026-10-27"];

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <BentoCard title={title} headingLevel={3}>
      <div className="flex flex-col gap-4">{children}</div>
    </BentoCard>
  );
}

function Wizard() {
  const [step, setStep] = useState(1);
  return (
    <>
      <Stepper steps={STEPS} current={step} label="Registration progress" onStepSelect={setStep} />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => {
            setStep(step - 1);
          }}
        >
          Back
        </Button>
        <Button
          disabled={step === STEPS.length}
          onClick={() => {
            setStep(step + 1);
          }}
        >
          {step === STEPS.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </>
  );
}

function Chat() {
  const [messages, setMessages] = useState(THREAD);
  const pinned = messages.filter((message) => message.flagged === true).at(-1);
  return (
    <>
      <ChatThread
        label="Messages in general"
        messages={messages}
        height={220}
        emptyText="No messages yet."
        pinned={pinned === undefined ? undefined : { label: "Notice", author: pinned.author, text: pinned.text }}
      />
      <Composer
        placeholder="Message #general"
        flagOption={{ label: "Send as notice", hint: <Tag tone="warning">Managers only</Tag> }}
        onAttach={() => undefined}
        onSend={(text, { flagged }) => {
          setMessages((current) => [...current, { id: String(current.length + 1), author: "You", text, time: "now", mine: true, flagged }]);
        }}
      />
    </>
  );
}

function Preview() {
  const [device, setDevice] = useState<DeviceKind>("phone");
  return (
    <>
      <Pills
        label="Device"
        value={device}
        onValueChange={setDevice}
        options={[
          { value: "phone", label: "Phone" },
          { value: "desktop", label: "Desktop" },
        ]}
      />
      <DeviceFrame device={device} label="Page preview" address="example.test" maxHeight={260}>
        <div className="space-y-3 p-5">
          <p className="font-display text-2xl">A page on a screen</p>
          <p className="text-sm text-muted">Scrolls inside the frame when it is taller than the screen.</p>
          {Array.from({ length: 6 }, (_, index) => (
            <p key={index} className="rounded-xl bg-surface-muted p-3 text-sm">
              Section {index + 1}
            </p>
          ))}
        </div>
      </DeviceFrame>
    </>
  );
}

/** Studio kit page for the gallery. */
export function StudioKit() {
  const [range, setRange] = useState("week");
  const [day, setDay] = useState<string | undefined>("2026-10-09");
  const [qr, setQr] = useState("https://example.com/pay?amount=500");
  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        variant="display"
        title="Studio kit"
        subtitle="Bento tiles, figures, calendar, heatmap and the rest, in one look"
        end={
          <>
            <Pills
              label="Range"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ]}
            />
            <Button>New entry</Button>
          </>
        }
      />
      <KpiRibbon items={KPIS} locale="en-IN" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Carousel label="Upcoming" slides={SLIDES} />
        <BentoCard tone="inverse" title="Inverse tile" subtitle="Uses the sidebar colours">
          <div className="flex flex-wrap gap-2">
            <Tag tone="inverse">Inverse</Tag>
            <Tag tone="success">Paid</Tag>
            <Tag tone="warning">Due</Tag>
            <Tag tone="danger">Overdue</Tag>
            <Tag tone="info">Info</Tag>
            <Tag tone="primary">Primary</Tag>
            <Tag>Neutral</Tag>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name="Asha Rao" size="sm" />
            <Avatar name="Ben Ito" />
            <Avatar name="Chen Wei" size="lg" />
          </div>
        </BentoCard>
        <BentoCard tone="hero" title="Hero tile" subtitle="One tile that leads the page">
          <p className="text-sm">The primary colour as a gradient, with its own label colour.</p>
        </BentoCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <BentoCard title="Occupancy heatmap" subtitle="This week, share of each hour booked" headingLevel={3}>
          <Heatmap
            columns={HOURS}
            rows={HEAT_ROWS}
            summary="Occupancy by room and hour"
            describe={(value, row, column) => `${row.label}, ${column}: ${String(value)}% booked`}
            legend={{ low: "Low", high: "High" }}
            format={(value) => String(Math.round(value))}
          />
        </BentoCard>
        <BentoCard title="Calendar" subtitle="Dots mark days with entries" headingLevel={3}>
          <MiniMonth value={day} onValueChange={setDay} today="2026-10-09" busy={BUSY} locale="en-IN" />
          <p className="mt-3 text-xs text-muted" role="status">
            Selected: {day ?? "none"}
          </p>
        </BentoCard>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Item title="Stepper">
          <Wizard />
        </Item>
        <Item title="QR code">
          <div className="flex flex-wrap items-center gap-4">
            <QrCode value={qr} label="Scan to pay" size={160} />
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold">
              Encoded text
              <input
                value={qr}
                onChange={(event) => {
                  setQr(event.target.value);
                }}
                className="rounded-xl border border-border-strong bg-surface px-3 py-2 font-mono text-xs font-normal"
              />
            </label>
          </div>
        </Item>
        <Item title="Device frame">
          <Preview />
        </Item>
        <div className="lg:col-span-2 xl:col-span-3">
          <BentoCard title="Chat" subtitle="Enter sends, Shift+Enter adds a line" headingLevel={3}>
            <div className="flex flex-col gap-3">
              <Chat />
            </div>
          </BentoCard>
        </div>
      </div>
      <ActionBar label="Page actions" status="3 changes · saved on this device">
        <Button variant="secondary">Discard</Button>
        <Button>Save</Button>
      </ActionBar>
    </div>
  );
}
