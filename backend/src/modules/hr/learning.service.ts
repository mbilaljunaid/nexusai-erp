import { Injectable } from '@nestjs/common';

export interface LearningCourse {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  skillsImparted: string[];
  instructor: string;
  status: 'active' | 'archived';
}

export interface EmployeeEnrollment {
  id: string;
  employeeId: string;
  courseId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  progressPercent: number;
  score?: number;
}

export interface LearningPlan {
  id: string;
  employeeId: string;
  goalDescription: string;
  courses: string[];
  startDate: Date;
  targetDate: Date;
  status: 'active' | 'completed';
}

@Injectable()
export class LearningService {
  private courses: Map<string, LearningCourse> = new Map();
  private enrollments: EmployeeEnrollment[] = [];
  private learningPlans: Map<string, LearningPlan> = new Map();
  private courseCounter = 1;
  private planCounter = 1;

  createCourse(course: LearningCourse): LearningCourse {
    const id = `COURSE-${this.courseCounter++}`;
    course.id = id;
    this.courses.set(id, course);
    return course;
  }

  enrollEmployee(employeeId: string, courseId: string): EmployeeEnrollment | undefined {
    const course = this.courses.get(courseId);
    if (!course || course.status === 'archived') return undefined;

    const enrollment: EmployeeEnrollment = {
      id: `ENR-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      courseId,
      enrollmentDate: new Date(),
      status: 'enrolled',
      progressPercent: 0,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  updateProgress(enrollmentId: string, progressPercent: number): EmployeeEnrollment | undefined {
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return undefined;

    enrollment.progressPercent = progressPercent;

    if (progressPercent === 100) {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    } else if (progressPercent > 0) {
      enrollment.status = 'in-progress';
    }

    return enrollment;
  }

  completeCourse(enrollmentId: string, score: number): EmployeeEnrollment | undefined {
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return undefined;

    enrollment.status = 'completed';
    enrollment.completionDate = new Date();
    enrollment.progressPercent = 100;
    enrollment.score = score;

    return enrollment;
  }

  createLearningPlan(
    employeeId: string,
    goalDescription: string,
    courseIds: string[],
  ): LearningPlan | undefined {
    // Validate all courses exist
    const allCoursesExist = courseIds.every((id) => this.courses.has(id));
    if (!allCoursesExist) return undefined;

    const plan: LearningPlan = {
      id: `PLAN-${this.planCounter++}`,
      employeeId,
      goalDescription,
      courses: courseIds,
      startDate: new Date(),
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      status: 'active',
    };

    this.learningPlans.set(plan.id, plan);

    // Auto-enroll employee in all courses
    for (const courseId of courseIds) {
      this.enrollEmployee(employeeId, courseId);
    }

    return plan;
  }

  getEmployeeEnrollments(employeeId: string): EmployeeEnrollment[] {
    return this.enrollments.filter((e) => e.employeeId === employeeId);
  }

  getEmployeeLearningPlan(employeeId: string): LearningPlan | undefined {
    return Array.from(this.learningPlans.values()).find((p) => p.employeeId === employeeId);
  }
}
