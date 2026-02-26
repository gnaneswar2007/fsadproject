// ─── Client-side export utilities (CSV / JSON / PDF) ─────────────────────────

/**
 * Download a file in the browser.
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Export an array of objects as a CSV file.
 * @param {Object[]} data  - array of flat objects
 * @param {string}   filename - e.g. "donations.csv"
 * @param {string[]} [columns] - optional ordered list of keys to include
 */
export function exportCSV(data, filename = "export.csv", columns) {
    if (!data.length) return;
    const keys = columns || Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map((row) =>
        keys
            .map((k) => {
                const val = row[k] ?? "";
                // Wrap in quotes if the value contains commas or newlines
                const str = String(val);
                return str.includes(",") || str.includes("\n") || str.includes('"')
                    ? `"${str.replace(/"/g, '""')}"`
                    : str;
            })
            .join(",")
    );
    const csv = [header, ...rows].join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

/**
 * Export an array of objects as a JSON file.
 * @param {Object[]} data
 * @param {string}   filename
 */
export function exportJSON(data, filename = "export.json") {
    const json = JSON.stringify(data, null, 2);
    downloadBlob(new Blob([json], { type: "application/json" }), filename);
}

/**
 * Export the current page (or a specific element) as a PDF via the browser print dialog.
 * @param {string} [title] - document title shown in the print dialog
 */
export function exportPDF(title = "Export") {
    const prev = document.title;
    document.title = title;
    window.print();
    document.title = prev;
}
