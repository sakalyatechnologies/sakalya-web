import { createContext, useContext, type MouseEventHandler, type ReactNode } from "react";

/** The props the library gives every link it renders. */
export interface LinkProps {
  href: string;
  className?: string | undefined;
  children?: ReactNode;
  "aria-current"?: "page" | undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}

/**
 * Renders a link with the app's router, for example
 * `({ href, ...props }) => <RouterLink to={href} {...props} />`. It is called rather than
 * mounted, so it can be written inline without remounting links on every render.
 */
export type RenderLink = (props: LinkProps) => ReactNode;

const LinkContext = createContext<RenderLink | null>(null);

export interface LinkProviderProps {
  renderLink: RenderLink;
  children: ReactNode;
}

/** Makes every library link inside it render through `renderLink`, so navigation stays in the app. */
export function LinkProvider({ renderLink, children }: LinkProviderProps) {
  return <LinkContext value={renderLink}>{children}</LinkContext>;
}

/** A link rendered by the nearest `LinkProvider`, or a plain anchor. */
export function Link(props: LinkProps) {
  const renderLink = useContext(LinkContext);
  return renderLink === null ? <a {...props} /> : renderLink(props);
}
