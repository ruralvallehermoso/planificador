import type { ExamSection } from "@/lib/actions/exams"

export type AutoTestGradingRules = {
    questionCount: number
    testTotalPoints: number
    testPointsPerQuestion: number
    testPenaltyPerError: number
}

const TEST_QUESTION_PATTERN = /^\s*\d+[\.)]/

export function countTestQuestions(sections: Pick<ExamSection, "type" | "questions">[]) {
    return sections
        .filter(section => section.type === "TEST")
        .reduce((total, section) => {
            if (!section.questions) return total

            return total + section.questions
                .split("\n")
                .filter(line => TEST_QUESTION_PATTERN.test(line.trim()))
                .length
        }, 0)
}

export function parsePercentageValue(value: string | number | null | undefined, fallback = 0) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : fallback
    }

    const match = value?.match(/-?\d+(?:[.,]\d+)?/)
    if (!match) return fallback

    const parsed = Number.parseFloat(match[0].replace(",", "."))
    return Number.isFinite(parsed) ? parsed : fallback
}

export function roundToTwoDecimals(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateAutoTestGradingRules(part1Weight: number, questionCount: number): AutoTestGradingRules | null {
    if (questionCount <= 0) return null

    const testTotalPoints = roundToTwoDecimals(part1Weight / 10)
    const testPointsPerQuestion = roundToTwoDecimals(testTotalPoints / questionCount)

    return {
        questionCount,
        testTotalPoints,
        testPointsPerQuestion,
        testPenaltyPerError: roundToTwoDecimals(testPointsPerQuestion / 3)
    }
}
