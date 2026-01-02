import axiosClient from "./axiosClient";

// Total unread = job notifications + application notifications
export const fetchUnreadNotificationCount = async () => {
  const [jobRes, appRes] = await Promise.all([
    axiosClient.get("alerts/job-notifications/"),
    axiosClient.get("alerts/application-status-notifications/"),
  ]);

  const unreadJobs = jobRes.data.filter((n) => !n.is_read).length;
  const unreadApps = appRes.data.filter((n) => !n.is_read).length;

  return unreadJobs + unreadApps;
};
