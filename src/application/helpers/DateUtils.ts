import { getUnixTime } from "date-fns";

export async function randomDelay() {
    await delay(getRandomDelay(3, 15));
}

export function nextRetryDateFromNowPlusRandom(retryCounter: number) {
    const timeBackoff = getRandomDelay(3, 15) * 60 * retryCounter;
    return currentTimeInSeconds() + timeBackoff;
}

export function currentTimeInSeconds() {
    return getUnixTime(new Date())
}

function delay(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

function getRandomDelay(min: number, max: number): number {
    // Validate that the provided range is valid
    if (min >= max) {
        throw new Error("Invalid range. The minimum value must be less than the maximum value.");
    }

    // Generate a random decimal between 0 (inclusive) and 1 (exclusive)
    const randomDecimal = Math.random();

    // Map the random decimal to the specified range
    const randomNumberInRange = Math.floor(min + randomDecimal * (max - min));

    return randomNumberInRange;
}