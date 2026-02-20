/**
 * LMS Complex Curricula / Learning Journey Service — P3.6 Gap Implementation
 *
 * Implements multi-course learning bundles and learning journey management:
 *  - Curriculum definition (ordered/unordered course bundles)
 *  - Prerequisites and sequencing rules
 *  - Learning journey enrollment with progress tracking
 *  - Completion certification across all courses
 *  - Compliance tracking (mandatory curricula)
 *
 * Oracle Fusion HCM equivalent: Oracle Learning Cloud — Learning Journeys / Curricula
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export type CompletionRule = 'ALL_COURSES' | 'ANY_N_COURSES' | 'MANDATORY_PLUS_ELECTIVES';
export type EnrollmentType = 'SELF' | 'MANAGER_ASSIGNED' | 'SYSTEM_MANDATORY';

export interface CurriculumCourse {
    courseId: string;
    courseTitle: string;
    sequenceOrder: number;         // Ordering within curriculum
    isMandatory: boolean;
    prerequisites: string[];       // Array of courseId that must be completed first
    dueOffsetDays?: number;        // Days after enrollment by which this course is due
    estimatedHours: number;
}

export interface Curriculum {
    id: string;
    name: string;
    description: string;
    targetAudience: string;        // e.g., 'New Hire', 'Manager', 'Finance Team'
    completionRule: CompletionRule;
    minCoursesForAnyN?: number;    // Required when completionRule = 'ANY_N_COURSES'
    mandatoryCourseIds: string[];  // For 'MANDATORY_PLUS_ELECTIVES' rule
    courses: CurriculumCourse[];
    certificationEnabled: boolean;
    expirationMonths?: number;     // Months until certification expires (recurrent training)
    isCompliance: boolean;         // Mandatory compliance curriculum
    createdAt: Date;
    updatedAt: Date;
}

export interface LearnerEnrollment {
    id: string;
    curriculumId: string;
    learnerId: string;
    enrolledAt: Date;
    enrollmentType: EnrollmentType;
    enrolledBy?: string;
    dueDate?: Date;
    courseProgress: Map<string, {
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED';
        completedAt?: Date;
        score?: number;
        dueDate?: Date;
    }>;
    overallStatus: 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAIVED';
    completedAt?: Date;
    certificateId?: string;
}

export interface LearningJourneyStatus {
    enrollment: LearnerEnrollment;
    curriculum: Curriculum;
    totalCourses: number;
    completedCourses: number;
    mandatoryPending: number;
    progressPct: number;
    nextCourseToDo?: string;
    overdueCount: number;
    estimatedHoursRemaining: number;
    isCompliant: boolean;
}

@Injectable()
export class LmsLearningJourneyService {
    private readonly logger = new Logger(LmsLearningJourneyService.name);
    private curricula: Map<string, Curriculum> = new Map();
    private enrollments: Map<string, LearnerEnrollment> = new Map(); // enrollmentId -> enrollment
    private learnerEnrollments: Map<string, string[]> = new Map(); // learnerId -> enrollmentIds

    // ── Curriculum Management ─────────────────────────────────────────────────
    createCurriculum(input: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>): Curriculum {
        const id = `CURR-${Date.now()}`;
        const curriculum: Curriculum = { ...input, id, createdAt: new Date(), updatedAt: new Date() };
        this.curricula.set(id, curriculum);
        this.logger.log(`Curriculum created: "${input.name}" [${input.courses.length} courses, rule=${input.completionRule}]`);
        return curriculum;
    }

    updateCurriculum(id: string, updates: Partial<Omit<Curriculum, 'id' | 'createdAt'>>): Curriculum {
        const curr = this.curricula.get(id);
        if (!curr) throw new NotFoundException(`Curriculum ${id} not found`);
        Object.assign(curr, updates, { updatedAt: new Date() });
        return curr;
    }

    getCurriculum(id: string): Curriculum {
        const curr = this.curricula.get(id);
        if (!curr) throw new NotFoundException(`Curriculum ${id} not found`);
        return curr;
    }

    listCurricula(targetAudience?: string, isCompliance?: boolean): Curriculum[] {
        return Array.from(this.curricula.values()).filter(c =>
            (targetAudience == null || c.targetAudience === targetAudience) &&
            (isCompliance == null || c.isCompliance === isCompliance)
        );
    }

    // ── Enrollment ────────────────────────────────────────────────────────────
    enroll(input: {
        curriculumId: string;
        learnerId: string;
        enrollmentType: EnrollmentType;
        enrolledBy?: string;
    }): LearnerEnrollment {
        const curriculum = this.getCurriculum(input.curriculumId);
        const id = `ENR-${input.learnerId}-${Date.now()}`;

        // Initialize course progress map
        const courseProgress = new Map<string, any>();
        for (const course of curriculum.courses) {
            const dueDate = course.dueOffsetDays
                ? new Date(Date.now() + course.dueOffsetDays * 86400000)
                : undefined;
            courseProgress.set(course.courseId, { status: 'NOT_STARTED', dueDate });
        }

        const overallDueDate = curriculum.expirationMonths
            ? new Date(Date.now() + curriculum.expirationMonths * 30 * 86400000)
            : undefined;

        const enrollment: LearnerEnrollment = {
            id, curriculumId: input.curriculumId, learnerId: input.learnerId,
            enrolledAt: new Date(), enrollmentType: input.enrollmentType,
            enrolledBy: input.enrolledBy, dueDate: overallDueDate,
            courseProgress, overallStatus: 'IN_PROGRESS',
        };

        this.enrollments.set(id, enrollment);
        const learnerList = this.learnerEnrollments.get(input.learnerId) || [];
        learnerList.push(id);
        this.learnerEnrollments.set(input.learnerId, learnerList);

        this.logger.log(`Learner ${input.learnerId} enrolled in curriculum "${curriculum.name}" [${input.enrollmentType}]`);
        return enrollment;
    }

    /**
     * Records a course completion within a learning journey enrollment.
     * Validates prerequisites and checks if curriculum completion is triggered.
     */
    recordCourseCompletion(enrollmentId: string, courseId: string, score?: number): {
        enrollment: LearnerEnrollment;
        curriculumCompleted: boolean;
        certificateId?: string;
    } {
        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);

        const curriculum = this.getCurriculum(enrollment.curriculumId);
        const course = curriculum.courses.find(c => c.courseId === courseId);
        if (!course) throw new Error(`Course ${courseId} not in curriculum ${enrollment.curriculumId}`);

        // Check prerequisites
        for (const prereqId of course.prerequisites) {
            const prereqStatus = enrollment.courseProgress.get(prereqId)?.status;
            if (prereqStatus !== 'COMPLETED' && prereqStatus !== 'WAIVED') {
                throw new Error(`Prerequisite course ${prereqId} must be completed before ${courseId}`);
            }
        }

        enrollment.courseProgress.set(courseId, {
            status: 'COMPLETED', completedAt: new Date(), score,
        });

        // Check if curriculum is complete per completion rule
        const curriculumCompleted = this._checkCurriculumCompletion(enrollment, curriculum);
        let certificateId: string | undefined;

        if (curriculumCompleted && enrollment.overallStatus !== 'COMPLETED') {
            enrollment.overallStatus = 'COMPLETED';
            enrollment.completedAt = new Date();

            if (curriculum.certificationEnabled) {
                certificateId = `CERT-${enrollment.learnerId}-${curriculum.id}-${Date.now()}`;
                enrollment.certificateId = certificateId;
                this.logger.log(`Certificate issued: ${certificateId} for learner ${enrollment.learnerId} in "${curriculum.name}"`);
            }
        }

        return { enrollment, curriculumCompleted, certificateId };
    }

    waiveCourse(enrollmentId: string, courseId: string, waiverId: string): LearnerEnrollment {
        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
        enrollment.courseProgress.set(courseId, { status: 'WAIVED' });
        this.logger.log(`Course ${courseId} waived in enrollment ${enrollmentId} by ${waiverId}`);
        return enrollment;
    }

    // ── Progress & Status ─────────────────────────────────────────────────────
    getLearningJourneyStatus(enrollmentId: string): LearningJourneyStatus {
        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);

        const curriculum = this.getCurriculum(enrollment.curriculumId);
        const now = new Date();

        let completedCourses = 0;
        let mandatoryPending = 0;
        let overdueCount = 0;
        let estimatedHoursRemaining = 0;
        let nextCourseToDo: string | undefined;

        const sortedCourses = [...curriculum.courses].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

        for (const course of sortedCourses) {
            const progress = enrollment.courseProgress.get(course.courseId);
            const status = progress?.status || 'NOT_STARTED';

            if (status === 'COMPLETED' || status === 'WAIVED') {
                completedCourses++;
            } else {
                // Check if prerequisites allow this course to be started
                const prereqsMet = course.prerequisites.every(p => {
                    const ps = enrollment.courseProgress.get(p)?.status;
                    return ps === 'COMPLETED' || ps === 'WAIVED';
                });
                if (prereqsMet && !nextCourseToDo) {
                    nextCourseToDo = course.courseId;
                }
                estimatedHoursRemaining += course.estimatedHours;
                if (course.isMandatory) mandatoryPending++;
                if (progress?.dueDate && now > progress.dueDate) overdueCount++;
            }
        }

        const totalCourses = curriculum.courses.length;
        const progressPct = totalCourses > 0 ? Number(((completedCourses / totalCourses) * 100).toFixed(1)) : 100;
        const isCompliant = !curriculum.isCompliance || enrollment.overallStatus === 'COMPLETED';

        return {
            enrollment, curriculum, totalCourses, completedCourses, mandatoryPending,
            progressPct, nextCourseToDo, overdueCount, estimatedHoursRemaining, isCompliant,
        };
    }

    getLearnerComplianceStatus(learnerId: string): Array<{
        curriculumName: string;
        isCompliance: boolean;
        status: string;
        completedAt?: Date;
        dueDate?: Date;
        isCompliant: boolean;
    }> {
        const enrollmentIds = this.learnerEnrollments.get(learnerId) || [];
        return enrollmentIds.map(eid => {
            const status = this.getLearningJourneyStatus(eid);
            return {
                curriculumName: status.curriculum.name,
                isCompliance: status.curriculum.isCompliance,
                status: status.enrollment.overallStatus,
                completedAt: status.enrollment.completedAt,
                dueDate: status.enrollment.dueDate,
                isCompliant: status.isCompliant,
            };
        });
    }

    // ── Private Helpers ───────────────────────────────────────────────────────
    private _checkCurriculumCompletion(enrollment: LearnerEnrollment, curriculum: Curriculum): boolean {
        const completed = new Set<string>();
        for (const [cid, prog] of enrollment.courseProgress) {
            if (prog.status === 'COMPLETED' || prog.status === 'WAIVED') {
                completed.add(cid);
            }
        }

        switch (curriculum.completionRule) {
            case 'ALL_COURSES':
                return curriculum.courses.every(c => completed.has(c.courseId));
            case 'ANY_N_COURSES': {
                const n = curriculum.minCoursesForAnyN || curriculum.courses.length;
                return completed.size >= n;
            }
            case 'MANDATORY_PLUS_ELECTIVES': {
                const mandatoryDone = curriculum.mandatoryCourseIds.every(id => completed.has(id));
                return mandatoryDone;
            }
            default:
                return false;
        }
    }
}
