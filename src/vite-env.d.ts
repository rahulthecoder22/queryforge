/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** HTTPS URL of a JSON pack `{ "topics": InterviewTopic[] }` you host (CORS enabled). Optional. */
  readonly VITE_INTERVIEW_GUIDE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
