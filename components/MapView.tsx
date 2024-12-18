/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Globe, Layers, MapPin, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const BASEMAPS = {
    osm: {
        name: 'OpenStreetMap',
        thumbnail: 'https://tile.openstreetmap.org/12/2048/1360.png',
        style: {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors',
                },
            },
            layers: [
                {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
    },
    arcgis_street: {
        name: 'ArcGIS Street',
        thumbnail:
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/12/1360/2048',
        style: {
            version: 8,
            sources: {
                arcgis_street: {
                    type: 'raster',
                    tiles: [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                    ],
                    tileSize: 256,
                    attribution: '© Esri',
                },
            },
            layers: [
                {
                    id: 'arcgis_street',
                    type: 'raster',
                    source: 'arcgis_street',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
    },
    arcgis_satellite: {
        name: 'ArcGIS Satellite',
        thumbnail:
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/1360/2048',
        style: {
            version: 8,
            sources: {
                arcgis_satellite: {
                    type: 'raster',
                    tiles: [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    ],
                    tileSize: 256,
                    attribution: '© Esri',
                },
            },
            layers: [
                {
                    id: 'arcgis_satellite',
                    type: 'raster',
                    source: 'arcgis_satellite',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
    },
    cartodb_light: {
        name: 'CartoDB Light',
        thumbnail:
            'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/12/2048/1360.png',
        style: {
            version: 8,
            sources: {
                cartodb_light: {
                    type: 'raster',
                    tiles: [
                        'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                    ],
                    tileSize: 256,
                    attribution: '© CartoDB',
                },
            },
            layers: [
                {
                    id: 'cartodb_light',
                    type: 'raster',
                    source: 'cartodb_light',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
    },
    cartodb_dark: {
        name: 'CartoDB Dark',
        thumbnail:
            'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/12/2048/1360.png',
        style: {
            version: 8,
            sources: {
                cartodb_dark: {
                    type: 'raster',
                    tiles: [
                        'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                    ],
                    tileSize: 256,
                    attribution: '© CartoDB',
                },
            },
            layers: [
                {
                    id: 'cartodb_dark',
                    type: 'raster',
                    source: 'cartodb_dark',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
    },
};

interface MapViewProps {
    geojsonData: string;
    onClose: () => void;
}

export default function EnhancedMapView({
    geojsonData,
    onClose,
}: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [currentBasemap, setCurrentBasemap] = useState<string>('osm');
    const [showBasemapSelector, setShowBasemapSelector] =
        useState<boolean>(false);
    const [showLegend, setShowLegend] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!mapContainer.current) return;

        setIsLoading(true); // Start loading spinner

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            // @ts-expect-error TypeScript expects a stricter StyleSpecification type
            style: BASEMAPS[currentBasemap].style,
            center: [0, 0],
            zoom: 2,
        });

        map.current.addControl(new maplibregl.NavigationControl());

        try {
            const geojson = JSON.parse(geojsonData);

            map.current.on('load', () => {
                // Add GeoJSON data as a source
                map.current?.addSource('overlap-data', {
                    type: 'geojson',
                    data: geojson,
                });

                // Fill Layer
                map.current?.addLayer({
                    id: 'overlap-fill',
                    type: 'fill',
                    source: 'overlap-data',
                    paint: {
                        'fill-color': [
                            'match',
                            ['get', 'error_type'],
                            'major_overlap',
                            '#ef4444',
                            'minor_overlap',
                            '#eab308',
                            '#cccccc',
                        ],
                        'fill-opacity': 0.5,
                    },
                });

                // Outline Layer
                map.current?.addLayer({
                    id: 'overlap-outline',
                    type: 'line',
                    source: 'overlap-data',
                    paint: {
                        'line-color': '#222222',
                        'line-width': 1,
                    },
                });

                // Fit Bounds to Data
                const bounds = new maplibregl.LngLatBounds();
                geojson.features.forEach((feature: any) => {
                    if (feature.geometry && feature.geometry.coordinates) {
                        feature.geometry.coordinates[0].forEach(
                            (coord: number[]) => {
                                bounds.extend(coord as [number, number]);
                            }
                        );
                    }
                });

                map.current?.fitBounds(bounds, {
                    padding: 50,
                    duration: 1000,
                });

                setIsLoading(false); // Stop loading spinner
            });
        } catch (error) {
            console.error('Error parsing GeoJSON:', error);
            setIsLoading(false);
        }

        return () => {
            map.current?.remove();
        };
    }, [geojsonData, currentBasemap]);

    const changeBasemap = (basemapKey: string) => {
        setCurrentBasemap(basemapKey);
        setShowBasemapSelector(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex text-black">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-25">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600" />
                </div>
            )}

            {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full" />

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                <button
                    onClick={() => setShowBasemapSelector(!showBasemapSelector)}
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    title="Change Basemap"
                >
                    <Globe className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    title="Toggle Legend"
                >
                    <Layers className="w-6 h-6" />
                </button>
                <button
                    onClick={onClose}
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    title="Close Map"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Basemap Selector */}
            {showBasemapSelector && (
                <div className="absolute top-20 right-4 z-20 bg-white rounded-lg shadow-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(BASEMAPS).map(([key, basemap]) => (
                            <button
                                key={key}
                                onClick={() => changeBasemap(key)}
                                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                    currentBasemap === key
                                        ? 'border-2 border-blue-500'
                                        : ''
                                }`}
                            >
                                <Image
                                    src={basemap.thumbnail}
                                    alt={basemap.name}
                                    className="w-full h-24 object-cover rounded-md"
                                    width={256}
                                    height={256}
                                />
                                <span className="text-sm mt-1 block">
                                    {basemap.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            {showLegend && (
                <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" /> Overlap Types
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <div className="w-6 h-4 bg-red-500 mr-2 opacity-50" />
                            <span>Major Overlap</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-6 h-4 bg-yellow-500 mr-2 opacity-50" />
                            <span>Minor Overlap</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
