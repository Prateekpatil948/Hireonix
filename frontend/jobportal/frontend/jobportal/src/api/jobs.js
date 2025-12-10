import axiosClient from "./axiosClient";

export const saveJob = (job_id) => {
    return axiosClient.post("saved/add/", { job_id });
};

export const unsaveJob = (job_id) => {
    return axiosClient.delete(`saved/remove/${job_id}/`);
};

export const getSavedJobs = () => {
    return axiosClient.get("saved/");
};
