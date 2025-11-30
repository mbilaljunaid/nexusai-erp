import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, TrendingUp, Award } from "lucide-react";

export default function LearningManagement() {
  const [viewType, setViewType] = useState("courses");
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["/api/learning/courses"] });
  const { data: enrollments = [] } = useQuery<any[]>({ queryKey: ["/api/learning/enrollments"] });

  const completedEnrollments = enrollments.filter((e: any) => e.progressPercentage >= 100).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Management</h1>
        <p className="text-muted-foreground mt-2">Manage training courses and enrollments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedEnrollments}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "courses" ? "default" : "outline"} onClick={() => setViewType("courses")} data-testid="button-view-courses">
          Courses
        </Button>
        <Button variant={viewType === "enrollments" ? "default" : "outline"} onClick={() => setViewType("enrollments")} data-testid="button-view-enrollments">
          Enrollments
        </Button>
      </div>

      {viewType === "courses" && (
        <div className="space-y-3">
          {courses.map((course: any) => (
            <Card key={course.id} data-testid={`card-course-${course.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{course.courseName}</h4>
                  <Badge>{course.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Instructor</span>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <p className="font-medium">{course.duration}h</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Capacity</span>
                    <p className="font-medium">{course.capacity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "enrollments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map((enrollment: any) => (
            <Card key={enrollment.id} data-testid={`card-enrollment-${enrollment.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{enrollment.courseId}</span>
                  <Badge>{enrollment.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Employee</span>
                    <p className="font-medium">{enrollment.employeeId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <p className="text-lg font-bold">{enrollment.progressPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
