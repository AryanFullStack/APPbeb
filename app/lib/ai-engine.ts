/**
 * AppBeb Intelligent Career AI Engine
 * Provides comprehensive, role-aware analysis and generation for career tools
 * when external LLM endpoints are unavailable or unconfigured.
 */

export interface AiEngineInput {
  tool: "matcher" | "cover-letter" | "interview" | "resume-summary" | "resume-bullet";
  first: string;
  second: string;
}

// Common tech, professional, and soft skills dictionary for lexical extraction
const COMMON_SKILLS = [
  // Tech & Engineering
  "React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind", "Node.js",
  "Python", "Java", "C#", "C++", "SQL", "PostgreSQL", "MongoDB", "REST API", "GraphQL",
  "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Linux",
  // Operations & Logistics
  "Inventory Management", "Dispatch", "Logistics", "Supply Chain", "Warehouse Operations",
  "Forklift", "Route Planning", "OSHA Safety", "Procurement", "Quality Assurance",
  // Healthcare & Care
  "Patient Care", "Vital Signs", "First Aid", "CPR", "Medication Administration",
  "Caregiving", "HIPAA Compliance", "Clinical Documentation", "Empathy",
  // Business, Support & Administration
  "Customer Support", "Zendesk", "Salesforce", "CRM", "Excel", "Data Entry",
  "Accounting", "Bookkeeping", "Accounts Payable", "Accounts Receivable", "Financial Reporting",
  "Scheduling", "Office Management", "Billing",
  // Soft & Leadership Skills
  "Communication", "Problem Solving", "Team Leadership", "Cross-Functional Collaboration",
  "Time Management", "Adaptability", "Conflict Resolution", "Process Improvement",
  "Stakeholder Management", "Project Management", "Agile", "Scrum"
];

function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  const matched = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    const skillNorm = skill.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegExp(skillNorm)}\\b`, "i");
    if (regex.test(normalized)) {
      matched.add(skill);
    }
  }

  // Also extract custom capitalized phrases or tools mentioned in text
  const words = text.match(/\b[A-Z][a-zA-Z0-9+#.-]{2,}\b/g) || [];
  for (const w of words) {
    if (w.length > 2 && !["The", "And", "For", "With", "Our", "You", "Your", "This", "That", "Have", "Will"].includes(w)) {
      if (COMMON_SKILLS.some(s => s.toLowerCase() === w.toLowerCase())) {
        matched.add(w);
      }
    }
  }

  return Array.from(matched);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractRoleTitle(text: string): string {
  // Check for common job titles or headings
  const patterns = [
    /(?:looking for|seeking|position|role|title|hiring for|job[:\s]+)(?:a\s+|an\s+)?([A-Za-z\s]{3,35})(?:\b|\.|\n|,)/i,
    /^([A-Za-z\s]{4,35})(?:\s*—|\s*-|\s*\(|\n)/,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match && match[1]?.trim().length > 3) {
      const candidate = match[1].trim();
      if (!["a candidate", "someone", "an experienced", "team member"].includes(candidate.toLowerCase())) {
        return candidate;
      }
    }
  }

  // Fallback: search for first line or role keywords
  const firstLine = text.trim().split("\n")[0].trim().replace(/^#+\s*/, "");
  if (firstLine.length > 3 && firstLine.length < 50 && !firstLine.includes(".")) {
    return firstLine;
  }

  return "Target Opportunity";
}

function extractCompanyName(text: string): string {
  const match = text.match(/(?:at|company|team|organization|with)\s+([A-Z][A-Za-z0-9&.\s]{2,30}?)(?:\s+is|\s+in|\s+team|\.|\n|,)/);
  if (match && match[1]?.trim().length > 2) {
    const clean = match[1].trim();
    if (!["The", "Our", "This", "Your", "A", "An"].includes(clean)) {
      return clean;
    }
  }
  return "Hiring Organization";
}

export function generateAiResponse(
  tool: "matcher" | "cover-letter" | "interview" | "resume-summary" | "resume-bullet",
  first: string,
  second: string
): string {
  switch (tool) {
    case "matcher":
      return generateResumeMatcher(first, second);
    case "cover-letter":
      return generateCoverLetter(first, second);
    case "interview":
      return generateInterviewPrep(first, second);
    case "resume-summary":
      return generateResumeSummary(first, second);
    case "resume-bullet":
      return generateResumeBullets(first, second);
    default:
      return "Unable to process tool request.";
  }
}

function generateResumeMatcher(resume: string, jobDesc: string): string {
  const resumeSkills = extractKeywords(resume);
  const jobSkills = extractKeywords(jobDesc);

  const matchedSkills = jobSkills.filter((s) =>
    resumeSkills.some((r) => r.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = jobSkills.filter(
    (s) => !resumeSkills.some((r) => r.toLowerCase() === s.toLowerCase())
  );

  const candidateSkillsNotInJob = resumeSkills.filter(
    (s) => !jobSkills.some((j) => j.toLowerCase() === s.toLowerCase())
  );

  // Calculate match percentage
  let matchPercentage = 72;
  if (jobSkills.length > 0) {
    const ratio = matchedSkills.length / jobSkills.length;
    matchPercentage = Math.min(94, Math.max(58, Math.round(55 + ratio * 40)));
  }

  const targetRole = extractRoleTitle(jobDesc);

  let output = `=======================================================
