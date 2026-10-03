/**
 * A sample clinic dashboard built only from @sakalya/ui. All names and figures are made up.
 */

import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  ClipboardList,
  FlaskConical,
  Home,
  IndianRupee,
  LayoutGrid,
  Package,
  PieChart,
  Plus,
  ReceiptText,
  Settings,
  Smile,
  Stethoscope,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

import {
  AppShell,
  AttentionList,
  BarChart,
  Button,
  Card,
  CardLink,
  IconButton,
  PageHeader,
  PersonList,
  Pill,
  StatCard,
  Timeline,
  UserChip,
} from "@sakalya/ui";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: <Home />, href: "#dashboard" },
  { id: "calendar", label: "Calendar", icon: <CalendarDays />, href: "#calendar" },
  { id: "patients", label: "Patients", icon: <UsersRound />, href: "#patients" },
  { id: "treatments", label: "Treatments", icon: <Stethoscope />, href: "#treatments" },
  { id: "billing", label: "Billing", icon: <ReceiptText />, href: "#billing" },
  { id: "crm", label: "CRM / Follow-ups", icon: <Users />, href: "#crm" },
  { id: "inventory", label: "Inventory", icon: <Package />, href: "#inventory" },
  { id: "lab", label: "Lab Cases", icon: <FlaskConical />, href: "#lab" },
  { id: "team", label: "Team", icon: <LayoutGrid />, href: "#team" },
  { id: "reports", label: "Reports", icon: <PieChart />, href: "#reports" },
  { id: "settings", label: "Clinic Settings", icon: <Settings />, href: "#settings" },
] as const;

const SCHEDULE = [
  { id: "1", time: "09:00", title: "Rahul Patil", subtitle: "32 Y · Male", detail: "Root Canal (RCT)", detailSub: "Room 1 · Dr. Kiran", status: { label: "Completed", tone: "success", icon: <CheckCircle2 className="size-3.5" /> } },
  { id: "2", time: "10:00", title: "Sneha Shah", subtitle: "28 Y · Female", detail: "Consultation", detailSub: "Room 2 · Dr. Kiran", status: { label: "Completed", tone: "success", icon: <CheckCircle2 className="size-3.5" /> } },
  { id: "3", time: "10:30", title: "Amit Joshi", subtitle: "45 Y · Male", detail: "Crown Fitting", detailSub: "Room 1 · Dr. Kiran", status: { label: "Waiting (12 min)", tone: "warning", icon: <Clock3 className="size-3.5" /> }, current: true },
  { id: "4", time: "11:00", title: "Priya Mehta", subtitle: "36 Y · Female", detail: "Teeth Cleaning", detailSub: "Room 2 · Dr. Kiran", status: { label: "Checked In", tone: "info", icon: <CircleDot className="size-3.5" /> } },
  { id: "5", time: "11:30", title: "Rohan Kulkarni", subtitle: "29 Y · Male", detail: "RCT · Sitting 2", detailSub: "Room 1 · Dr. Kiran", status: { label: "Upcoming", tone: "neutral" } },
  { id: "6", time: "12:00", title: "Anjali Desai", subtitle: "41 Y · Female", detail: "Consultation", detailSub: "Room 2 · Dr. Kiran", status: { label: "Upcoming", tone: "neutral" } },
] as const;

const HOURS = [
  { label: "8 AM", total: 1, part: 1 },
  { label: "9 AM", total: 3, part: 2 },
  { label: "10 AM", total: 5, part: 3 },
  { label: "11 AM", total: 5, part: 4 },
  { label: "12 PM", total: 3, part: 1 },
  { label: "1 PM", total: 6, part: 6 },
  { label: "2 PM", total: 7, part: 6 },
  { label: "3 PM", total: 8, part: 8 },
  { label: "4 PM", total: 6, part: 4 },
  { label: "5 PM", total: 4, part: 4 },
];

const ATTENTION = [
  { id: "a", title: "3 patients need follow-up", subtitle: "Post-treatment follow-up pending", tone: "danger", icon: <AlertCircle className="size-4" />, href: "#crm" },
  { id: "b", title: "2 treatment plans awaiting approval", subtitle: "Share and get patient consent", tone: "warning", icon: <ClipboardList className="size-4" />, href: "#treatments" },
  { id: "c", title: "₹64,000 outstanding payments", subtitle: "From 5 patients", tone: "primary", icon: <Wallet className="size-4" />, href: "#billing" },
  { id: "d", title: "4 low-stock items", subtitle: "Composite, gloves, NaOCl, impression trays", tone: "info", icon: <Package className="size-4" />, href: "#inventory" },
  { id: "e", title: "1 lab case due today", subtitle: "Crown · Amit Joshi", tone: "success", icon: <FlaskConical className="size-4" />, href: "#lab" },
] as const;

const RECENT = [
  { id: "r1", name: "Rahul Patil", subtitle: "RCT completed", value: "₹5,000", valueSub: "Today, 09:00 AM" },
  { id: "r2", name: "Amit Joshi", subtitle: "Checked in · Crown", status: { label: "Waiting 12 min", tone: "warning" }, valueSub: "Today, 10:30 AM" },
  { id: "r3", name: "Priya Mehta", subtitle: "Treatment plan created", value: "₹18,000 (estimate)", valueSub: "Today, 11:00 AM" },
  { id: "r4", name: "Sneha Shah", subtitle: "Follow-up required", status: { label: "Tomorrow, 10:00 AM", tone: "danger" } },
] as const;

