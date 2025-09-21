export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  experience?: string;
  type?: string;
  skills?: string[];
  featured?: boolean;
  closed?: boolean;
  postedDate: string;
  postedBy?: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  github: string;
  linkedin: string;
  leetcode: string;
  researchProfile: string;
  resume: string;
  skills: string[];
  experience: string[];
  education: string[];
}

export const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    description: "We are looking for a Senior React Developer who can build performant and maintainable web applications. The ideal candidate will have experience with TypeScript, React hooks, and state management libraries.",
    requirements: [
      "5+ years of experience in front-end development",
      "3+ years of experience with React",
      "Experience with TypeScript",
      "Knowledge of Redux or other state management solutions",
      "Experience with testing frameworks"
    ],
    salary: "$120,000",
    experience: "5+ years",
    type: "Full-time",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "GraphQL"],
    featured: true,
    closed: false,
    postedDate: "2023-07-15",
    postedBy: "1"
  },
  {
    id: "2",
    title: "Python Backend Engineer",
    company: "DataWiz Solutions",
    location: "San Francisco, CA",
    description: "We're seeking a talented Python Backend Engineer to join our team. You'll be responsible for developing and maintaining our data processing pipelines and APIs.",
    requirements: [
      "4+ years of Python development experience",
      "Experience with Django, Flask, or FastAPI",
      "Knowledge of SQL and NoSQL databases",
      "Experience with containerization and orchestration",
      "Familiarity with AWS or other cloud platforms"
    ],
    salary: "$100,000",
    experience: "4+ years",
    type: "Full-time",
    skills: ["Python", "Django", "FastAPI", "SQL", "NoSQL"],
    featured: false,
    closed: true,
    postedDate: "2023-07-20",
    postedBy: "1"
  },
  {
    id: "3",
    title: "Full Stack JavaScript Developer",
    company: "WebSolutions Plus",
    location: "New York, NY",
    description: "Join our growing team to develop modern web applications using JavaScript throughout the stack. You'll work on both client and server-side components of our platform.",
    requirements: [
      "3+ years of experience with JavaScript/TypeScript",
      "Experience with React, Vue, or Angular",
      "Experience with Node.js and Express",
      "Familiarity with MongoDB or PostgreSQL",
      "Understanding of RESTful API design principles"
    ],
    salary: "$110,000",
    experience: "3+ years",
    type: "Part-time",
    skills: ["JavaScript", "TypeScript", "React", "Vue", "Node.js", "MongoDB"],
    featured: true,
    closed: false,
    postedDate: "2023-07-25",
    postedBy: "1"
  }
];

export const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    github: "github.com/alexjohnson",
    linkedin: "linkedin.com/in/alexjohnson",
    leetcode: "leetcode.com/alexjohnson",
    researchProfile: "scholar.google.com/alexjohnson",
    resume: "Experienced software engineer with 7 years in web development...",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "GraphQL"],
    experience: [
      "Senior Frontend Developer, TechCorp (2019-Present)",
      "Frontend Developer, WebSolutions (2017-2019)",
      "Junior Developer, StartupXYZ (2015-2017)"
    ],
    education: [
      "M.S. Computer Science, Stanford University (2015)",
      "B.S. Computer Science, UC Berkeley (2013)"
    ]
  },
  {
    id: "2",
    name: "Samantha Lee",
    email: "sam.lee@example.com",
    github: "github.com/samlee",
    linkedin: "linkedin.com/in/samlee",
    leetcode: "leetcode.com/samlee",
    researchProfile: "scholar.google.com/samlee",
    resume: "Full-stack developer with expertise in Python and JavaScript...",
    skills: ["Python", "Django", "FastAPI", "JavaScript", "React", "Docker"],
    experience: [
      "Backend Engineer, DataCorp (2020-Present)",
      "Full Stack Developer, TechStartup (2018-2020)",
      "Software Engineer Intern, BigTech (2017)"
    ],
    education: [
      "B.S. Computer Engineering, MIT (2018)"
    ]
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    github: "github.com/michaelchen",
    linkedin: "linkedin.com/in/michaelchen",
    leetcode: "leetcode.com/michaelchen",
    researchProfile: "scholar.google.com/michaelchen",
    resume: "Python specialist with a focus on machine learning and data processing...",
    skills: ["Python", "TensorFlow", "PyTorch", "SQL", "AWS", "Docker"],
    experience: [
      "Machine Learning Engineer, AI Solutions Inc. (2019-Present)",
      "Data Scientist, Analytics Corp (2017-2019)"
    ],
    education: [
      "Ph.D. Computer Science, Carnegie Mellon University (2017)",
      "B.S. Mathematics, Caltech (2012)"
    ]
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    github: "github.com/emilyrodriguez",
    linkedin: "linkedin.com/in/emilyrodriguez",
    leetcode: "leetcode.com/emilyrodriguez",
    researchProfile: "scholar.google.com/emilyrodriguez",
    resume: "Frontend specialist with a passion for creating beautiful, accessible UI...",
    skills: ["JavaScript", "TypeScript", "React", "Vue", "CSS", "Accessibility"],
    experience: [
      "UI Engineer, DesignTech (2020-Present)",
      "Frontend Developer, Creative Solutions (2018-2020)"
    ],
    education: [
      "B.A. Computer Science, NYU (2018)"
    ]
  }
];
