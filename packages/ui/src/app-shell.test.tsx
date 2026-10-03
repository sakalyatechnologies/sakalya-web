import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell, CardLink, type AppShellProps, type LinkProps } from "./index.js";

afterEach(cleanup);

const NAV: AppShellProps["nav"] = [
  { id: "home", label: "Home", icon: <span />, href: "#home" },
  { id: "reports", label: "Reports", icon: <span />, href: "#reports" },
];

function Shell(props: Partial<AppShellProps>) {
  return (
    <AppShell brand={<span>Brand</span>} nav={NAV} activeId="home" {...props}>
      <p>Page content</p>
      <CardLink href="#all">View all</CardLink>
    </AppShell>
  );
}

describe("AppShell", () => {
  it("starts with a skip link that moves focus to the page content", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(document.activeElement).toBe(skip);
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("main"));
  });

  it("renders navigation and library links with the app's router link", () => {
    // Stands in for a router's link, which takes `to` instead of `href`.
    function RouterLink({ to, ...rest }: Omit<LinkProps, "href"> & { to: string }) {
      return <a href={`/app/${to.slice(1)}`} {...rest} />;
    }
    render(<Shell renderLink={({ href, ...props }) => <RouterLink to={href} {...props} />} />);
    expect(screen.getByRole("link", { name: "Reports" }).getAttribute("href")).toBe("/app/reports");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "View all" }).getAttribute("href")).toBe("/app/all");
  });

  it("opens the navigation in a drawer from the menu button and closes it after navigating", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    const navigation = within(drawer).getByRole("navigation", { name: "Main" });
    expect(within(navigation).getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
    await user.click(within(navigation).getByRole("link", { name: "Reports" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows a labelled search field only when the product handles search", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<Shell onSearch={onSearch} searchPlaceholder="Search records" />);
    await user.type(screen.getByRole("searchbox", { name: "Search records" }), "ab");
    expect(onSearch).toHaveBeenLastCalledWith("ab");
    rerender(<Shell />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});
