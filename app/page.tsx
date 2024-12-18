'use client';
import ResultsTable from '@/components/ResultsTable';
import { useState } from 'react';

interface OverlapResult {
    error_type: string;
    feature_id: number;
    geometry: string;
    overlap_percentage: number;
    total_overlap_area_m2: number;
    original_area_m2: number;
    overlapping_with: number[];
    remarks: string;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: OverlapResult[];
}

export default function CheckOverlap() {
    const [results, setResults] = useState<OverlapResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('geojson', file);

        try {
            const response = await fetch(
                'https://refactor-api-geo.fly.dev/check_overlap',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            if (data.status) {
                setResults(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-8 text-center">
                Check GeoJSON Overlap
            </h1>

            {/* File Upload Component */}
            <div className="max-w-2xl mx-auto mb-8">
                <input
                    type="file"
                    accept=".geojson"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Processing...</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-center py-4">{error}</div>
            )}

            {/* Results Table */}
            {results && <ResultsTable results={results} />}
        </div>
    );
}