RESUME-TO-JOB MATCH ANALYSIS REPORT
Target Role: ${targetRole}
Estimated Match Score: ${matchPercentage}% (Strong Potential)
=======================================================\n\n`;

  output += `1. OVERALL FIT SUMMARY
-------------------------------------------------------
Based on your background and the target requirements, your profile demonstrates solid foundation for this position. Your stated experience aligns directly with several core requirements of the role. By incorporating specific terminology and emphasizing measurable achievements in your target areas, you can significantly elevate your application for automated applicant tracking systems (ATS) and human recruiters alike.\n\n`;

  output += `2. CONFIRMED MATCHING STRENGTHS
-------------------------------------------------------
These areas in your resume directly answer what the employer is asking for:
`;

  if (matchedSkills.length > 0) {
    matchedSkills.slice(0, 6).forEach((skill) => {
      output += `• ${skill}: Clearly referenced in your experience. Highlights direct competency for the role.\n`;
    });
  } else {
    output += `• Foundational Professional Background: Your hands-on experience and day-to-day responsibilities map well to the core workflows expected in this vacancy.\n`;
    output += `• Transferable Skills: Strong evidence of accountability, team coordination, and practical problem resolution.\n`;
  }

  if (candidateSkillsNotInJob.length > 0) {
    output += `• Bonus Competencies: Additional value points you bring (${candidateSkillsNotInJob.slice(0, 4).join(", ")}) that differentiate you from standard applicants.\n`;
  }

  output += `\n3. KEY SKILLS & KEYWORDS TO ADD OR EMPHASIZE
-------------------------------------------------------
The job listing strongly emphasizes the following elements that appear light or absent in your current resume:
`;

  if (missingSkills.length > 0) {
    missingSkills.slice(0, 6).forEach((skill) => {
      output += `• [Keyword]: "${skill}" — Found in requirements. Add 1-2 examples of how you applied this in your daily responsibilities or projects.\n`;
    });
  } else {
    output += `• Specific Metrics & Scale: Add concrete numbers (e.g. team size, order volume, turnaround speed, % efficiency improvement) to quantify your daily results.\n`;
    output += `• Industry Certifications & Tool Versions: Highlight any relevant credentials or specialized tools you used.\n`;
  }

  output += `\n4. 5 CONCRETE ACTIONABLE RECOMMENDATIONS
-------------------------------------------------------
1. Tailor Your Professional Summary: Open your CV with a 3-line statement mirroring the exact title "${targetRole}" and showcasing your primary core strengths.
2. Mirror Exact Terminology: Align your bullet points with the exact vocabulary used in the job description to ensure ATS compatibility.
3. Quantify Daily Achievements: Replace generic task descriptions (e.g., "Handled customer inquiries") with metric-backed impact (e.g., "Resolved 40+ daily inquiries with 98% first-contact resolution").
4. Highlight Problem-Solving Under Pressure: Include at least one bullet point illustrating how you handled an unexpected bottleneck or operational hurdle.
5. Emphasize Cross-Functional Collaboration: Highlight how your role interfaced with supervisors, peers, or external vendors to show teamwork readiness.\n\n`;

  output += `=======================================================
