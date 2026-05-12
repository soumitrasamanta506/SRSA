import DoctorAvailability from "../models/DoctorAvailability.js";
import timeToMinutes from "../utils/timeToMinutes.js";

export const validateAvailabilityOverlap = async ({
    doctorId,
    dayOfWeek,
    startTime,
    endTime,
    excludeId = null
}) => {

    const existingAvailability = await DoctorAvailability.find({
            doctorId,
            dayOfWeek,
            ...(excludeId && {
                _id: { $ne: excludeId }
            })
        });

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    if (newStart >= newEnd) {
        throw new Error("Invalid time range");
    }

    for (const slot of existingAvailability) {

        const existingStart =
            timeToMinutes(slot.startTime);

        const existingEnd =
            timeToMinutes(slot.endTime);

        const isOverlapping =
            newStart < existingEnd &&
            newEnd > existingStart;

        if (isOverlapping) {
            throw new Error(
                "Availability overlaps with existing schedule"
            );
        }
    }
};