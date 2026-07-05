"use client";

// Drop-in replacement for next/link's Link: same API, but every internal
// navigation is wrapped in the native View Transitions API (see
// lib/viewTransition) so pages cross-fade instead of hard-cutting. This is
// the officially documented way to intercept a Link click: Next calls the
// user-supplied onClick first, then bails out of its own navigation if the
// event was already defaultPrevented.

import NextLink, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { withViewTransition } from "@/lib/viewTransition";

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children?: React.ReactNode;
};

export default function Link({ href, onClick, children, ...rest }: Props) {
  const router = useRouter();

  return (
    <NextLink
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const url = typeof href === "string" ? href : href.pathname ?? "/";
        withViewTransition(() => router.push(url));
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