Report generated by AppBeb Career Assistant. Private & ready to edit.`;

  return output;
}

function generateCoverLetter(experience: string, roleDescription: string): string {
  const roleTitle = extractRoleTitle(roleDescription);
  const companyName = extractCompanyName(roleDescription);
  const expSkills = extractKeywords(experience);

  // Extract candidate name if available
  const nameMatch = experience.match(/(?:my name is|i am|name[:\s]+)([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
  const candidateName = nameMatch ? nameMatch[1] : "Applicant";

  const skillHighlights = expSkills.length > 0 
    ? expSkills.slice(0, 3).join(", ") 
    : "practical hands-on experience, strong attention to detail, and proven reliability";

  const todayStr = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());

  let letter = `Subject: Application for ${roleTitle} — ${candidateName}\n\n`;
  letter += `Date: ${todayStr}\n\n`;
  letter += `Dear Hiring Team at ${companyName},\n\n`;

  letter += `I am writing to express my enthusiastic interest in the ${roleTitle} position with ${companyName}. With a dedicated background in practical execution, collaborative teamwork, and ${skillHighlights}, I am eager to contribute immediately to your team’s daily operational success and long-term goals.\n\n`;

  letter += `Throughout my experience, I have prioritized high standards, consistency, and clear communication. In my recent roles, I have consistently focused on delivering dependable results, whether streamlining recurring tasks, resolving day-to-day challenges, or supporting teammates under tight deadlines. Specifically, my experience includes:\n\n`;

  // Dynamic bullet points from experience notes
  const lines = experience
    .split("\n")
    .map(l => l.trim().replace(/^[•\-\*]\s*/, ""))
    .filter(l => l.length > 25);

  if (lines.length >= 2) {
    letter += `• ${lines[0]}\n`;
    letter += `• ${lines[1]}\n`;
    if (lines[2]) letter += `• ${lines[2]}\n`;
  } else {
    letter += `• Applied rigorous standards to ensure smooth day-to-day workflows and prompt task completion.\n`;
    letter += `• Collaborated closely with cross-functional team members to troubleshoot bottlenecks and improve team output.\n`;
    letter += `• Maintained reliable accountability, adapting swiftly to changing priorities and fast-paced operational demands.\n`;
  }

  letter += `\nWhat excites me most about ${companyName} is your commitment to quality and integrity. I thrive in environments where proactive problem-solving and mutual respect are valued, and I am confident that my work ethic and practical capabilities make me a strong match for your requirements.\n\n`;

  letter += `Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and skills can benefit the ${roleTitle} team. I look forward to speaking with you.\n\n`;

  letter += `Sincerely,\n\n${candidateName}\nPhone & Email listed on Resume`;

  return letter;
}

function generateInterviewPrep(role: string, background: string): string {
  const roleTitle = role.trim().replace(/^e\.g\.\s*/i, "") || "Professional Position";
  const bgSkills = extractKeywords(background);

  let prep = `=======================================================
INTERVIEW PREPARATION & STRATEGY GUIDE
Role: ${roleTitle}
=======================================================\n\n`;

  prep += `OVERVIEW & MINDSET
-------------------------------------------------------
Interviewers for this position are assessing three primary pillars:
1. Operational Competence: Can you execute the core duties reliably without constant supervision?
2. Problem Solving & Composure: How do you handle unexpected delays, difficult coworkers, or shifting instructions?
3. Culture & Work Ethic: Will you show up prepared, communicate transparently, and support your team?\n\n`;

  prep += `8 HIGH-PROBABILITY INTERVIEW QUESTIONS & MODEL RESPONSES
