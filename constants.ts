import { ClipboardIcon, DumbbellIcon, HealthIcon, ShieldIcon } from "./components/IconComponents";
import { Testimonial } from "./types";

export const FEATURES = [
    {
        icon: HealthIcon,
        title: "AI Symptom Checker",
        description: "Engage in a guided conversation with our AI to understand your symptoms and get initial recommendations.",
    },
    {
        icon: DumbbellIcon,
        title: "Personalized Exercises",
        description: "Receive suggestions for safe, effective exercises tailored to your condition, helping you on your recovery journey.",
    },
    {
        icon: ClipboardIcon,
        title: "Clinician Analysis Tools",
        description: "For professionals, upload images for advanced AI-powered posture and range-of-motion analysis.",
    },
    {
        icon: ShieldIcon,
        title: "Safe & Secure",
        description: "Your conversations and data are kept private and secure, ensuring a confidential experience.",
    },
];

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: "The AI symptom checker was surprisingly accurate. It helped me understand my knee pain and gave me exercises that provided immediate relief. Highly recommend!",
        author: "Sarah J.",
        title: "Marathon Runner",
        imageUrl: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        quote: "As a clinician, the posture analysis tool is a game-changer. It provides a quick, objective second opinion that I can share with my patients. It's like having an expert assistant.",
        author: "Dr. Mark R.",
        title: "Physiotherapist, DPT",
        imageUrl: "https://i.pravatar.cc/150?u=mark",
    },
    {
        quote: "I was skeptical at first, but the AI guided me through my back pain issues step-by-step. The advice was practical and easy to follow. A fantastic resource.",
        author: "David L.",
        title: "Office Worker",
        imageUrl: "https://i.pravatar.cc/150?u=david",
    },
];

export const PRICING_PLANS = [
    {
        name: "Patient Basic",
        price: "Free",
        features: [
            "AI Symptom Checker",
            "General Exercise Recommendations",
            "Personal Chat History",
            "Community Forum Access",
        ],
        cta: "Get Started for Free",
    },
    {
        name: "Patient Plus",
        price: "$15",
        period: "/ month",
        features: [
            "All Basic Features",
            "Personalized Exercise Plans",
            "Progress Tracking",
            "Priority AI Responses",
            "Save & Share Reports",
        ],
        cta: "Go Plus",
        popular: true,
    },
    {
        name: "Clinician Pro",
        price: "$49",
        period: "/ month",
        features: [
            "All Patient Plus Features",
            "Posture Analysis Tool",
            "Range of Motion Analysis",
            "Gait & Motion Analysis (Coming Soon)",
            "Manage Patient Profiles",
        ],
        cta: "Start Pro Trial",
    },
];