export const APP_NAME = "SPDF Teachers Portal";
export const APP_SHORT_NAME = "SPDF ERP";
export const SCHOOL_NAME = "SPDF International School";
export const ACADEMIC_YEAR_LABEL = "2026–27";

export const FIXTURE_EMAIL = "meera.iyer@spdf.school";
export const FIXTURE_PASSWORD = "password123";

export function getDataSource(): "mock" | "api" {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? "api" : "mock";
}

export function getPortalPhase(): 1 | 2 | 3 {
  const value = process.env.NEXT_PUBLIC_PORTAL_PHASE;
  if (value === "2" || value === "3") return Number(value) as 2 | 3;
  return 1;
}

export function isApiMode() {
  return getDataSource() === "api";
}
