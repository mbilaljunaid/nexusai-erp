import { db } from "../server/db";
import { sql, eq } from "drizzle-orm";

async function seedDiverseProfiles() {
  console.log("Starting diverse user profile seeding...");

  // 45 diverse user profiles with different contributor combinations
  const userProfiles = [
    // Pure Job Buyers (5 users)
    { name: "Victoria Sterling", type: "buyer", location: "New York, USA", title: "Chief Operations Officer", company: "Sterling Industries", bio: "Looking to hire top ERP consultants for our digital transformation." },
    { name: "Marcus Chen", type: "buyer", location: "San Francisco, USA", title: "VP of Technology", company: "TechFlow Corp", bio: "Building next-gen manufacturing systems." },
    { name: "Isabella Martinez", type: "buyer", location: "Toronto, Canada", title: "Director of Finance", company: "Maple Finance Group", bio: "Seeking expert help with financial system implementations." },
    { name: "Richard Thompson", type: "buyer", location: "London, UK", title: "Managing Director", company: "Thames Consulting", bio: "Enterprise transformation specialist looking for talent." },
    { name: "Amara Okafor", type: "buyer", location: "Lagos, Nigeria", title: "CEO", company: "Afrotech Solutions", bio: "Building Africa's leading ERP platform." },

    // Pure Service Providers (8 users)
    { name: "Dr. Samantha Wright", type: "service_provider", location: "Boston, USA", title: "ERP Implementation Consultant", company: "Wright Consulting", bio: "15+ years of SAP and NexusAI implementations. Certified in financial modules.", expertise: ["Financial Modules", "SAP Migration", "Compliance"] },
    { name: "Arjun Kapoor", type: "service_provider", location: "Bangalore, India", title: "Technical Architect", company: "CloudBridge Solutions", bio: "Cloud-native ERP solutions architect. AWS and Azure certified.", expertise: ["Cloud Architecture", "API Integration", "Performance Optimization"] },
    { name: "Elena Volkov", type: "service_provider", location: "Berlin, Germany", title: "Manufacturing Consultant", company: "Volkov & Associates", bio: "Industry 4.0 expert specializing in smart manufacturing.", expertise: ["Manufacturing", "IoT Integration", "Supply Chain"] },
    { name: "Hassan Al-Farsi", type: "service_provider", location: "Dubai, UAE", title: "Finance Specialist", company: "Gulf ERP Partners", bio: "Multi-currency and Islamic finance expert.", expertise: ["Multi-currency", "Treasury", "Islamic Finance"] },
    { name: "Sophie Laurent", type: "service_provider", location: "Paris, France", title: "HR Systems Expert", company: "TalentWorks", bio: "Payroll and HR module specialist for European compliance.", expertise: ["HR & Payroll", "GDPR Compliance", "Workforce Analytics"] },
    { name: "Kenji Tanaka", type: "service_provider", location: "Tokyo, Japan", title: "Lean Manufacturing Consultant", company: "Kaizen Systems", bio: "Toyota Production System expert bringing lean to ERP.", expertise: ["Lean Manufacturing", "Quality Control", "Kanban"] },
    { name: "Patricia Silva", type: "service_provider", location: "São Paulo, Brazil", title: "Tax & Compliance Consultant", company: "Compliance Pro BR", bio: "Latin American tax regulations and NexusAI localization.", expertise: ["Tax Compliance", "Localization", "Regulatory"] },
    { name: "David Kowalski", type: "service_provider", location: "Warsaw, Poland", title: "Data Migration Expert", company: "MigrateEasy", bio: "Seamless data migrations from legacy systems.", expertise: ["Data Migration", "ETL", "Database Optimization"] },

    // Pure Community Contributors (7 users)
    { name: "Rachel Green", type: "community", location: "Austin, USA", title: "Technical Writer", company: "DocsFirst", bio: "Making NexusAI documentation accessible to everyone.", expertise: ["Documentation", "Training", "User Guides"] },
    { name: "Omar Hassan", type: "community", location: "Cairo, Egypt", title: "Community Manager", company: "NexusAI Community", bio: "Helping users solve problems and share solutions.", expertise: ["Community Support", "Troubleshooting", "Best Practices"] },
    { name: "Linda Chen", type: "community", location: "Singapore", title: "Solution Architect", company: "Independent", bio: "Active contributor helping others optimize their implementations.", expertise: ["Architecture", "Performance", "Integrations"] },
    { name: "Stefan Mueller", type: "community", location: "Munich, Germany", title: "Developer Advocate", company: "OpenERP Initiative", bio: "Open source enthusiast and API documentation contributor.", expertise: ["API Development", "Open Source", "Developer Tools"] },
    { name: "Aisha Patel", type: "community", location: "Mumbai, India", title: "Training Specialist", company: "ERP Academy", bio: "Creating free tutorials and learning resources.", expertise: ["Training", "Video Tutorials", "Onboarding"] },
    { name: "Carlos Mendez", type: "community", location: "Mexico City, Mexico", title: "Forum Moderator", company: "Volunteer", bio: "Keeping the community safe and helpful.", expertise: ["Moderation", "Community Guidelines", "User Support"] },
    { name: "Nina Johansson", type: "community", location: "Stockholm, Sweden", title: "UX Researcher", company: "DesignLabs", bio: "Collecting user feedback to improve NexusAI experience.", expertise: ["UX Research", "User Feedback", "Accessibility"] },

    // Service Provider + Buyer Combo (5 users)
    { name: "Michael O'Brien", type: "service_provider_buyer", location: "Dublin, Ireland", title: "ERP Consultant & Business Owner", company: "O'Brien Enterprises", bio: "Running my own business while consulting for others.", expertise: ["ERP Implementation", "Business Strategy", "Change Management"] },
    { name: "Fatima Al-Hassan", type: "service_provider_buyer", location: "Riyadh, Saudi Arabia", title: "Systems Director", company: "MENA Tech Group", bio: "Managing internal ERP while offering consulting services.", expertise: ["System Administration", "Project Management", "Training"] },
    { name: "James Wong", type: "service_provider_buyer", location: "Hong Kong", title: "Digital Transformation Lead", company: "Pacific Industries", bio: "Transforming our company while helping partners do the same.", expertise: ["Digital Transformation", "Integration", "Analytics"] },
    { name: "Gabriela Santos", type: "service_provider_buyer", location: "Lisbon, Portugal", title: "Operations Manager", company: "Iberian Solutions", bio: "Implementing best practices internally and externally.", expertise: ["Operations", "Process Optimization", "Vendor Management"] },
    { name: "Benjamin Lee", type: "service_provider_buyer", location: "Sydney, Australia", title: "Business Analyst", company: "AussieTech", bio: "Bridging the gap between business needs and technology.", expertise: ["Business Analysis", "Requirements", "Testing"] },

    // Community + Service Provider Combo (5 users)
    { name: "Priya Sharma", type: "community_service_provider", location: "Delhi, India", title: "Senior ERP Consultant", company: "Sharma Consulting", bio: "15+ years experience. Active community contributor and mentor.", expertise: ["ERP Implementation", "Financial Modules", "Mentorship"] },
    { name: "Thomas Anderson", type: "community_service_provider", location: "Seattle, USA", title: "Integration Specialist", company: "AndersonTech", bio: "Helping the community while providing premium integration services.", expertise: ["API Integration", "Middleware", "Data Sync"] },
    { name: "Yuki Yamamoto", type: "community_service_provider", location: "Osaka, Japan", title: "Quality Assurance Lead", company: "QualityFirst", bio: "Testing expert sharing knowledge in forums and offering QA services.", expertise: ["Testing", "Quality Assurance", "Automation"] },
    { name: "Anna Kowalczyk", type: "community_service_provider", location: "Krakow, Poland", title: "Database Expert", company: "DataWorks", bio: "Helping optimize databases in the community and professionally.", expertise: ["Database Optimization", "Performance Tuning", "SQL"] },
    { name: "Mohammed Saleh", type: "community_service_provider", location: "Amman, Jordan", title: "Localization Specialist", company: "ArabicERP", bio: "Making NexusAI work for Arabic-speaking markets.", expertise: ["Localization", "RTL Support", "Arabic Translations"] },

    // Community + Buyer Combo (5 users)
    { name: "Jennifer Adams", type: "community_buyer", location: "Chicago, USA", title: "IT Director", company: "Midwest Manufacturing", bio: "Learning from the community to make better purchasing decisions.", expertise: ["IT Strategy", "Vendor Evaluation", "Implementation"] },
    { name: "Robert Kim", type: "community_buyer", location: "Seoul, South Korea", title: "CTO", company: "KimTech Industries", bio: "Active in forums while building our ERP ecosystem.", expertise: ["Technology Strategy", "Architecture", "Integration"] },
    { name: "Maria Gonzalez", type: "community_buyer", location: "Madrid, Spain", title: "Finance Director", company: "Iberia Finance", bio: "Sharing experiences while looking for the best solutions.", expertise: ["Finance", "Compliance", "Reporting"] },
    { name: "Daniel Thompson", type: "community_buyer", location: "Melbourne, Australia", title: "Operations Director", company: "OzLogistics", bio: "Community member learning and hiring the best talent.", expertise: ["Operations", "Logistics", "Supply Chain"] },
    { name: "Emily Watson", type: "community_buyer", location: "Vancouver, Canada", title: "HR Director", company: "PacificHR", bio: "Finding HR solutions through community recommendations.", expertise: ["HR Systems", "Payroll", "Workforce Management"] },

    // Triple Combo: Buyer + Service Provider + Community (5 users)
    { name: "Alexander Petrov", type: "all_three", location: "Moscow, Russia", title: "Managing Partner", company: "Petrov Consulting Group", bio: "Running implementations, hiring consultants, and guiding the community.", expertise: ["ERP Strategy", "Team Building", "Knowledge Sharing"] },
    { name: "Sarah Mitchell", type: "all_three", location: "Atlanta, USA", title: "ERP Practice Lead", company: "Mitchell & Associates", bio: "Full-stack ERP professional: buyer, seller, and contributor.", expertise: ["Practice Management", "Sales", "Delivery"] },
    { name: "Raj Krishnamurthy", type: "all_three", location: "Chennai, India", title: "Principal Consultant", company: "GlobalERP Partners", bio: "Building teams, serving clients, and giving back to the community.", expertise: ["Consulting", "Team Leadership", "Training"] },
    { name: "Catherine Dubois", type: "all_three", location: "Montreal, Canada", title: "VP of Digital", company: "Quebec Industries", bio: "Transforming our company while consulting and contributing.", expertise: ["Digital Strategy", "Change Management", "Innovation"] },
    { name: "Ahmed El-Sayed", type: "all_three", location: "Doha, Qatar", title: "Regional Director", company: "Gulf Digital Solutions", bio: "Leading regional implementations while building the community.", expertise: ["Regional Strategy", "Implementation", "Partnership"] },

    // App Providers (5 users)
    { name: "Nathan Brooks", type: "app_provider", location: "Portland, USA", title: "Founder & CEO", company: "AppForge Inc", bio: "Building innovative apps for the NexusAI marketplace.", expertise: ["App Development", "Product Management", "UX Design"] },
    { name: "Lisa Wang", type: "app_provider", location: "Shenzhen, China", title: "Technical Director", company: "SmartApp Solutions", bio: "Creating AI-powered extensions for NexusAI.", expertise: ["AI/ML", "App Development", "Integration"] },
    { name: "Patrick O'Neill", type: "app_provider", location: "Cork, Ireland", title: "Product Manager", company: "Celtic Software", bio: "Building productivity tools for NexusAI users.", expertise: ["Product Development", "Analytics", "Automation"] },
    { name: "Anita Desai", type: "app_provider", location: "Pune, India", title: "CTO", company: "InnoApps India", bio: "Developing enterprise-grade apps for the marketplace.", expertise: ["Enterprise Apps", "Security", "Scalability"] },
    { name: "Martin Bergström", type: "app_provider", location: "Gothenburg, Sweden", title: "Lead Developer", company: "Nordic Apps", bio: "Creating tools that enhance NexusAI workflows.", expertise: ["Workflow Automation", "Reporting", "Dashboards"] },
  ];

  console.log(`Creating ${userProfiles.length} diverse user profiles...`);

  const createdUsers: { id: string; type: string; name: string; expertise?: string[] }[] = [];

  for (const profile of userProfiles) {
    const id = `user-${profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    const email = `${profile.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@nexusai-platform.com`;
    
    await db.execute(sql`
      INSERT INTO users (id, email, name, role, created_at)
      VALUES (${id}, ${email}, ${profile.name}, 'member', ${new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)})
      ON CONFLICT (email) DO NOTHING
    `);

    // Create trust level based on profile type
    const isExpert = profile.type.includes('service_provider') || profile.type === 'all_three' || profile.type === 'community_service_provider';
    const trustLevel = isExpert ? 4 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
    const reputation = isExpert ? 1500 + Math.floor(Math.random() * 4000) : 50 + Math.floor(Math.random() * 500);
    
    await db.execute(sql`
      INSERT INTO user_trust_levels (id, user_id, trust_level, total_reputation)
      VALUES (${`trust-${id}`}, ${id}, ${trustLevel}, ${reputation})
      ON CONFLICT (user_id) DO UPDATE SET trust_level = EXCLUDED.trust_level, total_reputation = EXCLUDED.total_reputation
    `);

    createdUsers.push({ 
      id, 
      type: profile.type, 
      name: profile.name,
      expertise: (profile as any).expertise 
    });
  }

  console.log(`Created ${createdUsers.length} users with trust levels`);

  // Get service providers for service assignment
  const serviceProviders = createdUsers.filter(u => 
    u.type.includes('service_provider') || u.type === 'all_three' || u.type === 'app_provider'
  );
  console.log(`Found ${serviceProviders.length} service providers`);

  // Get all existing service packages
  const existingServices = await db.execute(sql`SELECT id, provider_id FROM service_packages`);
  const services = existingServices.rows as { id: string; provider_id: string }[];
  console.log(`Found ${services.length} existing services to reassign`);

  // Reassign services to the new 45 providers
  let reassigned = 0;
  for (const service of services) {
    const newProvider = serviceProviders[reassigned % serviceProviders.length];
    await db.execute(sql`
      UPDATE service_packages SET provider_id = ${newProvider.id} WHERE id = ${service.id}
    `);
    reassigned++;
  }
  console.log(`Reassigned ${reassigned} services to ${serviceProviders.length} providers`);

  // Create job postings for buyers
  const buyers = createdUsers.filter(u => 
    u.type.includes('buyer') || u.type === 'all_three'
  );
  console.log(`Found ${buyers.length} buyers for job postings`);

  // Get existing job postings and assign to buyers
  const existingJobs = await db.execute(sql`SELECT id FROM job_postings LIMIT 100`);
  const jobs = existingJobs.rows as { id: string }[];
  
  let jobsReassigned = 0;
  for (const job of jobs) {
    const buyer = buyers[jobsReassigned % buyers.length];
    await db.execute(sql`
      UPDATE job_postings SET buyer_id = ${buyer.id} WHERE id = ${job.id}
    `);
    jobsReassigned++;
  }
  console.log(`Reassigned ${jobsReassigned} jobs to ${buyers.length} buyers`);

  // Assign community posts to community contributors
  const communityContributors = createdUsers.filter(u => 
    u.type.includes('community') || u.type === 'all_three'
  );
  console.log(`Found ${communityContributors.length} community contributors`);

  // Reassign some community posts
  const existingPosts = await db.execute(sql`SELECT id FROM community_posts LIMIT 150`);
  const posts = existingPosts.rows as { id: string }[];
  
  let postsReassigned = 0;
  for (const post of posts) {
    const contributor = communityContributors[postsReassigned % communityContributors.length];
    await db.execute(sql`
      UPDATE community_posts SET author_id = ${contributor.id} WHERE id = ${post.id}
    `);
    postsReassigned++;
  }
  console.log(`Reassigned ${postsReassigned} community posts to ${communityContributors.length} contributors`);

  // Reassign community comments
  const existingComments = await db.execute(sql`SELECT id FROM community_comments LIMIT 500`);
  const comments = existingComments.rows as { id: string }[];
  
  let commentsReassigned = 0;
  for (const comment of comments) {
    const contributor = createdUsers[commentsReassigned % createdUsers.length];
    await db.execute(sql`
      UPDATE community_comments SET author_id = ${contributor.id} WHERE id = ${comment.id}
    `);
    commentsReassigned++;
  }
  console.log(`Reassigned ${commentsReassigned} comments to various users`);

  console.log("\nSeeding complete!");
  console.log(`Users created: ${createdUsers.length}`);
  console.log(`Services reassigned: ${reassigned}`);
  console.log(`Jobs reassigned: ${jobsReassigned}`);
  console.log(`Posts reassigned: ${postsReassigned}`);
  console.log(`Comments reassigned: ${commentsReassigned}`);
}

seedDiverseProfiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
