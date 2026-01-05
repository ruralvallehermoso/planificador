import { NextRequest, NextResponse } from 'next/server';
import ical from 'node-ical';
import { RRule } from 'rrule';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        console.log(`Fetching calendar from: ${url}`);
        const events = await ical.async.fromURL(url);

        console.log(`Found ${Object.keys(events).length} raw items in iCal`);

        // Define expansion window (e.g., 2 months back to 1 year forward)
        const now = new Date();
        const rangeStart = new Date(now);
        rangeStart.setMonth(now.getMonth() - 2);
        const rangeEnd = new Date(now);
        rangeEnd.setFullYear(now.getFullYear() + 1);

        const calendarEvents: any[] = [];

        for (const [key, event] of Object.entries(events)) {
            // Only process VEVENTs
            if (event.type !== 'VEVENT') continue;

            const typedEvent = event as any;

            if (typedEvent.rrule) {
                // It's a recurring event
                // node-ical often parses rrule as an RRule object if it can, 
                // or we might need to rely on its properties.
                // NOTE: node-ical's parsed object usually has an `rrule` property which is NOT the RRule object itself 
                // but options? OR it uses the 'rrule' library internally.
                // Let's safe check .between method.

                try {
                    // Check if we need to hydrate RRule (sometimes node-ical output needs help)
                    // If .between is missing, it might be that we need to construct it?
                    // Usually node-ical returns an object with `rrule` property that IS the RRule object if parsed correctly.

                    if (typeof typedEvent.rrule.between === 'function') {
                        const dates = typedEvent.rrule.between(rangeStart, rangeEnd);

                        // Calculate duration
                        const duration = typedEvent.end.getTime() - typedEvent.start.getTime();

                        dates.forEach((date: Date) => {
                            // Check for overrides (recurrences)
                            // typedEvent.recurrences is dictionary keyed by date string (?)
                            // For MVP, we skip complex handling of overrides unless critical
                            // But usually we should check if this specific date was overridden.

                            // Create instance
                            calendarEvents.push({
                                id: `${typedEvent.uid}-${date.toISOString()}`,
                                title: typedEvent.summary,
                                start: date,
                                end: new Date(date.getTime() + duration),
                                allDay: isAllDay(typedEvent),
                                desc: typedEvent.description,
                                location: typedEvent.location,
                                isRecurrence: true
                            });
                        });
                    } else {
                        // Fallback or log if rrule exists but isn't helpful
                        // Sometimes it's just a string or params
                        console.warn(`Event ${typedEvent.summary} has rrule but no .between method`);
                        calendarEvents.push(mapSimpleEvent(typedEvent));
                    }
                } catch (e) {
                    console.error(`Error expanding rrule for ${typedEvent.summary}`, e);
                    // Add base event at least
                    calendarEvents.push(mapSimpleEvent(typedEvent));
                }
            } else {
                // Single event
                // Check if it's within range? Optional, but good for performance
                // Or just add everything (legacy behavior)
                calendarEvents.push(mapSimpleEvent(typedEvent));
            }
        }

        console.log(`Expanded to ${calendarEvents.length} total VEVENTs`);

        return NextResponse.json(calendarEvents);
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
    }
}

function mapSimpleEvent(event: any) {
    return {
        id: event.uid,
        title: event.summary,
        start: event.start,
        end: event.end,
        allDay: isAllDay(event),
        desc: event.description,
        location: event.location,
    };
}

// Helper to check if event is all day
function isAllDay(event: any) {
    if (!event.start) return false;
    // Check if start has no time component or if datetype is date
    return event.datetype === 'date';
}
