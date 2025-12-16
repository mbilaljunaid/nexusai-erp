import { db } from "../server/db";
import { sql, eq, desc } from "drizzle-orm";
import { communitySpaces, communityPosts, communityComments, communityVotes, users, userTrustLevels } from "@shared/schema";

async function seedDiscussions() {
  console.log("Starting community discussion seeding...");

  const weightedRandom = (weights: number[]): number => {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }
    return weights.length - 1;
  };

  const getReplyCount = (): number => {
    const choice = weightedRandom([5, 40, 35, 15]);
    switch (choice) {
      case 0: return 0;
      case 1: return 1 + Math.floor(Math.random() * 3);
      case 2: return 4 + Math.floor(Math.random() * 7);
      case 3: return 11 + Math.floor(Math.random() * 15);
      default: return 2;
    }
  };

  const getNestedReplyCount = (): number => {
    const choice = weightedRandom([40, 45, 15]);
    switch (choice) {
      case 0: return 0;
      case 1: return 1 + Math.floor(Math.random() * 2);
      case 2: return 3 + Math.floor(Math.random() * 3);
      default: return 0;
    }
  };

  const getUpvotes = (isHighRep: boolean, isRecent: boolean = false): number => {
    if (isRecent) {
      const weights = isHighRep ? [5, 20, 35, 25, 15] : [10, 30, 35, 20, 5];
      const choice = weightedRandom(weights);
      switch (choice) {
        case 0: return 0;
        case 1: return 1 + Math.floor(Math.random() * 5);
        case 2: return 6 + Math.floor(Math.random() * 10);
        case 3: return 16 + Math.floor(Math.random() * 20);
        case 4: return 36 + Math.floor(Math.random() * 50);
        default: return 3;
      }
    }
    const weights = isHighRep ? [5, 25, 30, 25, 15] : [15, 40, 25, 15, 5];
    const choice = weightedRandom(weights);
    switch (choice) {
      case 0: return 0;
      case 1: return 1 + Math.floor(Math.random() * 5);
      case 2: return 6 + Math.floor(Math.random() * 15);
      case 3: return 21 + Math.floor(Math.random() * 30);
      case 4: return 51 + Math.floor(Math.random() * 100);
      default: return 2;
    }
  };

  const getTimestamp = (startDate: Date, endDate: Date, period: 'early' | 'middle' | 'recent' | 'today' | 'thisWeek'): Date => {
    const now = new Date();
    let start: Date, end: Date;
    
    if (period === 'early') {
      start = startDate;
      end = new Date('2023-06-30');
    } else if (period === 'middle') {
      start = new Date('2023-07-01');
      end = new Date('2024-06-30');
    } else if (period === 'recent') {
      start = new Date('2024-07-01');
      end = new Date('2025-11-30');
    } else if (period === 'thisWeek') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      end = new Date(now.getTime() - 60 * 60 * 1000);
    }
    
    const timestamp = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    return timestamp;
  };

  const getReplyTimestamp = (postDate: Date): Date => {
    const choice = weightedRandom([30, 40, 20, 10]);
    let delay: number;
    switch (choice) {
      case 0: delay = Math.random() * 24 * 60 * 60 * 1000; break;
      case 1: delay = (1 + Math.random() * 6) * 24 * 60 * 60 * 1000; break;
      case 2: delay = (8 + Math.random() * 22) * 24 * 60 * 60 * 1000; break;
      case 3: delay = (30 + Math.random() * 60) * 24 * 60 * 60 * 1000; break;
      default: delay = 24 * 60 * 60 * 1000;
    }
    return new Date(postDate.getTime() + delay);
  };

  const spaces = await db.select().from(communitySpaces).where(eq(communitySpaces.isActive, true));
  if (spaces.length === 0) {
    console.log("No active community spaces found");
    return;
  }
  console.log(`Found ${spaces.length} active community spaces`);

  const contributorProfiles = [
    { name: "Priya Sharma", location: "India", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "James Wilson", location: "USA", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
    { name: "Chen Wei", location: "Singapore", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen" },
    { name: "Sarah Johnson", location: "UK", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "Ahmed Hassan", location: "Pakistan", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" },
    { name: "Maria Garcia", location: "Canada", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
    { name: "David Kim", location: "Australia", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { name: "Lisa Chen", location: "USA", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
    { name: "Mohammed Al-Rashid", location: "UAE", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed" },
    { name: "Emma Thompson", location: "UK", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { name: "Raj Patel", location: "India", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raj" },
    { name: "Jennifer Lee", location: "USA", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer" },
    { name: "Carlos Rodriguez", location: "Mexico", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
    { name: "Fatima Khan", location: "Pakistan", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima" },
    { name: "Michael Brown", location: "Canada", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
    { name: "Aisha Okonkwo", location: "Nigeria", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" },
    { name: "Thomas Mueller", location: "Germany", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas" },
    { name: "Yuki Tanaka", location: "Japan", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki" },
    { name: "Anna Kowalski", location: "Poland", isHighRep: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" },
    { name: "Robert Singh", location: "India", isHighRep: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" },
  ];

  const contributors: { id: string; name: string; isHighRep: boolean }[] = [];
  console.log("Creating contributor users...");
  
  for (const profile of contributorProfiles) {
    const id = `contributor-${profile.name.toLowerCase().replace(/\s/g, '-')}`;
    const email = `${profile.name.toLowerCase().replace(/\s/g, '.')}@nexusai-community.com`;
    
    await db.execute(sql`
      INSERT INTO users (id, email, name, role, created_at)
      VALUES (${id}, ${email}, ${profile.name}, 'member', ${new Date()})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    `);
    contributors.push({ id, name: profile.name, isHighRep: profile.isHighRep });

    const trustLevel = profile.isHighRep ? 4 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
    const reputation = profile.isHighRep ? 2000 + Math.floor(Math.random() * 5000) : 100 + Math.floor(Math.random() * 500);
    
    await db.execute(sql`
      INSERT INTO user_trust_levels (id, user_id, trust_level, total_reputation)
      VALUES (${`trust-${id}`}, ${id}, ${trustLevel}, ${reputation})
      ON CONFLICT (user_id) DO UPDATE SET trust_level = EXCLUDED.trust_level, total_reputation = EXCLUDED.total_reputation
    `);
  }
  console.log(`Created ${contributors.length} contributors`);

  const discussionTemplates: Record<string, { postType: string; title: string; content: string; tags: string[] }[]> = {
    "core-platform": [
      { postType: "question", title: "Best practices for multi-tenant configuration in NexusAIFirst?", content: "We're deploying NexusAIFirst for multiple subsidiaries. What's the recommended approach for configuring tenant isolation while allowing shared master data?", tags: ["multi-tenant", "configuration", "best-practices"] },
      { postType: "discussion", title: "NexusAIFirst performance optimization strategies", content: "Let's discuss proven strategies for optimizing NexusAIFirst performance. We've seen significant improvements after implementing query caching and optimizing our custom reports.", tags: ["performance", "optimization", "caching"] },
      { postType: "how-to", title: "Complete guide to NexusAIFirst role-based access control", content: "This guide covers everything you need to know about setting up RBAC in NexusAIFirst, from basic role definitions to complex permission inheritance.", tags: ["security", "rbac", "permissions"] },
      { postType: "question", title: "Migrating from legacy ERP to NexusAIFirst - data mapping challenges", content: "We're migrating from SAP R/3 to NexusAIFirst. Has anyone dealt with complex data mapping scenarios, especially for historical transaction data?", tags: ["migration", "data-mapping", "sap"] },
      { postType: "discussion", title: "NexusAIFirst v3.2 release discussion - new features and breaking changes", content: "The new release looks promising with the enhanced workflow engine. What are your thoughts on the deprecation of the legacy API endpoints?", tags: ["release", "v3.2", "upgrade"] },
      { postType: "question", title: "Custom dashboard widgets - best approach for real-time data?", content: "I need to create custom dashboard widgets that display real-time manufacturing KPIs. Should I use WebSocket subscriptions or polling?", tags: ["dashboard", "widgets", "real-time"] },
      { postType: "how-to", title: "Setting up SSO with Azure AD in NexusAIFirst", content: "Step-by-step guide for configuring Single Sign-On using Azure Active Directory, including group-based role assignment and MFA enforcement.", tags: ["sso", "azure-ad", "authentication"] },
      { postType: "question", title: "Handling concurrent transaction conflicts in NexusAIFirst", content: "We're experiencing occasional transaction conflicts when multiple users edit the same purchase order. How do others handle optimistic locking scenarios?", tags: ["concurrency", "transactions", "locking"] },
      { postType: "discussion", title: "NexusAIFirst API rate limiting - impact on integrations", content: "The new rate limiting policy is affecting our high-volume integrations. Let's discuss workarounds and best practices for API-heavy workflows.", tags: ["api", "rate-limiting", "integration"] },
      { postType: "question", title: "Audit trail configuration for compliance requirements", content: "Our compliance team requires detailed audit trails for all financial transactions. What's the recommended configuration for meeting SOX compliance?", tags: ["audit", "compliance", "sox"] },
    ],
    "app-marketplace": [
      { postType: "show-tell", title: "Introducing NexusConnect - our new integration framework", content: "Excited to share our new integration framework that simplifies connecting NexusAIFirst with external systems. Built-in support for 50+ connectors!", tags: ["integration", "announcement", "showcase"] },
      { postType: "question", title: "Recommended apps for warehouse barcode scanning?", content: "Looking for recommendations on barcode scanning apps that integrate well with NexusAIFirst's inventory module. Mobile support is essential.", tags: ["warehouse", "barcode", "mobile"] },
      { postType: "discussion", title: "App certification program - requirements and timeline", content: "For those building apps for the marketplace, let's discuss the certification requirements and typical review timelines.", tags: ["certification", "marketplace", "development"] },
      { postType: "bug", title: "Shipment Tracker app not syncing with carrier APIs", content: "After the latest NexusAIFirst update, the Shipment Tracker app stopped syncing with UPS and FedEx APIs. Anyone else experiencing this?", tags: ["bug", "shipping", "api-sync"] },
      { postType: "feature", title: "Request: Native Slack integration for NexusAIFirst notifications", content: "It would be great to have a native Slack integration for workflow notifications. Currently using Zapier but a direct integration would be more reliable.", tags: ["feature-request", "slack", "notifications"] },
    ],
    "form-builder": [
      { postType: "question", title: "Conditional logic for complex approval workflows", content: "I need to create a form where approval routing changes based on multiple conditions (amount, department, project type). How can I implement this in Form Builder?", tags: ["conditional-logic", "approval", "workflow"] },
      { postType: "how-to", title: "Creating multi-page forms with progress indicators", content: "Learn how to split complex forms into multiple pages with a visual progress indicator and section navigation.", tags: ["multi-page", "ux", "forms"] },
      { postType: "bug", title: "Form validation not working on mobile devices", content: "Custom validation rules work on desktop but fail on mobile browsers. The error messages don't display correctly on iOS Safari.", tags: ["bug", "mobile", "validation"] },
      { postType: "question", title: "Integrating external data sources in dropdown fields", content: "How can I populate a dropdown with data from an external API? Need to show customer data from our legacy CRM.", tags: ["integration", "dropdown", "external-data"] },
    ],
    "integrations": [
      { postType: "question", title: "REST API authentication best practices", content: "What's the recommended approach for authenticating external systems with NexusAIFirst's REST API? We need to support both service accounts and user-delegated access.", tags: ["api", "authentication", "security"] },
      { postType: "how-to", title: "Setting up bi-directional sync with Salesforce", content: "Step-by-step guide for configuring real-time bi-directional synchronization between NexusAIFirst CRM and Salesforce.", tags: ["salesforce", "sync", "crm"] },
      { postType: "bug", title: "Webhook delivery failures after firewall update", content: "Our webhooks stopped working after a firewall update. The NexusAIFirst webhook IP addresses don't match the documentation.", tags: ["webhook", "firewall", "networking"] },
      { postType: "question", title: "EDI integration options for supply chain partners", content: "We need to set up EDI with our major suppliers. What EDI solutions integrate best with NexusAIFirst's procurement module?", tags: ["edi", "supply-chain", "procurement"] },
      { postType: "feature", title: "Request: Native GraphQL API support", content: "REST is fine but GraphQL would make frontend integration much more efficient. Requesting native GraphQL endpoint support.", tags: ["graphql", "api", "feature-request"] },
    ],
    "accounting-finance": [
      { postType: "question", title: "Multi-currency revaluation process questions", content: "We operate in 12 currencies. What's the recommended approach for month-end currency revaluation in NexusAIFirst?", tags: ["multi-currency", "revaluation", "month-end"] },
      { postType: "how-to", title: "Configuring automated bank reconciliation", content: "This guide covers setting up automated bank reconciliation with matching rules, exception handling, and approval workflows.", tags: ["bank-reconciliation", "automation", "treasury"] },
      { postType: "question", title: "Intercompany accounting setup for complex hierarchies", content: "We have a complex corporate structure with multiple holding companies. How do you set up intercompany elimination rules in NexusAIFirst?", tags: ["intercompany", "consolidation", "corporate"] },
      { postType: "discussion", title: "Revenue recognition under ASC 606 in NexusAIFirst", content: "Let's discuss how others are implementing ASC 606 revenue recognition requirements. What configurations are you using for performance obligations?", tags: ["revenue-recognition", "asc-606", "compliance"] },
    ],
    "construction-erp": [
      { postType: "question", title: "Project cost tracking with WBS integration", content: "How are other construction companies integrating their WBS structures with NexusAIFirst's cost tracking? We need to track costs at the activity level.", tags: ["wbs", "cost-tracking", "project"] },
      { postType: "discussion", title: "Field data collection best practices", content: "What mobile solutions are you using for field data collection (timesheets, equipment logs, daily reports) that sync with NexusAIFirst?", tags: ["mobile", "field-data", "timesheets"] },
      { postType: "how-to", title: "Setting up progress billing with AIA G702/G703 forms", content: "Complete guide to configuring progress billing for construction projects using industry-standard AIA forms.", tags: ["billing", "aia", "progress-billing"] },
    ],
    "bugs-issues": [
      { postType: "bug", title: "Report export to Excel failing for large datasets", content: "When exporting reports with more than 100K rows to Excel, the export fails with a timeout error. Browser console shows memory issues.", tags: ["export", "excel", "timeout", "critical"] },
      { postType: "bug", title: "Dashboard widgets not refreshing automatically", content: "Dashboard widgets set to auto-refresh every 5 minutes are not updating. Manual refresh works fine.", tags: ["dashboard", "refresh", "widgets"] },
      { postType: "bug", title: "Date picker showing wrong timezone for international users", content: "Users in different timezones see incorrect dates. A transaction entered on Dec 15 in Tokyo shows as Dec 14 in reports.", tags: ["timezone", "date", "international"] },
    ],
    "feature-requests": [
      { postType: "feature", title: "AI-powered anomaly detection for financial transactions", content: "Request: ML-based anomaly detection that flags unusual transactions for review. Similar to what's available in banking fraud detection.", tags: ["ai", "anomaly-detection", "finance"] },
      { postType: "feature", title: "Bulk action support for approval queues", content: "Would save hours if we could approve/reject multiple items at once. Currently we have to process each approval individually.", tags: ["bulk-actions", "approvals", "productivity"] },
      { postType: "feature", title: "Custom keyboard shortcuts for power users", content: "Allow users to define custom keyboard shortcuts for frequently used actions. Would significantly speed up data entry.", tags: ["keyboard", "shortcuts", "ux"] },
    ],
    "training-learning": [
      { postType: "discussion", title: "Training program for new NexusAIFirst administrators", content: "We're onboarding new system admins. What training approach has worked best for your organization?", tags: ["training", "admin", "onboarding"] },
      { postType: "how-to", title: "Creating effective end-user training materials", content: "Tips and templates for creating role-based training materials that actually get used.", tags: ["training", "materials", "end-users"] },
      { postType: "show-tell", title: "Our NexusAIFirst certification program journey", content: "Sharing our experience going through the NexusAIFirst certification program. Tips on preparation and what to expect.", tags: ["certification", "learning", "career"] },
    ],
    "general-discussion": [
      { postType: "discussion", title: "NexusAIFirst community meetup planning - 2024", content: "Interest check for an in-person NexusAIFirst user community meetup. Would love to connect with fellow users and share experiences.", tags: ["community", "meetup", "networking"] },
      { postType: "announcement", title: "Welcome new community members - December 2023", content: "Let's welcome all new members who joined this month! Introduce yourself and tell us about your NexusAIFirst journey.", tags: ["welcome", "community", "introductions"] },
      { postType: "discussion", title: "How has NexusAIFirst transformed your business operations?", content: "Share your success stories! How has implementing NexusAIFirst changed your day-to-day operations?", tags: ["success-stories", "roi", "transformation"] },
    ],
  };

  const replyTemplates = {
    helpful: [
      "Great question! We faced similar challenges. Here's what worked for us: checking the system configuration in Admin > Settings > Advanced Options",
      "I've dealt with this before. The key is to use batch processing for large datasets to avoid timeout issues",
      "This is a common issue. The solution that worked for our team was creating a custom workflow rule that triggers on specific conditions",
      "We implemented something similar. You'll want to configure the API connection with proper authentication tokens",
      "Based on our experience, I'd recommend running the data validation script before importing",
    ],
    clarification: [
      "Could you provide more details about your specific configuration?",
      "What version of NexusAIFirst are you running? The approach might differ.",
      "Are you using the cloud or on-premise deployment?",
      "How large is your dataset? That might affect the recommended approach.",
    ],
    thanks: [
      "Thanks for sharing this! Very helpful for our implementation.",
      "Appreciate the detailed explanation. This solved our issue.",
      "This is exactly what I was looking for. Thanks!",
      "Great solution! We'll be implementing this next week.",
    ],
    authorReply: [
      "Thanks everyone for the helpful responses! We'll try the suggested approach.",
      "Update: We implemented the suggested solution and it reduced our processing time by 60%.",
      "To clarify my original question: we're specifically looking at the production environment.",
      "Following up on this - the issue is related to the permission settings.",
    ],
  };

  const startDate = new Date('2022-04-01');
  const endDate = new Date();
  
  let postsCreated = 0;
  let commentsCreated = 0;
  let votesCreated = 0;

  for (const space of spaces) {
    const spaceSlug = space.slug;
    const templates = discussionTemplates[spaceSlug] || discussionTemplates["general-discussion"];
    
    const postCounts: Record<string, number> = {
      "core-platform": 35,
      "integrations": 30,
      "accounting-finance": 28,
      "form-builder": 22,
      "app-marketplace": 20,
      "bugs-issues": 25,
      "feature-requests": 22,
      "construction-erp": 18,
      "training-learning": 15,
      "general-discussion": 20,
    };
    const numPosts = postCounts[spaceSlug] || 15;
    console.log(`Seeding ${numPosts} posts for space: ${spaceSlug}`);

    for (let i = 0; i < numPosts; i++) {
      const template = templates[i % templates.length];
      const author = contributors[Math.floor(Math.random() * contributors.length)];
      
      const periodChoice = weightedRandom([10, 25, 30, 20, 15]);
      const periods: ('early' | 'middle' | 'recent' | 'thisWeek' | 'today')[] = ['early', 'middle', 'recent', 'thisWeek', 'today'];
      const period = periods[periodChoice];
      const postDate = getTimestamp(startDate, endDate, period);
      
      const variation = Math.floor(Math.random() * 1000);
      const title = `${template.title} [#${variation}]`;
      
      const postId = `post-${spaceSlug}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const isRecent = period === 'today' || period === 'thisWeek';
      const postUpvotes = getUpvotes(author.isHighRep, isRecent);
      const viewCount = isRecent 
        ? 20 + Math.floor(Math.random() * 300) 
        : 50 + Math.floor(Math.random() * 800);
      
      const tagsArray = `{${template.tags.join(',')}}`;
      await db.execute(sql`
        INSERT INTO community_posts (id, space_id, author_id, post_type, title, content, upvotes, downvotes, view_count, answer_count, tags, created_at, updated_at)
        VALUES (${postId}, ${space.id}, ${author.id}, ${template.postType}, ${title}, ${template.content}, ${postUpvotes}, ${Math.floor(Math.random() * 3)}, ${viewCount}, ${0}, ${sql.raw(`'${tagsArray}'::text[]`)}, ${postDate}, ${postDate})
        ON CONFLICT DO NOTHING
      `);
      postsCreated++;

      const numVoters = Math.min(postUpvotes, contributors.length);
      for (let v = 0; v < numVoters; v++) {
        const voter = contributors[(v + i) % contributors.length];
        if (voter.id !== author.id) {
          const voteId = `vote-${postId}-${v}`;
          await db.execute(sql`
            INSERT INTO community_votes (id, user_id, target_type, target_id, vote_type, created_at)
            VALUES (${voteId}, ${voter.id}, 'post', ${postId}, 'upvote', ${new Date(postDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)})
            ON CONFLICT DO NOTHING
          `);
          votesCreated++;
        }
      }

      const replyCount = getReplyCount();
      let answerCount = 0;
      
      for (let r = 0; r < replyCount; r++) {
        const replier = contributors[Math.floor(Math.random() * contributors.length)];
        const replyDate = getReplyTimestamp(postDate);
        
        if (replyDate > endDate) continue;
        
        const replyType = weightedRandom([50, 20, 20, 10]);
        let replyContent: string;
        
        switch (replyType) {
          case 0:
            replyContent = replyTemplates.helpful[Math.floor(Math.random() * replyTemplates.helpful.length)];
            break;
          case 1:
            replyContent = replyTemplates.clarification[Math.floor(Math.random() * replyTemplates.clarification.length)];
            break;
          default:
            replyContent = replyTemplates.thanks[Math.floor(Math.random() * replyTemplates.thanks.length)];
        }
        
        const commentId = `comment-${postId}-${r}`;
        const commentUpvotes = getUpvotes(replier.isHighRep);
        const isAccepted = template.postType === "question" && r === 0 && Math.random() < 0.6;
        
        await db.execute(sql`
          INSERT INTO community_comments (id, post_id, parent_id, author_id, content, upvotes, downvotes, is_accepted, created_at, updated_at)
          VALUES (${commentId}, ${postId}, ${null}, ${replier.id}, ${replyContent}, ${commentUpvotes}, ${Math.floor(Math.random() * 1)}, ${isAccepted}, ${replyDate}, ${replyDate})
          ON CONFLICT DO NOTHING
        `);
        commentsCreated++;
        if (isAccepted) answerCount++;

        const nestedCount = getNestedReplyCount();
        for (let n = 0; n < nestedCount; n++) {
          const nestedReplier = contributors[Math.floor(Math.random() * contributors.length)];
          const nestedDate = getReplyTimestamp(replyDate);
          
          if (nestedDate > endDate) continue;
          
          const nestedContent = replyTemplates.thanks[Math.floor(Math.random() * replyTemplates.thanks.length)];
          const nestedId = `comment-${postId}-${r}-nested-${n}`;
          
          await db.execute(sql`
            INSERT INTO community_comments (id, post_id, parent_id, author_id, content, upvotes, downvotes, is_accepted, created_at, updated_at)
            VALUES (${nestedId}, ${postId}, ${commentId}, ${nestedReplier.id}, ${nestedContent}, ${getUpvotes(nestedReplier.isHighRep)}, ${0}, ${false}, ${nestedDate}, ${nestedDate})
            ON CONFLICT DO NOTHING
          `);
          commentsCreated++;
        }
      }

      if (Math.random() < 0.5 && replyCount > 0) {
        const authorReplyDate = getReplyTimestamp(postDate);
        if (authorReplyDate <= endDate) {
          const authorReplyContent = replyTemplates.authorReply[Math.floor(Math.random() * replyTemplates.authorReply.length)];
          const authorReplyId = `comment-${postId}-author`;
          
          await db.execute(sql`
            INSERT INTO community_comments (id, post_id, parent_id, author_id, content, upvotes, downvotes, is_accepted, created_at, updated_at)
            VALUES (${authorReplyId}, ${postId}, ${null}, ${author.id}, ${authorReplyContent}, ${getUpvotes(author.isHighRep)}, ${0}, ${false}, ${authorReplyDate}, ${authorReplyDate})
            ON CONFLICT DO NOTHING
          `);
          commentsCreated++;
        }
      }

      if (answerCount > 0 || replyCount > 0) {
        await db.execute(sql`
          UPDATE community_posts SET answer_count = ${answerCount + replyCount} WHERE id = ${postId}
        `);
      }
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Posts created: ${postsCreated}`);
  console.log(`Comments created: ${commentsCreated}`);
  console.log(`Votes created: ${votesCreated}`);
  console.log(`Contributors: ${contributors.length}`);
}

seedDiscussions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