const PLANS = [
  { id: "p1", name: "Neha Kulkarni", subtitle: "Aligners treatment · ₹48,000", status: { label: "Awaiting approval", tone: "success" } },
  { id: "p2", name: "Vikram Rao", subtitle: "Implant + crown · ₹72,000", status: { label: "Awaiting approval", tone: "success" } },
] as const;

const STOCK = [
  { id: "s1", name: "Composite resin", subtitle: "Restorative", status: { label: "Low stock (3 left)", tone: "danger" } },
  { id: "s2", name: "Gloves (M)", subtitle: "Consumables", status: { label: "Low stock (5 left)", tone: "danger" } },
  { id: "s3", name: "Impression trays", subtitle: "Prosthetics", status: { label: "Low stock (2 left)", tone: "danger" } },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-on-primary">
        <Smile aria-hidden="true" className="size-6" />
      </span>
      <div className="leading-tight">
        <p className="text-lg font-extrabold tracking-tight text-text">Smile Catchers</p>
        <p className="text-xs text-muted">Healthy Smiles, Brighter Lives</p>
      </div>
    </div>
  );
}

function SidebarPromo() {
  return (
    <div className="rounded-card bg-primary-soft p-5">
      <p className="text-lg font-extrabold leading-snug text-sidebar-active-text">Beautiful smiles, healthier lives</p>
      <p className="mt-2 text-xs text-sidebar-active-text">Advanced care, personalised treatment.</p>
    </div>
  );
}

function TopBarEnd() {
  return (
    <>
      <button type="button" className="hidden items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text shadow-card md:inline-flex">
        Main Clinic · Baner, Pune
        <ChevronDown aria-hidden="true" className="size-4 text-muted" />
      </button>
      <IconButton label="Calendar">
        <CalendarDays aria-hidden="true" className="size-5" />
      </IconButton>
      <IconButton label="Notifications" badge={3}>
        <Bell aria-hidden="true" className="size-5" />
      </IconButton>
      <UserChip name="Dr. Kiran" role="Clinic Owner" />
    </>
  );
}

export function SampleDashboard() {
  return (
    <AppShell
      brand={<Brand />}
      nav={NAV}
      activeId="dashboard"
      sidebarFooter={<SidebarPromo />}
      topBarEnd={<TopBarEnd />}
      searchPlaceholder="Search patients, appointments, treatments, invoices…"
    >
      <PageHeader
        title="Good morning, Dr. Kiran"
        subtitle="Here's what's happening at Smile Catchers today."
        end={
          <>
            <span className="rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text">Tue, 29 Sep</span>
            <Button icon={<Plus aria-hidden="true" className="size-4" />}>Quick add</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's appointments"
          value="12"
          icon={<CalendarDays className="size-7" />}
          href="#calendar"
          footer={
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
              <span className="text-success">● 3 completed</span>
              <span className="text-danger">● 2 waiting</span>
              <span className="text-warning">● 7 upcoming</span>
            </div>
          }
        />
        <StatCard
          label="Patients waiting"
          value="2"
          icon={<UsersRound className="size-7" />}
          href="#calendar"
          footer={
            <div className="flex flex-col gap-1.5">
              <Pill tone="danger" icon={<Clock3 className="size-3.5" />}>Amit Joshi · 12 min</Pill>
              <Pill tone="warning" icon={<Clock3 className="size-3.5" />}>Priya Mehta · 5 min</Pill>
            </div>
          }
        />
        <StatCard
          label="Today's collection"
          value="₹28,500"
          icon={<IndianRupee className="size-7" />}
          href="#billing"
          trend={{ label: "18% vs yesterday", direction: "up", good: true }}
        />
        <StatCard
          label="Pending dues"
          value="₹64,000"
          tone="danger"
          icon={<ReceiptText className="size-7" />}
          href="#billing"
          trend={{ label: "5 patients", direction: "up", good: false }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Today's schedule"
          action={
            <div className="flex items-center gap-3">
              <CardLink href="#calendar">View calendar</CardLink>
              <Button icon={<Plus aria-hidden="true" className="size-4" />}>New appointment</Button>
            </div>
          }
        >
          <Timeline items={SCHEDULE} onMenu={() => undefined} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Today's overview">
            <BarChart
              data={HOURS}
              totalLabel="Appointments"
              partLabel="Completed"
              categoryLabel="Hour"
              summary="Appointments and completed visits by hour, peaking at 8 at 3 PM"
            />
          </Card>
          <Card title="Attention required" action={<CardLink href="#tasks">View all</CardLink>}>
            <AttentionList items={ATTENTION} />
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Recent patients" action={<CardLink href="#patients">View all</CardLink>}>
          <PersonList items={RECENT} />
        </Card>
        <Card title="Treatment plan approvals" action={<CardLink href="#treatments">View all</CardLink>}>
          <PersonList items={PLANS} />
        </Card>
        <Card title="Inventory alerts" action={<CardLink href="#inventory">View all</CardLink>}>
          <PersonList items={STOCK} />
        </Card>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-card bg-primary p-6 text-on-primary shadow-card">
        <div>
          <p className="text-lg font-extrabold">Your website is live</p>
          <p className="mt-1 text-sm opacity-90">smilecatchers.in · built from your clinic's theme</p>
        </div>
        <button type="button" className="rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-primary">
          Manage website
        </button>
      </div>
    </AppShell>
  );
}
