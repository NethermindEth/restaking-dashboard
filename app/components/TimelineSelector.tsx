import React, { useState } from 'react';
import { Timeline, TimeRange } from "@/app/utils/types";

export default function TimelineSelector({ name, onTimelineChange }: {name: string, onTimelineChange: Function}) {
    const [values, setValues] = useState<{
        timeline: Timeline,
        timeRange: TimeRange
    }>({
        timeline: "1m",
        timeRange: "daily",
    });

    const handleInputChange = (field: string, value: string) => {
        setValues((prevValues) => ({
            ...prevValues,
            [field]: value,
        }));
        onTimelineChange(name, { ...values, [field]: value });
    };

    return (
        <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
            <h2 className="mr-2">Timeline:</h2>
            <div className="form-group mr-4">
                <select
                    className="form-control"
                    value={values.timeline}
                    onChange={(e) => handleInputChange("timeline", e.target.value)}
                >
                    <option value="1w">Last Week</option>
                    <option value="1m">Last Month</option>
                    <option value="1y">Last Year</option>
                    <option value="full">Full</option>
                </select>
            </div>
            <h2 className="mr-2">Group By:</h2>
            <div className="form-group">
                <select
                    className="form-control"
                    value={values.timeRange}
                    onChange={(e) => handleInputChange("timeRange", e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
        </div>
    );
};
