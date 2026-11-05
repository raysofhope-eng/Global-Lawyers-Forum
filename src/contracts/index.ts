import { z } from "zod";
const text = (max: number, min = 1) =>
  z.string().trim().min(min, "This field is required.").max(max);
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(72)
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be at most 72 bytes.",
  )
  .regex(/\p{L}/u, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");
export const applicationSchema = z.object({
  intent: z.enum(["membership", "registrar"]),
  name: text(160, 2).regex(
    /^[\p{L}\p{M} .'-]+$/u,
    "Enter your full name using letters.",
  ),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254)
    .toLowerCase(),
  address: text(500, 5),
  cell: text(40)
    .regex(/^\+?[\d ()-.]+$/, "Enter a valid phone number.")
    .refine((v) => {
      const count = v.replace(/\D/g, "").length;
      return count >= 7 && count <= 15;
    }, "Use 7 to 15 phone digits."),
  cnic: text(80, 4),
  passport: text(80, 4),
  barLicense: text(200, 3),
  parentBar: text(200, 3),
  message: text(5000),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export const registrationSchema = applicationSchema
  .extend({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export const profileSchema = applicationSchema.omit({
  intent: true,
  consent: true,
  website: true,
});
export const statuses = [
  "pending",
  "reviewing",
  "approved",
  "rejected",
  "suspended",
] as const;
export const statusSchema = z.object({ status: z.enum(statuses) });
export const loginSchema = z.object({
  email: z.string().trim().email().max(254).toLowerCase(),
  password: z.string().min(1).max(200),
});
export const certificateTypes = ["appointment", "notification"] as const;
export type CertificateType = (typeof certificateTypes)[number];
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value,
    "Choose a valid date.",
  );
export const membershipSchema = z
  .object({
    status: z.enum(statuses),
    designation: z.string().trim().max(120),
    effectiveDate: dateSchema.nullable(),
  })
  .refine(
    (v) => !v.designation || (v.designation.length >= 2 && !!v.effectiveDate),
    {
      path: ["effectiveDate"],
      message: "Set an effective date when assigning a designation.",
    },
  );
export const certificateIssueSchema = z.object({
  type: z.enum(certificateTypes),
  previewHash: z.string().regex(/^[a-f\d]{64}$/),
  idempotencyKey: z.string().uuid(),
});
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export interface SessionUser {
  id: string;
  email: string;
  role: "admin" | "member";
  applicationId: string | null;
}
export interface CertificateSummary {
  id: string;
  type: CertificateType;
  version: number;
  name: string;
  designation: string;
  effectiveDate: string;
  issuedAt: string;
  revokedAt: string | null;
  downloadUrl: string;
}
export interface CertificateDraft {
  type: CertificateType;
  title: string;
  previewUrl: string;
  canIssue: boolean;
  reason: string | null;
}
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
  designation: string;
  effectiveDate: string | null;
  lastLoginAt?: string | null;
  hasAccount?: boolean;
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
export interface EventImage {
  id: string;
  eventId: string;
  altText: string | null;
  position: number;
}
export interface EventTopic {
  id?: string;
  title: string;
  description: string | null;
}
export interface EventAgendaItem {
  id?: string;
  startsAt: string;
  endsAt: string;
  title: string;
  description: string | null;
  location: string | null;
}
export interface EventSpeaker {
  id?: string;
  name: string;
  designation: string | null;
  organization: string | null;
  bio: string | null;
}
export interface MemberEvent {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string | null;
  category: string | null;
  theme: string | null;
  organizer: string | null;
  format: "physical" | "online" | "hybrid";
  onlineUrl?: string | null;
  objectives: string | null;
  startsAt: string;
  endsAt: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  feeCents: number;
  capacity: number | null;
  status: "draft" | "published" | "cancelled";
  hasImage?: boolean;
  images: EventImage[];
  topics: EventTopic[];
  agenda: EventAgendaItem[];
  speakers: EventSpeaker[];
}
export interface EventBooking {
  id: string;
  eventId: string;
  status: "pending" | "paid" | "refunded" | "cancelled";
  feeCents: number;
  currency: string;
  invitationCode: string | null;
  event: MemberEvent;
}
