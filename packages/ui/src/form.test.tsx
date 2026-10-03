import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Checkbox,
  DateInput,
  Field,
  FormActions,
  PhoneInput,
  RadioGroup,
  Select,
  TextArea,
  TextInput,
  phoneDigits,
} from "./index.js";

afterEach(cleanup);

describe("Field", () => {
  it("links the label, hint and error to the control and marks it invalid", () => {
    render(
      <Field label="Full name" hint="As written on an ID card" error="Enter a full name" required>
        <TextInput />
      </Field>,
    );
    const input = screen.getByRole("textbox", {
      name: "Full name",
      description: "As written on an ID card Enter a full name",
    });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input).toHaveProperty("required", true);
  });

  it("is valid and described only by its hint when there is no error", () => {
    render(
      <Field label="Email" hint="We send receipts here" error={undefined}>
        <TextInput type="email" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email", description: "We send receipts here" });
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("forwards refs and native props, so form libraries can register the control", () => {
    const ref = vi.fn();
    render(
      <Field label="Code">
        <TextInput ref={ref} name="code" defaultValue="A1" />
      </Field>,
    );
    expect(ref).toHaveBeenCalledWith(screen.getByRole("textbox", { name: "Code" }));
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveProperty("name", "code");
  });

  it("works for a text area", () => {
    render(
      <Field label="Notes" error="Too long">
        <TextArea />
      </Field>,
    );
    const area = screen.getByRole("textbox", { name: "Notes", description: "Too long" });
    expect(area.tagName).toBe("TEXTAREA");
    expect(area.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("Select", () => {
  it("is labelled by its field and reports the chosen option's typed value", () => {
    const onValueChange = vi.fn<(value: "admin" | "member") => void>();
    render(
      <Field label="Role" error="Choose a role">
        <Select
          value=""
          placeholder="Choose…"
          onValueChange={onValueChange}
          options={[
            { value: "admin", label: "Administrator" },
            { value: "member", label: "Member" },
          ]}
        />
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: "Role", description: "Choose a role" });
    expect(select.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(select, { target: { value: "member" } });
    expect(onValueChange).toHaveBeenCalledWith("member");
  });
});

describe("DateInput", () => {
  it("uses the native date field and reports ISO dates", () => {
    const onValueChange = vi.fn();
    render(
      <Field label="Start date" hint="DD/MM/YYYY">
        <DateInput min="2026-01-01" onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText("Start date");
    expect(input.getAttribute("type")).toBe("date");
    expect(input.getAttribute("min")).toBe("2026-01-01");
    fireEvent.change(input, { target: { value: "2026-10-03" } });
    expect(onValueChange).toHaveBeenCalledWith("2026-10-03");
  });
});

describe("PhoneInput", () => {
  function Controlled({ onValueChange }: { onValueChange: (digits: string) => void }) {
    const [value, setValue] = useState("");
    return (
      <Field label="Mobile number" error="Enter 10 digits">
        <PhoneInput
          value={value}
          onValueChange={(digits) => {
            setValue(digits);
            onValueChange(digits);
          }}
        />
      </Field>
    );
  }

  it("shows the calling code, keeps digits only and describes the error", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Mobile number", description: "Enter 10 digits +91" });
    expect(input.getAttribute("inputmode")).toBe("numeric");
    await user.type(input, "98a765-43 210");
    expect(input).toHaveProperty("value", "9876543210");
    expect(onValueChange).toHaveBeenLastCalledWith("9876543210");
  });

  it("strips a pasted international prefix", () => {
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Mobile number" }), {
      target: { value: "+91 98765 43210" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith("9876543210");
  });

  it("supports other calling codes", () => {
    render(
      <Field label="Phone">
        <PhoneInput callingCode="+44" defaultValue="" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Phone", description: "+44" })).toBeTruthy();
  });
});

describe("phoneDigits", () => {
  it.each([
    ["98765 43210", "9876543210"],
    ["+91 98765-43210", "9876543210"],
    ["0091 9876543210", "9876543210"],
    ["919876543210", "9876543210"],
    ["09876543210", "9876543210"],
    ["(987) 654", "987654"],
    ["98765432109999", "9876543210"],
  ])("reads %s as %s", (raw, expected) => {
    expect(phoneDigits(raw, "+91")).toBe(expected);
  });

  it("allows longer numbers for other codes", () => {
    expect(phoneDigits("+44 20 7946 0958", "+44")).toBe("2079460958");
    expect(phoneDigits("1".repeat(20), "+1")).toHaveLength(14);
  });
});

describe("Checkbox", () => {
  it("is named by its label and described by its hint and error", () => {
    render(<Checkbox label="Send reminders" hint="By SMS, the day before" error="Required for this plan" />);
    const box = screen.getByRole("checkbox", {
      name: "Send reminders",
      description: "By SMS, the day before Required for this plan",
    });
    expect(box.getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(screen.getByText("Send reminders"));
    expect(box).toHaveProperty("checked", true);
  });
});

describe("RadioGroup", () => {
  it("names the group by its legend, describes its error and reports typed values", () => {
    const onValueChange = vi.fn<(value: "sms" | "email") => void>();
    render(
      <RadioGroup
        label="Contact preference"
        hint="Choose one"
        error="Select how we should contact you"
        value={null}
        onValueChange={onValueChange}
        options={[
          { value: "sms", label: "Text message" },
          { value: "email", label: "Email", hint: "Receipts and reminders" },
        ]}
      />,
    );
    const group = screen.getByRole("radiogroup", {
      name: "Contact preference",
      description: "Choose one Select how we should contact you",
    });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("radio", { name: "Email", description: "Receipts and reminders" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Text message" }));
    expect(onValueChange).toHaveBeenCalledWith("sms");
  });
});

describe("FormActions", () => {
  it("renders the form's buttons", () => {
    render(
      <FormActions>
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
      </FormActions>,
    );
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Cancel", "Save"]);
  });
});
