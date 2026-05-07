"use client";

import { createClient } from "@/lib/supabase/browser";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      supabase.from("page_views").insert({
        path: pathname,
        viewer_id: data.user?.id ?? null
      });
    });
  }, [pathname]);

  return null;
}
