// src/components/PaginationControls.jsx
export default function PaginationControls({
    page,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const goPrev = () => {
        if (page > 1) onPageChange(page - 1);
    };

    const goNext = () => {
        if (page < totalPages) onPageChange(page + 1);
    };

    return (
        <div
            style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
            }}
        >
            <span style={{ color: "#6b7280" }}>
                Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={page === 1}
                    style={{
                        padding: "3px 8px",
                        fontSize: 12,
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        background: page === 1 ? "#f9fafb" : "#ffffff",
                        cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                >
                    Prev
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    disabled={page === totalPages}
                    style={{
                        padding: "3px 8px",
                        fontSize: 12,
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        background:
                            page === totalPages ? "#f9fafb" : "#ffffff",
                        cursor:
                            page === totalPages ? "not-allowed" : "pointer",
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
