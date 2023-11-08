import React, { useState } from 'react';
import { Timeline, TimeRange } from "@/app/utils/types";

export default function TimelineSelector({ name, onTimelineChange }: { name: string, onTimelineChange: Function }) {
    const [values, setValues] = useState<{
        timeline: Timeline,
        timeRange: TimeRange
    }>({
        timeline: "1y",
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
        <div className="lg:flex py-2">
            <div className="lg:w-1/2 mb-2 lg:mb-0 flex justify-center">
                <h3 className="mr-2">Timeline:</h3>
                <div className="flex items-center">
                    <select className="form-select"
                        value={values.timeline}
                        onChange={(e) => handleInputChange("timeline", e.target.value)}
                    >
                        <option value="1w">Last Week</option>
                        <option value="1m">Last Month</option>
                        <option value="1y">Last Year</option>
                        <option value="full">All</option>
                    </select>
                </div>
            </div>

            <div className="lg:w-1/2 flex justify-center">
                <h3 className="mr-2">Group by:</h3>
                <div className="flex items-center">
                    <select className="form-select"
                        value={values.timeRange}
                        onChange={(e) => handleInputChange("timeRange", e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
