export type UserRole = "ADMIN" | "MEMBER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type AuthResponse = {
  user: User;
  organization: Organization;
  token: string;
};

export type MeResponse = User & {
  organization: Organization;
};
