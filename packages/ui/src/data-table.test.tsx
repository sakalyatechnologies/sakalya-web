import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTable, sortRows, type DataTableColumn } from "./index.js";

afterEach(cleanup);

interface Member {
  id: string;
  name: string;
  amount: number | null;
}

const COLUMNS: readonly DataTableColumn<Member>[] = [
  { id: "name", header: "Name", cell: (member) => member.name, sortValue: (member) => member.name },
  {
    id: "amount",
    header: "Amount",
    align: "end",
    cell: (member) => (member.amount === null ? "—" : String(member.amount)),
    sortValue: (member) => member.amount,
  },
  {
    id: "actions",
    header: "Actions",
    hideHeader: true,
    cell: (member) => <button type="button">Edit {member.name}</button>,
  },
];

const FEW: readonly Member[] = [
  { id: "c", name: "Charlie", amount: 30 },
  { id: "a", name: "alice", amount: null },
  { id: "b", name: "Bob", amount: 5 },
];

function many(count: number): Member[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${String(index + 1)}`,
    name: `Member ${String(index + 1).padStart(2, "0")}`,
    amount: index,
  }));
}

function table() {
  return screen.getByRole("table", { name: "Members" });
}

function rowNames(): string[] {
  return within(table())
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);
}

describe("DataTable", () => {
  it("renders typed columns, with the first column as row headers", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={FEW} rowKey={(member) => member.id} />);
    expect(within(table()).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Name",
      "Amount",
      "Actions",
    ]);
    expect(rowNames()).toEqual(["Charlie", "alice", "Bob"]);
  });

  it("sorts when a header is pressed and reports the order with aria-sort", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable caption="Members" columns={COLUMNS} rows={FEW} rowKey={(member) => member.id} onSortChange={onSortChange} />,
    );
    const nameButton = within(table()).getByRole("button", { name: "Name" });
    fireEvent.click(nameButton);
    expect(rowNames()).toEqual(["alice", "Bob", "Charlie"]);
    expect(within(table()).getByRole("columnheader", { name: "Name" }).getAttribute("aria-sort")).toBe("ascending");
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "name", direction: "ascending" });

    fireEvent.click(nameButton);
    expect(rowNames()).toEqual(["Charlie", "Bob", "alice"]);
    expect(within(table()).getByRole("columnheader", { name: "Name" }).getAttribute("aria-sort")).toBe("descending");
  });

  it("keeps blank values last whichever way a column is sorted", () => {
    const amount = COLUMNS[1];
    expect(amount).toBeDefined();
    if (amount === undefined) {
      return;
    }
    expect(sortRows(FEW, amount, "ascending").map((member) => member.name)).toEqual(["Bob", "Charlie", "alice"]);
    expect(sortRows(FEW, amount, "descending").map((member) => member.name)).toEqual(["Charlie", "Bob", "alice"]);
  });

  it("shows the empty state instead of a table when there are no rows", () => {
    render(
      <DataTable
        caption="Members"
        columns={COLUMNS}
        rows={[]}
        rowKey={(member) => member.id}
        empty={{ title: "No members yet", description: "Invite someone to get started." }}
      />,
    );
    expect(screen.getByText("No members yet")).toBeTruthy();
    expect(screen.getByText("Invite someone to get started.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("pages through rows with focusable previous and next controls", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={many(23)} rowKey={(member) => member.id} pageSize={10} />);
    const pages = screen.getByRole("navigation", { name: "Members" });
    const previous = within(pages).getByRole("button", { name: "Previous" });
    const next = within(pages).getByRole("button", { name: "Next" });

    expect(rowNames()).toHaveLength(10);
    expect(within(pages).getByText("Showing 1–10 of 23")).toBeTruthy();
    expect(within(pages).getByText("Page 1 of 3")).toBeTruthy();
    expect(previous.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(next);
    expect(rowNames()[0]).toBe("Member 11");
    expect(within(pages).getByText("Showing 11–20 of 23")).toBeTruthy();

    fireEvent.click(next);
    expect(rowNames()).toEqual(["Member 21", "Member 22", "Member 23"]);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(next);
    expect(within(pages).getByText("Page 3 of 3")).toBeTruthy();

    fireEvent.click(previous);
    expect(within(pages).getByText("Page 2 of 3")).toBeTruthy();
  });

  it("returns to the first page when the sort changes", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={many(23)} rowKey={(member) => member.id} />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(within(table()).getByRole("button", { name: "Amount" }));
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();
  });

  it("shows every row when pageSize is Infinity", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={many(23)} rowKey={(member) => member.id} pageSize={Infinity} />);
    expect(rowNames()).toHaveLength(23);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("hides the pagination when everything fits on one page", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={FEW} rowKey={(member) => member.id} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("shows placeholder rows and announces loading", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={FEW} rowKey={(member) => member.id} loading />);
    expect(screen.getByRole("status").textContent).toBe("Loading");
    expect(within(table()).queryAllByRole("rowheader")).toHaveLength(0);
    expect(screen.getByRole("status").parentElement?.getAttribute("aria-busy")).toBe("true");
  });

  it("lists each row as a card with labelled details for small screens", () => {
    render(<DataTable caption="Members" columns={COLUMNS} rows={FEW} rowKey={(member) => member.id} />);
    const cards = within(screen.getByRole("list", { name: "Members" })).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    const first = cards[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      return;
    }
    expect(within(first).getByText("Amount").tagName).toBe("DT");
    expect(within(first).getByRole("button", { name: "Edit Charlie" })).toBeTruthy();
  });
});
