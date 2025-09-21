"use client";

import { useEffect, useTransition } from "react";

import { markFirstVisit } from "../actions";

export function FirstVisitSetter() {
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void markFirstVisit();
    });
  }, []);

  return null;
}
