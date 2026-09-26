/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_HOSPITAL_A_API_KEY?: string;
  readonly VITE_HOSPITAL_B_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
