import axiosClient from "./axiosClient";

export const fetchAlerts = () => axiosClient.get("alerts/");
export const createAlert = (data) => axiosClient.post("alerts/", data);
export const updateAlert = (id, data) => axiosClient.put(`alerts/${id}/`, data);
export const deleteAlert = (id) => axiosClient.delete(`alerts/${id}/`);

export const fetchNotifications = () =>
    axiosClient.get("alerts/notifications/");

export const markNotificationRead = (id) =>
    axiosClient.patch(`alerts/notifications/${id}/read/`);
