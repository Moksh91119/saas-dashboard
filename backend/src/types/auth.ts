export type AuthUser = {
  id: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  email: string;
};
