/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    MapIcon,
} from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from './MapView';
import StatisticsCards from './StatisticsCards';

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

interface SelectedItems {
    [key: number]: boolean;
}

interface FilterOptions {
    error_type: string;
    feature_id: string;
}

interface GeoJSONFeature {
    type: 'Feature';
    geometry: GeoJSONGeometry;
    properties?: Record<string, any>;
}

interface GeoJSONGeometry {
    type: string;
    coordinates: number[][] | number[][][] | number[][][][];
}

interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

const tableHeaders = [
    'Feature ID',
    'Error Type',
    'Overlap %',
    'Total Overlap Area (m²)',
    'Original Area (m²)',
    'Overlapping With',
    'Actions',
];

export default function ResultsTable({
    results,
}: {
    results: OverlapResult[];
}) {
    const [displayedResults, setDisplayedResults] = useState<OverlapResult[]>(
        []
    );
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<FilterOptions>({
        error_type: '',
        feature_id: '',
    });
    const [filteredResults, setFilteredResults] = useState<OverlapResult[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 10;

    const [selectedGeometry, setSelectedGeometry] = useState<string | null>(
        null
    );

    const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
    const [showMap, setShowMap] = useState<boolean>(false);
    const [mapViewType, setMapViewType] = useState<
        'selected' | 'filtered' | 'all'
    >('all');

    // Apply filters
    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        if (startIndex < filteredResults.length) {
            const newItems = filteredResults.slice(startIndex, endIndex);
            setDisplayedResults((prev) => [...prev, ...newItems]);
            setPage(nextPage);
        }
    }, [page, filteredResults, ITEMS_PER_PAGE]);

    // Update the scroll handler
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const threshold = 50; // Adjust this value as needed

            if (scrollHeight - (scrollTop + clientHeight) < threshold) {
                loadMore();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    // Update the filter effect to properly reset pagination
    useEffect(() => {
        let filtered = [...results];

        if (filters.error_type) {
            filtered = filtered.filter(
                (result) => result.error_type === filters.error_type
            );
        }

        if (filters.feature_id) {
            filtered = filtered.filter((result) =>
                result.feature_id.toString().includes(filters.feature_id)
            );
        }

        setFilteredResults(filtered);
        setPage(1);
        setDisplayedResults(filtered.slice(0, ITEMS_PER_PAGE));
    }, [filters, results, ITEMS_PER_PAGE]);

    // Modify the getMapGeoJSON function
    const getMapGeoJSON = useCallback(() => {
        let featuresToShow: OverlapResult[] = [];

        switch (mapViewType) {
            case 'selected':
                featuresToShow = results.filter(
                    (result) => selectedItems[result.feature_id]
                );
                break;
            case 'filtered':
                featuresToShow = filteredResults;
                break;
            case 'all':
                featuresToShow = results;
                break;
        }

        // Create proper GeoJSON structure
        return {
            type: 'FeatureCollection',
            features: featuresToShow.map((result) => {
                const geometryData =
                    typeof result.geometry === 'string'
                        ? JSON.parse(result.geometry)
                        : result.geometry;

                const geometry =
                    geometryData.type === 'Feature'
                        ? geometryData.geometry
                        : geometryData.type === 'FeatureCollection'
                        ? geometryData.features[0].geometry
                        : geometryData;

                return {
                    type: 'Feature',
                    properties: {
                        feature_id: result.feature_id,
                        error_type: result.error_type,
                        overlap_percentage: result.overlap_percentage,
                    },
                    geometry: geometry,
                };
            }),
        };
    }, [results, filteredResults, selectedItems, mapViewType]);
    // Handle select all checkbox
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const newSelected: SelectedItems = {};
        displayedResults.forEach((result) => {
            newSelected[result.feature_id] = isChecked;
        });
        setSelectedItems(newSelected);
    };

    // Handle individual checkbox
    const handleSelect = (feature_id: number) => {
        setSelectedItems((prev) => ({
            ...prev,
            [feature_id]: !prev[feature_id],
        }));
    };

    return (
        <div className="flex flex-col space-y-3 font-display">
            {/* Statistics Cards */}
            <StatisticsCards results={results} />

            {/* Map Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => {
                            setMapViewType('all');
                            setShowMap(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        View All on Map
                    </button>
                    <button
                        onClick={() => {
                            setMapViewType('filtered');
                            setShowMap(true);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                        View Filtered on Map
                    </button>
                    <button
                        onClick={() => {
                            setMapViewType('selected');
                            setShowMap(true);
                        }}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                        disabled={
                            Object.values(selectedItems).filter(Boolean)
                                .length === 0
                        }
                    >
                        View Selected on Map
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Error Type
                        </label>
                        <select
                            className="w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 text-sm
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={filters.error_type}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    error_type: e.target.value,
                                }))
                            }
                        >
                            <option value="">All Types</option>
                            <option value="major_overlap">Major Overlap</option>
                            <option value="minor_overlap">Minor Overlap</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Feature ID
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 text-sm
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Search by ID..."
                            value={filters.feature_id}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    feature_id: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
                    Showing {displayedResults.length} of{' '}
                    {filteredResults.length} results
                </div>
            </div>

            {/* Table */}
            <div
                ref={containerRef}
                className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white max-h-[600px]"
            >
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            {tableHeaders.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displayedResults.map((result) => (
                            <tr
                                key={result.feature_id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-2.5">
                                    <input
                                        type="checkbox"
                                        checked={
                                            !!selectedItems[result.feature_id]
                                        }
                                        onChange={() =>
                                            handleSelect(result.feature_id)
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {result.feature_id}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                                    <span
                                        className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-full ${
                                            result.error_type ===
                                            'major_overlap'
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-yellow-50 text-yellow-700'
                                        }`}
                                    >
                                        {result.error_type ===
                                        'major_overlap' ? (
                                            <>
                                                <ExclamationCircleIcon className="h-4 w-4" />
                                                <span>Major</span>
                                            </>
                                        ) : (
                                            <>
                                                <ExclamationTriangleIcon className="h-4 w-4" />
                                                <span>Minor</span>
                                            </>
                                        )}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-700">
                                    {result.overlap_percentage.toFixed(2)}%
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-700">
                                    {result.total_overlap_area_m2.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-700">
                                    {result.original_area_m2.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-700">
                                    {result.overlapping_with.join(', ')}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                                    <div className="relative group">
                                        <button
                                            onClick={() => {
                                                try {
                                                    // Parse the geometry string
                                                    const parsedGeometry =
                                                        JSON.parse(
                                                            result.geometry
                                                        ) as
                                                            | GeoJSONFeature
                                                            | GeoJSONFeatureCollection
                                                            | GeoJSONGeometry;

                                                    let featureCollection: GeoJSONFeatureCollection;

                                                    if (
                                                        parsedGeometry.type ===
                                                        'FeatureCollection'
                                                    ) {
                                                        // Already a FeatureCollection
                                                        featureCollection =
                                                            parsedGeometry as GeoJSONFeatureCollection;
                                                    } else if (
                                                        parsedGeometry.type ===
                                                        'Feature'
                                                    ) {
                                                        // Single Feature
                                                        featureCollection = {
                                                            type: 'FeatureCollection',
                                                            features: [
                                                                {
                                                                    ...(parsedGeometry as GeoJSONFeature),
                                                                    properties:
                                                                        {
                                                                            feature_id:
                                                                                result.feature_id,
                                                                            error_type:
                                                                                result.error_type,
                                                                            overlap_percentage:
                                                                                result.overlap_percentage,
                                                                        },
                                                                },
                                                            ],
                                                        };
                                                    } else {
                                                        // Raw geometry
                                                        featureCollection = {
                                                            type: 'FeatureCollection',
                                                            features: [
                                                                {
                                                                    type: 'Feature',
                                                                    properties:
                                                                        {
                                                                            feature_id:
                                                                                result.feature_id,
                                                                            error_type:
                                                                                result.error_type,
                                                                            overlap_percentage:
                                                                                result.overlap_percentage,
                                                                        },
                                                                    geometry:
                                                                        parsedGeometry as GeoJSONGeometry,
                                                                },
                                                            ],
                                                        };
                                                    }

                                                    setSelectedGeometry(
                                                        JSON.stringify(
                                                            featureCollection
                                                        )
                                                    );
                                                } catch (error) {
                                                    console.error(
                                                        'Error processing geometry:',
                                                        error
                                                    );
                                                }
                                            }}
                                            className="p-2 text-blue-600 hover:text-blue-800 rounded-full transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            <MapIcon className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-200" />
                                            <span className="sr-only">
                                                View on map
                                            </span>
                                        </button>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                            View on map
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Loading indicator */}
                {displayedResults.length < filteredResults.length && (
                    <div className="text-center py-4 border-t border-gray-100 bg-gray-50">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}

                {selectedGeometry && (
                    <MapView
                        geojsonData={selectedGeometry}
                        onClose={() => setSelectedGeometry(null)}
                    />
                )}
            </div>

            {showMap && (
                <MapView
                    geojsonData={JSON.stringify(getMapGeoJSON())}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
}
