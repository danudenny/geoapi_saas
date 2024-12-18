interface StatisticsProps {
    results: Array<{
        error_type: string;
        overlap_percentage: number;
        total_overlap_area_m2: number;
        original_area_m2: number;
    }>;
}

export default function StatisticsCards({ results }: StatisticsProps) {
    // Calculate statistics
    const totalFeatures = results.length;
    const majorOverlaps = results.filter(
        (r) => r.error_type === 'major_overlap'
    ).length;
    const minorOverlaps = results.filter(
        (r) => r.error_type === 'minor_overlap'
    ).length;

    const avgOverlapPercentage =
        results.reduce((acc, curr) => acc + curr.overlap_percentage, 0) /
        totalFeatures;

    const totalOverlapArea = results.reduce(
        (acc, curr) => acc + curr.total_overlap_area_m2,
        0
    );

    const totalOriginalArea = results.reduce(
        (acc, curr) => acc + curr.original_area_m2,
        0
    );

    const cards = [
        {
            title: 'Total Features',
            value: totalFeatures,
            description: 'Total number of overlapping features',
            color: 'blue',
        },
        {
            title: 'Major Overlaps',
            value: majorOverlaps,
            description: 'Features with >20% overlap',
            color: 'red',
        },
        {
            title: 'Minor Overlaps',
            value: minorOverlaps,
            description: 'Features with ≤20% overlap',
            color: 'yellow',
        },
        {
            title: 'Average Overlap',
            value: `${avgOverlapPercentage.toFixed(2)}%`,
            description: 'Average overlap percentage',
            color: 'green',
        },
        {
            title: 'Total Overlap Area',
            value: `${(totalOverlapArea / 10000).toFixed(2)} ha`,
            description: 'Sum of all overlap areas',
            color: 'purple',
        },
        {
            title: 'Total Original Area',
            value: `${(totalOriginalArea / 10000).toFixed(2)} ha`,
            description: 'Sum of all original areas',
            color: 'indigo',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`p-5 bg-white rounded-lg shadow-sm border border-gray-100 ${
                        {
                            blue: 'hover:border-blue-200',
                            red: 'hover:border-red-200',
                            yellow: 'hover:border-yellow-200',
                            green: 'hover:border-green-200',
                            purple: 'hover:border-purple-200',
                            indigo: 'hover:border-indigo-200',
                        }[card.color]
                    } transition-colors`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className={`text-sm font-medium ${
                                    {
                                        blue: 'text-blue-600',
                                        red: 'text-red-600',
                                        yellow: 'text-yellow-600',
                                        green: 'text-green-600',
                                        purple: 'text-purple-600',
                                        indigo: 'text-indigo-600',
                                    }[card.color]
                                }`}
                            >
                                {card.title}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {card.value}
                            </p>
                        </div>
                        <div
                            className={`p-2.5 rounded-lg ${
                                {
                                    blue: 'bg-blue-50',
                                    red: 'bg-red-50',
                                    yellow: 'bg-yellow-50',
                                    green: 'bg-green-50',
                                    purple: 'bg-purple-50',
                                    indigo: 'bg-indigo-50',
                                }[card.color]
                            }`}
                        >
                            {getIcon(card.color)}
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {card.description}
                    </p>
                </div>
            ))}
        </div>
    );
}

function getIcon(color: string) {
    const className = `h-6 w-6 ${
        {
            blue: 'text-blue-600',
            red: 'text-red-600',
            yellow: 'text-yellow-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
            indigo: 'text-indigo-600',
        }[color]
    }`;

    const icons = {
        blue: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
        red: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        yellow: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        green: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
        purple: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
        indigo: (
            <svg
                className={className}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
            </svg>
        ),
    };

    return icons[color as keyof typeof icons];
}