-------------------------------------------------------\n`;

  const questions = [
    {
      q: `1. "Tell me about yourself and why you're a good fit for this ${roleTitle} position."`,
      goal: "Testing your elevator pitch, concise communication, and relevance.",
      star: `Focus on the Present, Past, Future formula:\n- Present: "Currently, I focus on..."\n- Past: "In my background, I developed strong skills in ${bgSkills.slice(0, 2).join(" and ") || "effective task execution"}..."\n- Future: "I was drawn to this position because..."`
    },
    {
      q: `2. "Walk me through a time when a project or task went wrong. How did you resolve it?"`,
      goal: "Testing accountability and practical problem-solving under pressure.",
      star: `Use the STAR format:\n- Situation: Briefly describe the setback without blaming coworkers.\n- Task: What needed immediate correction?\n- Action: Step-by-step actions you took to fix the immediate issue and prevent recurrence.\n- Result: Quantifiable positive outcome.`
    },
    {
      q: `3. "How do you prioritize when you have multiple competing deadlines or urgent requests?"`,
      goal: "Evaluating organizational discipline and stakeholder communication.",
      star: `Highlight triaging based on business impact, communicating early if a timeline will shift, and keeping a structured daily task checklist.`
    },
    {
      q: `4. "What core tools or workflows do you rely on to keep your work error-free?"`,
      goal: "Testing domain competence and attention to detail.",
      star: `Mention specific software, verification checklists, or peer reviews you utilize to maintain quality control.`
    },
    {
      q: `5. "Describe a situation where you had a disagreement with a supervisor or coworker."`,
      goal: "Testing emotional intelligence, conflict resolution, and maturity.",
      star: `Emphasize active listening, focusing on facts rather than emotions, seeking common ground, and supporting the final team decision.`
    },
    {
      q: `6. "How do you stay up-to-date and learn new tools or processes quickly?"`,
      goal: "Testing growth mindset and adaptability.",
      star: `Share an example of a tool or procedure you had to learn on the fly and how you achieved proficiency through documentation and hands-on practice.`
    },
    {
      q: `7. "Why are you interested in joining our organization over other opportunities?"`,
      goal: "Testing motivation, company research, and cultural alignment.",
      star: `Reference specific company values, stability, customer focus, or reputation for quality that resonates with you personally.`
    },
    {
      q: `8. "Where do you see yourself professionally in the next 2 to 3 years?"`,
      goal: "Testing stability, loyalty, and long-term commitment.",
      star: `Express your desire to master this role thoroughly, become a dependable go-to resource for the team, and take on increased responsibilities.`
    }
  ];

  questions.forEach(({ q, goal, star }) => {
    prep += `${q}\n• What they evaluate: ${goal}\n• Winning Approach:\n${star}\n\n`;
  });

  prep += `\n24-HOUR INTERVIEW PREP BLUEPRINT
-------------------------------------------------------
• Today (Afternoon): Review your resume and prepare 3 versatile STAR stories (1 triumph, 1 overcome failure, 1 team collaboration).
• Tonight: Practice answers out loud. Record a 60-second self-introduction on your phone to check pacing and tone.
• Tomorrow (Day-of): Arrive/log on 10 minutes early with pen, notepad, resume copy, and clean attire.\n\n`;

  prep += `5 HIGH-IMPACT QUESTIONS TO ASK THE INTERVIEWER
-------------------------------------------------------
1. "What does success look like in the first 90 days for someone in this role?"
2. "What is the biggest operational challenge the team is currently facing?"
3. "How would you describe the day-to-day dynamic among team members?"
4. "What are the opportunities for professional growth or cross-training here?"
5. "What are the next steps in your hiring process, and when do you anticipate making a decision?"\n\n`;

  prep += `=======================================================
AppBeb Interview Coach. Confident, encouraging, and ready to print.`;

  return prep;
}

function generateResumeSummary(roleOrSkills: string, experienceNotes: string): string {
  const role = roleOrSkills.trim() || "Professional";
  const skills = extractKeywords(experienceNotes + " " + roleOrSkills);
  const skillStr = skills.length > 0 ? skills.slice(0, 4).join(", ") : "operations, communication, and process improvement";

  return `Option 1 (Impact & Results-Driven):
Dedicated and reliable ${role} with proven experience executing daily workflows with precision and high accountability. Skilled in ${skillStr}. Recognized by supervisors and peers for proactive problem-solving, operational consistency, and fostering a supportive team environment.

Option 2 (Modern & Skill-Focused):
Adaptable ${role} equipped with practical expertise in ${skillStr}. Committed to maintaining high quality standards, streamlining procedures, and delivering measurable results in fast-paced operational settings.

Option 3 (Concise & Direct):
Results-oriented ${role} with a solid track record in ${skillStr}. Eager to leverage hands-on problem-solving and strong organizational skills to deliver immediate value to a collaborative team.`;
}

function generateResumeBullets(rawRole: string, experienceContext = ""): string {
  const role = rawRole.trim() || "operational workflows";
  const contextSkills = extractKeywords(experienceContext);
  const extraSkill = contextSkills.length > 0 ? ` and leveraging ${contextSkills[0]}` : "";

  return `• Spearheaded daily ${role}${extraSkill}, ensuring 100% adherence to quality, timeline, and safety standards.
• Streamlined recurring procedures, reducing turnaround times and saving approximately 4-6 hours per week.
• Collaborated closely with cross-functional team members to identify and promptly resolve operational bottlenecks.
• Recognized for exceptional dependability, maintaining a 99%+ accuracy rating across all deliverables.
• Mentored and supported new team members on standard operating procedures and software tools.`;
}
