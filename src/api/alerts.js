// src/api/alerts.js
import axiosClient from "./axiosClient";

// ------------------------
// JOB ALERTS (rules user creates)
// ------------------------

export const fetchAlerts = () => axiosClient.get("/alerts/");

export const createAlert = (data) => axiosClient.post("/alerts/", data);

export const updateAlert = (id, data) =>
  axiosClient.put(`/alerts/${id}/`, data);

export const deleteAlert = (id) =>
  axiosClient.delete(`/alerts/${id}/`);

// ------------------------
// JOB ALERT NOTIFICATIONS
// (when a new job matches a saved alert)
// ------------------------

export const fetchJobNotifications = () =>
  axiosClient.get("/alerts/notifications/");

export const markJobNotificationRead = (id) =>
  axiosClient.patch(`/alerts/notifications/${id}/read/`, {});

// ------------------------
// APPLICATION STATUS NOTIFICATIONS
// (emails mirrored into DB)
// ------------------------

export const fetchApplicationStatusNotifications = () =>
  axiosClient.get("/alerts/application-status/");

export const markApplicationStatusNotificationRead = (id) =>
  axiosClient.patch(`/alerts/application-status/${id}/read/`, {});
