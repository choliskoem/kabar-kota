import type { UserRole } from "@/types/domain";

export function canWrite(role: UserRole): boolean {
  return role === "writer" || role === "editor" || role === "admin";
}

export function canPublish(role: UserRole): boolean {
  return role === "editor" || role === "admin";
}
