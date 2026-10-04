/** A sample form page: every field type, validation messages, and a toast on success. */

import { useState, type SubmitEvent } from "react";

import {
  Button,
  Card,
  Checkbox,
  DateInput,
  Field,
  FormActions,
  PageHeader,
  PhoneInput,
  RadioGroup,
  Select,
  TextArea,
  TextInput,
  useToast,
} from "@sakalya/ui";

import { ROLE_LABEL, type MemberRole } from "./members.js";

type Contact = "sms" | "email";

interface Draft {
  name: string;
  email: string;
  phone: string;
  role: MemberRole | "";
  start: string;
  contact: Contact | null;
  notes: string;
  terms: boolean;
}

type Errors = Partial<Record<keyof Draft, string>>;

const EMPTY: Draft = { name: "", email: "", phone: "", role: "", start: "", contact: null, notes: "", terms: false };

/** Plain-string errors, as a product would map them from an API's field errors. */
function validate(draft: Draft): Errors {
  const errors: Errors = {};
  if (draft.name.trim() === "") errors.name = "Enter a full name";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email)) errors.email = "Enter an email address like name@example.com";
  if (draft.phone.length !== 10) errors.phone = "Enter a 10-digit mobile number";
  if (draft.role === "") errors.role = "Choose a role";
  if (draft.contact === null) errors.contact = "Choose how we should contact them";
  if (draft.notes.length > 200) errors.notes = "Keep notes under 200 characters";
  if (!draft.terms) errors.terms = "Confirm they agreed to be added";
  return errors;
}

export function SampleForm() {
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      toast.show({ title: "Member added", description: `${draft.name} can now sign in.`, tone: "success" });
      setDraft(EMPTY);
    } else {
      toast.show({ title: "Check the form", description: "Some fields need attention.", tone: "danger" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageHeader title="Add a member" subtitle="Invite someone to your workspace." />
      <Card>
        <form noValidate onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <TextInput autoComplete="name" value={draft.name} onChange={(e) => { set("name", e.target.value); }} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <TextInput type="email" autoComplete="email" value={draft.email} onChange={(e) => { set("email", e.target.value); }} />
            </Field>
            <Field label="Mobile number" required hint="We send the invite by SMS" error={errors.phone}>
              <PhoneInput value={draft.phone} onValueChange={(digits) => { set("phone", digits); }} />
            </Field>
            <Field label="Role" required error={errors.role}>
              <Select
                value={draft.role}
                placeholder="Choose a role"
                options={(["admin", "member", "viewer"] as const).map((role) => ({ value: role, label: ROLE_LABEL[role] }))}
                onValueChange={(role) => { set("role", role); }}
              />
            </Field>
            <Field label="Start date" hint="Leave empty to start today">
              <DateInput value={draft.start} min="2026-01-01" onValueChange={(value) => { set("start", value); }} />
            </Field>
            <RadioGroup<Contact>
              label="Contact preference"
              required
              value={draft.contact}
              error={errors.contact}
              orientation="horizontal"
              options={[
                { value: "sms", label: "Text message" },
                { value: "email", label: "Email" },
              ]}
              onValueChange={(contact) => { set("contact", contact); }}
            />
            <Field label="Notes" hint={`${String(draft.notes.length)}/200`} error={errors.notes} className="md:col-span-2">
              <TextArea value={draft.notes} onChange={(e) => { set("notes", e.target.value); }} />
            </Field>
          </div>
          <Checkbox
            label="They agreed to be added to this workspace"
            checked={draft.terms}
            error={errors.terms}
            onChange={(e) => { set("terms", e.target.checked); }}
          />
          <FormActions>
            <Button variant="secondary" onClick={() => { setDraft(EMPTY); setErrors({}); }}>
              Clear
            </Button>
            <Button type="submit">Add member</Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
}
