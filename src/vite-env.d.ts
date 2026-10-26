/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Adres van de API. Leeg laten tijdens ontwikkelen: dan stuurt de
   * Vite-server /api door naar localhost:3000 en is er geen CORS nodig.
   * In productie staat hier https://schapserv.web4ever.nl.
   */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
