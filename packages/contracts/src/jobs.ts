export interface VideoSyncJob {
  bunnyVideoId: string;
  requestedBy: string;
}

export interface NotificationJob {
  kind: "live-session-reminder" | "admin-alert";
  audience: string;
}
