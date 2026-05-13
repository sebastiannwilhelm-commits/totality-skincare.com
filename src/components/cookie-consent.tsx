"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

const KEY = "totality-cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:p-5">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies on our website to give you the very best shopping experience we can. By using
          this site, you agree to its use of cookies.
        </p>
        <Button
          type="button"
          variant="blush"
          className="shrink-0 sm:ml-4"
          onClick={() => {
            try {
              window.localStorage.setItem(KEY, "1");
            } catch {
              /* ignore */
            }
            setVisible(false);
          }}
        >
          OK, got it!
        </Button>
      </div>
    </div>
  );
}
