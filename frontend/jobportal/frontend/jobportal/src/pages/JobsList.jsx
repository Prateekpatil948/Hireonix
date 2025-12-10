// src/pages/JobsList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import JobCard from "../components/JobCard";
import { getSavedJobs } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "../components/PaginationControls";

const JobsList = () => {
    const { isAuthenticated, user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        location: "",
        jobType: "",
    });

    // Pagination
    const [page, setPage] = useState(1);
    const JOBS_PER_PAGE = 4;

    const fetchJobs = async (opts = {}) => {
        const { withLoading = true } = opts;
        if (withLoading) setLoading(true);
        setError("");

        try {
            const params = {};

            if (filters.search.trim()) params.search = filters.search.trim();
            if (filters.location.trim()) params.location = filters.location.trim();
            if (filters.jobType.trim()) params.job_type = filters.jobType.trim();

            // 1) Get all jobs
            const jobsRes = await axiosClient.get("jobs/", { params });
            let jobsData = jobsRes.data;

            // 2) If candidate logged in, mark already-saved jobs
            const isCandidate = isAuthenticated && user?.role === "candidate";

            if (isCandidate) {
                const savedRes = await getSavedJobs();
                const savedJobIds = new Set(
                    savedRes.data
                        .map((item) => item.job?.id)
                        .filter((id) => id !== undefined && id !== null)
                );

                jobsData = jobsData.map((job) => ({
                    ...job,
                    is_saved: savedJobIds.has(job.id),
                }));
            }

            setJobs(jobsData);
            setPage(1); // reset to first page whenever jobs are re-fetched
        } catch (err) {
            console.error("Error loading jobs:", err.response?.data || err);
            setError("Could not load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleClear = () => {
        setFilters({
            search: "",
            location: "",
            jobType: "",
        });
        setPage(1);
        fetchJobs({ withLoading: true });
    };

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE) || 1;
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const currentJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

    return (
        <div className="jobs-page">
            <div className="jobs-container">
                <div className="jobs-header">
                    <div>
                        <h2 className="jobs-title">Job Listings</h2>
                        <p className="jobs-subtitle">
                            Browse and filter the latest opportunities posted by recruiters.
                        </p>
                    </div>
                </div>

                {/* Compact filter bar */}
                <form onSubmit={handleSubmit} className="jobs-filter-bar">
                    <div className="filter-item filter-item-wide">
                        <label className="form-label">Search</label>
                        <input
                            className="input"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Job title, keyword, company"
                        />
                    </div>

                    <div className="filter-item">
                        <label className="form-label">Location</label>
                        <input
                            className="input"
                            name="location"
                            value={filters.location}
                            onChange={handleChange}
                            placeholder="e.g. Bangalore"
                        />
                    </div>

                    <div className="filter-item">
                        <label className="form-label">Job Type</label>
                        <input
                            className="input"
                            name="jobType"
                            value={filters.jobType}
                            onChange={handleChange}
                            placeholder="e.g. Full-time, Internship"
                        />
                    </div>

                    <div className="filter-actions">
                        <button
                            className="btn btn-outline"
                            type="button"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                        <button className="btn btn-primary" type="submit">
                            {loading ? "Filtering..." : "Filter"}
                        </button>
                    </div>
                </form>

                {loading && !error && <p>Loading jobs...</p>}

                {error && (
                    <p style={{ color: "red", fontSize: 13, marginTop: 4 }}>{error}</p>
                )}

                {!loading && !error && (
                    <>
                        <div className="job-list job-list-compact">
                            {jobs.length === 0 ? (
                                <p>No jobs found for the selected filters.</p>
                            ) : (
                                currentJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))
                            )}
                        </div>

                        {jobs.length > 0 && (
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JobsList;
