import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);
export const applicationSchema = z.object({
  intent: z.enum(["membership", "registrar"]),
  name: text(160),
  email: z.string().trim().email().max(254),
  address: text(500),
  cell: text(40),
  cnic: text(80),
  passport: z.string().trim().max(80).default(""),
  barLicense: text(200),
  parentBar: text(200),
  message: z.string().trim().max(5000).default(""),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export const statuses = [
  "pending",
  "reviewing",
  "approved",
  "rejected",
] as const;
export const statusSchema = z.object({ status: z.enum(statuses) });
export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationStatus = (typeof statuses)[number];
export interface ApplicationSummary {
  id: string;
  reference: string;
  name: string;
  email: string;
  intent: "membership" | "registrar";
  status: ApplicationStatus;
  createdAt: string;
}
export interface ApplicationDetail extends ApplicationSummary {
  address: string;
  cell: string;
  cnic: string;
  passport: string;
  barLicense: string;
  parentBar: string;
  message: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
