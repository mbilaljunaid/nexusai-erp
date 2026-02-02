import { Injectable } from '@nestjs/common';

export interface Technician {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  availability: 'available' | 'busy' | 'offline';
  skillSet: string[];
  currentJobs: string[];
}

export interface ServiceJob {
  id: string;
  customerId: string;
  location: { lat: number; lng: number };
  priority: 'high' | 'medium' | 'low';
  requiredSkills: string[];
  assignedTechnicianId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimatedDuration: number;
  actualDuration?: number;
  createdDate: Date;
  completedDate?: Date;
}

export interface Route {
  id: string;
  technicianId: string;
  jobs: ServiceJob[];
  totalDistance: number;
  totalDuration: number;
  optimizedSequence: string[];
}

@Injectable()
export class FieldServiceService {
  private technicians: Map<string, Technician> = new Map();
  private jobs: Map<string, ServiceJob> = new Map();
  private routes: Map<string, Route> = new Map();
  private jobCounter = 1;
  private routeCounter = 1;

  registerTechnician(technician: Technician): Technician {
    this.technicians.set(technician.id, technician);
    return technician;
  }

  createServiceJob(job: Omit<ServiceJob, 'id'>): ServiceJob {
    const id = `JOB-${this.jobCounter++}`;
    const newJob: ServiceJob = {
      id,
      ...job,
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  assignJobToTechnician(jobId: string, technicianId: string): ServiceJob | undefined {
    const job = this.jobs.get(jobId);
    const technician = this.technicians.get(technicianId);

    if (!job || !technician) return undefined;

    // Check skill match
    const hasRequiredSkills = job.requiredSkills.every((skill) =>
      technician.skillSet.includes(skill),
    );

    if (!hasRequiredSkills) return undefined;

    job.assignedTechnicianId = technicianId;
    job.status = 'assigned';
    technician.currentJobs.push(jobId);

    return job;
  }

  optimizeRoute(technicianId: string): Route {
    const technician = this.technicians.get(technicianId);
    if (!technician) throw new Error('Technician not found');

    const techJobs = technician.currentJobs
      .map((jobId) => this.jobs.get(jobId))
      .filter((job) => job && job.status !== 'completed') as ServiceJob[];

    // Simulate route optimization (haversine-based distance approximation)
    const optimizedSequence = this.calculateOptimalSequence(
      technician.location,
      techJobs,
    );

    const totalDistance = Math.random() * 50 + 10; // 10-60 km
    const totalDuration = Math.random() * 480 + 120; // 2-10 hours

    const route: Route = {
      id: `RT-${this.routeCounter++}`,
      technicianId,
      jobs: techJobs,
      totalDistance,
      totalDuration,
      optimizedSequence,
    };

    this.routes.set(route.id, route);
    return route;
  }

  private calculateOptimalSequence(start: { lat: number; lng: number }, jobs: ServiceJob[]): string[] {
    // Simple nearest-neighbor heuristic for route optimization
    const sequence: string[] = [];
    let current = start;
    const remaining = [...jobs];

    while (remaining.length > 0) {
      let nearest = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const distance = this.calculateDistance(current, remaining[i].location);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = i;
        }
      }

      sequence.push(remaining[nearest].id);
      current = remaining[nearest].location;
      remaining.splice(nearest, 1);
    }

    return sequence;
  }

  private calculateDistance(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Earth radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  updateJobStatus(jobId: string, status: ServiceJob['status']): ServiceJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.status = status;
    if (status === 'completed') {
      job.completedDate = new Date();
    }

    return job;
  }

  getTechnicianLocation(technicianId: string): { lat: number; lng: number } | undefined {
    const tech = this.technicians.get(technicianId);
    return tech?.location;
  }

  updateTechnicianLocation(technicianId: string, location: { lat: number; lng: number }): boolean {
    const tech = this.technicians.get(technicianId);
    if (!tech) return false;

    tech.location = location;
    return true;
  }

  getJobsNearby(location: { lat: number; lng: number }, radiusKm: number = 10): ServiceJob[] {
    const nearby: ServiceJob[] = [];

    this.jobs.forEach((job) => {
      const distance = this.calculateDistance(location, job.location);
      if (distance <= radiusKm && job.status === 'pending') {
        nearby.push(job);
      }
    });

    return nearby;
  }
}
