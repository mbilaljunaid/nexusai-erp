import { Injectable } from '@nestjs/common';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  salary: { min: number; max: number };
  status: 'open' | 'closed' | 'filled';
  postedDate: Date;
  closingDate?: Date;
  candidateCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobOpeningId: string;
  resume: string;
  skills: string[];
  experience: number;
  appliedDate: Date;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  score: number;
}

@Injectable()
export class RecruitmentService {
  private jobOpenings: Map<string, JobOpening> = new Map();
  private candidates: Candidate[] = [];
  private jobCounter = 1;
  private candidateCounter = 1;

  createJobOpening(opening: JobOpening): JobOpening {
    const id = `JOB-${this.jobCounter++}`;
    opening.id = id;
    this.jobOpenings.set(id, opening);
    return opening;
  }

  applyForJob(
    jobOpeningId: string,
    candidate: Omit<Candidate, 'id' | 'jobOpeningId' | 'appliedDate' | 'stage' | 'score'>,
  ): Candidate | undefined {
    const opening = this.jobOpenings.get(jobOpeningId);
    if (!opening) return undefined;

    const newCandidate: Candidate = {
      id: `CAND-${this.candidateCounter++}`,
      ...candidate,
      jobOpeningId,
      appliedDate: new Date(),
      stage: 'applied',
      score: this.calculateCandidateScore(candidate, opening.requiredSkills),
    };

    this.candidates.push(newCandidate);
    opening.candidateCount++;

    return newCandidate;
  }

  private calculateCandidateScore(
    candidate: Omit<Candidate, 'id' | 'jobOpeningId' | 'appliedDate' | 'stage' | 'score'>,
    requiredSkills: string[],
  ): number {
    let score = 0;

    // Skills match
    const matchedSkills = candidate.skills.filter((skill) =>
      requiredSkills.some((req) => req.toLowerCase().includes(skill.toLowerCase())),
    );
    score += (matchedSkills.length / requiredSkills.length) * 50;

    // Experience
    score += Math.min(candidate.experience * 5, 30);

    return Math.round(score);
  }

  moveToNextStage(candidateId: string): Candidate | undefined {
    const candidate = this.candidates.find((c) => c.id === candidateId);
    if (!candidate) return undefined;

    const stages: Candidate['stage'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    const currentIndex = stages.indexOf(candidate.stage);

    if (currentIndex < stages.length - 1) {
      candidate.stage = stages[currentIndex + 1];
    }

    return candidate;
  }

  getRankedCandidates(jobOpeningId: string): Candidate[] {
    return this.candidates
      .filter((c) => c.jobOpeningId === jobOpeningId)
      .sort((a, b) => b.score - a.score);
  }

  getOpeningWithCandidates(jobOpeningId: string): {
    opening: JobOpening | undefined;
    candidates: Candidate[];
  } {
    const opening = this.jobOpenings.get(jobOpeningId);
    const candidates = this.candidates.filter((c) => c.jobOpeningId === jobOpeningId);

    return { opening, candidates };
  }

  closeOpening(jobOpeningId: string): JobOpening | undefined {
    const opening = this.jobOpenings.get(jobOpeningId);
    if (opening) {
      opening.status = 'closed';
      opening.closingDate = new Date();
    }
    return opening;
  }
}
