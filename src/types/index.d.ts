declare global {
  type JsonLd<TType extends string = string> = {
    "@context": "https://schema.org";
    "@type": TType;
    [key: string]: unknown;
  };

  interface WindowEventMap {
    "auth-modal:open": CustomEvent<{ mode: "login" | "register" }>;
  }
}

export {};