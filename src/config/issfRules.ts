import type { Discipline, DisciplineConfig, AthleteResult } from '../types/shooting';

export const CURRENT_ISSF_RULEBOOK_VERSION = '2024-2028 Edition (Effective Jan 2024)';

export const DISCIPLINE_CONFIGS: Record<Discipline, DisciplineConfig> = {
    '10m_rifle': {
        id: '10m_rifle',
        name: '10m Air Rifle',
        qualificationShots: 60,
        qualificationMaxScore: 654.0, // 60 * 10.9
        finalistCount: 8,
        finalSeriesStructure: {
            stage1Series: [5, 5],
            singleShotStart: 11,
            singleShotEnd: 24,
            eliminationIntervalShots: 2,
            eliminationSchedule: [
                { shotIndex: 12, eliminateRank: 8 },
                { shotIndex: 14, eliminateRank: 7 },
                { shotIndex: 16, eliminateRank: 6 },
                { shotIndex: 18, eliminateRank: 5 },
                { shotIndex: 20, eliminateRank: 4 },
                { shotIndex: 22, eliminateRank: 3 }, // Bronze
                { shotIndex: 24, eliminateRank: 2 }, // Silver / Gold
            ],
        },
    },
    '10m_pistol': {
        id: '10m_pistol',
        name: '10m Air Pistol',
        qualificationShots: 60,
        qualificationMaxScore: 654.0,
        finalistCount: 8,
        finalSeriesStructure: {
            stage1Series: [5, 5],
            singleShotStart: 11,
            singleShotEnd: 24,
            eliminationIntervalShots: 2,
            eliminationSchedule: [
                { shotIndex: 12, eliminateRank: 8 },
                { shotIndex: 14, eliminateRank: 7 },
                { shotIndex: 16, eliminateRank: 6 },
                { shotIndex: 18, eliminateRank: 5 },
                { shotIndex: 20, eliminateRank: 4 },
                { shotIndex: 22, eliminateRank: 3 }, // Bronze
                { shotIndex: 24, eliminateRank: 2 }, // Silver / Gold
            ],
        },
    },
};

/**
 * Validates whether a single shot decimal score complies with ISSF standard (0.0 to 10.9)
 */
export function isValidISSFShot(score: number): boolean {
    if (isNaN(score)) return false;
    const rounded = Math.round(score * 10) / 10;
    return rounded >= 0.0 && rounded <= 10.9;
}

/**
 * Calculates sum of shots with exact single decimal rounding
 */
export function calculateTotalScore(shots: number[]): number {
    const sum = shots.reduce((acc, curr) => acc + (isValidISSFShot(curr) ? curr : 0), 0);
    return Math.round(sum * 10) / 10;
}

/**
 * Determines current elimination status for a finalist athlete based on shot index
 */
export function evaluateFinalEliminations(
    athletes: AthleteResult[],
    currentShotIndex: number,
    discipline: Discipline
): AthleteResult[] {
    const config = DISCIPLINE_CONFIGS[discipline];
    const schedule = config.finalSeriesStructure.eliminationSchedule;

    // Find all elimination thresholds reached up to currentShotIndex
    const applicableEliminations = schedule.filter(s => currentShotIndex >= s.shotIndex);

    // Sort active finalists by total final score descending
    const sorted = [...athletes].sort((a, b) => (b.finalTotal || 0) - (a.finalTotal || 0));

    return sorted.map((athlete, idx) => {
        // Current rank in final
        const currentRank = idx + 1;
        let finalStatus: AthleteResult['finalStatus'] = 'LIVE';
        let eliminatedAtShot: number | undefined = undefined;

        // Check if eliminated in schedule
        for (const elim of applicableEliminations) {
            if (currentRank >= elim.eliminateRank) {
                finalStatus = 'ELIMINATED';
                eliminatedAtShot = elim.shotIndex;
            }
        }

        if (currentShotIndex >= 24) {
            if (currentRank === 1) finalStatus = 'GOLD';
            else if (currentRank === 2) finalStatus = 'SILVER';
            else if (currentRank === 3) finalStatus = 'BRONZE';
        }

        return {
            ...athlete,
            finalRank: currentRank,
            finalStatus: athlete.finalStatus === 'ELIMINATED' ? 'ELIMINATED' : finalStatus,
            eliminatedAtShot: athlete.eliminatedAtShot || eliminatedAtShot,
        };
    });
}
