const timeToMinutes = (time) => {
    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;
};


const minutesToTime = (minutes) => {
    const hrs = String(
        Math.floor(minutes / 60)
    ).padStart(2, "0");

    const mins = String(
        minutes % 60
    ).padStart(2, "0");

    return `${hrs}:${mins}`;
};


const generateSlots = (
    startTime,
    endTime,
    slotDuration
) => {
    const slots = [];

    let start = timeToMinutes(startTime);

    const end = timeToMinutes(endTime);

    while (start + slotDuration <= end) {
        slots.push({
            startTime: minutesToTime(start),
            endTime: minutesToTime(
                start + slotDuration
            )
        });

        start += slotDuration;
    }

    return slots;
};

export default generateSlots;