import { Download, FileText, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { exportCSV, exportJSON, exportPDF } from "@/lib/export-utils";

/**
 * Reusable export dropdown for CSV / JSON / PDF.
 * @param {{ data: Object[], filename: string, pdfTitle?: string }} props
 */
export function ExportMenu({ data, filename = "export", pdfTitle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const items = [
        { label: "Export CSV", icon: FileSpreadsheet, action: () => exportCSV(data, `${filename}.csv`) },
        { label: "Export JSON", icon: FileJson, action: () => exportJSON(data, `${filename}.json`) },
        { label: "Export PDF", icon: FileText, action: () => exportPDF(pdfTitle || filename) },
    ];

    return (
        <div className="relative" ref={ref}>
            <Button variant="outline" size="sm" onClick={() => setOpen(!open)} disabled={!data.length}>
                <Download className="mr-2 h-4 w-4" />Export
            </Button>
            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border bg-card shadow-medium py-1 animate-in fade-in-0 zoom-in-95">
                    {items.map(({ label, icon: Icon, action }) => (
                        <button
                            key={label}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                            onClick={() => { action(); setOpen(false); }}
                        >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
