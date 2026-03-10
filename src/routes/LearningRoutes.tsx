import { Route } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";

// Phase 1: Core Experience
import LearningCatalog from "@/pages/learning/LearningCatalog";
import MyLearning from "@/pages/learning/MyLearning";
import CoursePlayer from "@/pages/learning/CoursePlayer";
import CertificateManager from "@/pages/learning/CertificateManager";

// Phase 2: Admin & Management
import LearningAdmin from "@/pages/learning/LearningAdmin";
import TeamLearningDashboard from "@/pages/learning/TeamLearningDashboard";
import LearningApprovals from "@/pages/learning/LearningApprovals";

// Phase 3: Advanced Features
import LearningPathBuilder from "@/pages/learning/LearningPathBuilder";
import AssessmentBuilder from "@/pages/learning/AssessmentBuilder";
import LearningCommunities from "@/pages/learning/LearningCommunities";

export default function LearningRoutes() {
    return (
        <ModuleLayout>
            {/* Phase 1: Core Experience */}
            <Route path="/learning/catalog" component={LearningCatalog} />
            <Route path="/learning/my-learning" component={MyLearning} />
            <Route path="/learning/player/:enrollmentId" component={CoursePlayer} />
            <Route path="/learning/certificates" component={CertificateManager} />

            {/* Phase 2: Admin & Management */}
            <Route path="/learning/admin" component={LearningAdmin} />
            <Route path="/learning/team-dashboard" component={TeamLearningDashboard} />
            <Route path="/learning/approvals" component={LearningApprovals} />

            {/* Phase 3: Advanced Features */}
            <Route path="/learning/paths" component={LearningPathBuilder} />
            <Route path="/learning/assessments" component={AssessmentBuilder} />
            <Route path="/learning/communities" component={LearningCommunities} />
        </ModuleLayout>
    );
}
