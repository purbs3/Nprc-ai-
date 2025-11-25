import type { ForumCategory, ForumTopic, ForumPost } from '../types';

const CATEGORIES_KEY = 'nprc-forum-categories';
const TOPICS_KEY = 'nprc-forum-topics';
const POSTS_KEY = 'nprc-forum-posts';

// --- BACKEND BLUEPRINT ---
// This file simulates a full CRUD API for a forum. In a real application, each
// function would correspond to an API endpoint that interacts with your MariaDB database.

// --- DUMMY DATA (for localStorage simulation) ---
const getInitialCategories = (): ForumCategory[] => [
    { id: '1', name: 'General Discussion', slug: 'general-discussion', description: 'Talk about anything related to physiotherapy and rehabilitation.' },
    { id: '2', name: 'Sports Injuries', slug: 'sports-injuries', description: 'Discuss treatment protocols, new research, and case studies on sports-related injuries.' },
    { id: '3', name: 'Chronic Pain Management', slug: 'chronic-pain', description: 'Share strategies, patient experiences, and multidisciplinary approaches to chronic pain.' },
    { id: '4', name: 'Case Studies', slug: 'case-studies', description: 'Present and discuss interesting or challenging patient cases with peers.' },
];
const getInitialTopics = (): ForumTopic[] => [
    { id: 't1', categoryId: '2', title: 'ACL Post-Op Protocol - Week 1-2', slug: 'acl-post-op-protocol-week-1-2', authorName: 'Dr. Purab Sinha', authorTitle: 'Lead Physiotherapist, DPT', createdAt: new Date(Date.now() - 86400000).toISOString(), content: '<p>Hi team, let\'s discuss our updated protocol for the initial phase of ACL rehabilitation. I\'m particularly interested in thoughts on early weight-bearing and quad activation exercises. What are your go-to methods?</p>' },
    { id: 't2', categoryId: '3', title: 'Managing Fibromyalgia Flare-ups', slug: 'managing-fibromyalgia-flare-ups', authorName: 'Dr. Tarique Akhtar', authorTitle: 'Senior Physiotherapist, MSc', createdAt: new Date(Date.now() - 172800000).toISOString(), content: '<p>I have a patient experiencing frequent fibromyalgia flare-ups. We\'ve tried pacing and gentle exercise. Looking for other evidence-based strategies to suggest, especially regarding pain education and sleep hygiene. Any recommendations?</p>' },
];
const getInitialPosts = (): ForumPost[] => [
    { id: 'p1', topicId: 't1', authorName: 'Dr. Tarique Akhtar', authorTitle: 'Senior Physiotherapist, MSc', createdAt: new Date(Date.now() - 43200000).toISOString(), content: '<p>Good topic. I\'ve had success with immediate, passive knee extension exercises to prevent flexion contracture. Also, using NMES for quad activation in the first 48 hours has shown great results in my practice.</p>' },
    { id: 'p2', topicId: 't1', authorName: 'Dr. Emily Carter', authorTitle: 'Sports Physio Specialist', createdAt: new Date().toISOString(), content: '<p>Agreed on the NMES. I also introduce partial weight-bearing with crutches as tolerated within the first 2-3 days, focusing on achieving a normal gait pattern from the start. It seems to improve patient confidence significantly.</p>' },
];

// --- GENERIC STORAGE HELPERS (for simulation) ---
const getFromStorage = async <T>(key: string, initialData: T[]): Promise<T[]> => {
    await new Promise(r => setTimeout(r, 100)); // Simulate network delay
    try {
        const json = localStorage.getItem(key);
        if (json) {
            const data = JSON.parse(json);
            if (Array.isArray(data)) return data;
        }
    } catch (error) {
        console.error(`Failed to load ${key} from localStorage:`, error);
    }
    await saveToStorage(key, initialData);
    return initialData;
};

const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
    await new Promise(r => setTimeout(r, 100)); // Simulate network delay
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
    }
};

// --- PUBLIC API (Functions to be replaced with fetch calls) ---

export const getForumCategories = async (): Promise<ForumCategory[]> => getFromStorage(CATEGORIES_KEY, getInitialCategories());
export const getForumTopics = async (): Promise<ForumTopic[]> => getFromStorage(TOPICS_KEY, getInitialTopics());
export const getForumPosts = async (): Promise<ForumPost[]> => getFromStorage(POSTS_KEY, getInitialPosts());

export const getCategoryBySlug = async (slug: string): Promise<ForumCategory | undefined> => (await getForumCategories()).find(c => c.slug === slug);

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/topics?categoryId=:id
 * =================================================================================
 * MariaDB SQL Query Example:
 * SELECT * FROM forum_topics WHERE categoryId = ? ORDER BY createdAt DESC;
 * =================================================================================
 */
export const getTopicsForCategory = async (categoryId: string): Promise<ForumTopic[]> => (await getForumTopics()).filter(t => t.categoryId === categoryId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getTopicById = async (id: string): Promise<ForumTopic | undefined> => (await getForumTopics()).find(t => t.id === id);

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/posts?topicId=:id
 * =================================================================================
 * MariaDB SQL Query Example:
 * SELECT * FROM forum_posts WHERE topicId = ? ORDER BY createdAt ASC;
 * =================================================================================
 */
export const getPostsForTopic = async (topicId: string): Promise<ForumPost[]> => (await getForumPosts()).filter(p => p.topicId === topicId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/topics
 * =================================================================================
 * The request body should contain { categoryId, title, content, authorName, authorTitle }.
 * The backend should generate the id, createdAt, and slug.
 *
 * MariaDB SQL Query Example:
 * INSERT INTO forum_topics (id, categoryId, title, slug, authorName, authorTitle, createdAt, content)
 * VALUES (?, ?, ?, ?, ?, ?, ?, ?);
 * =================================================================================
 */
export const createTopic = async (topicData: Omit<ForumTopic, 'id' | 'createdAt' | 'slug'>): Promise<ForumTopic> => {
    const topics = await getForumTopics();
    const newTopic: ForumTopic = {
        ...topicData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        slug: topicData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    };
    await saveToStorage(TOPICS_KEY, [newTopic, ...topics]);
    return newTopic;
};

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/posts
 * =================================================================================
 * The request body should contain { topicId, content, authorName, authorTitle }.
 * The backend should generate the id and createdAt.
 *
 * MariaDB SQL Query Example:
 * INSERT INTO forum_posts (id, topicId, authorName, authorTitle, createdAt, content)
 * VALUES (?, ?, ?, ?, ?, ?);
 * =================================================================================
 */
export const createPost = async (postData: Omit<ForumPost, 'id' | 'createdAt'>): Promise<ForumPost> => {
    const posts = await getForumPosts();
    const newPost: ForumPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    await saveToStorage(POSTS_KEY, [...posts, newPost]);
    return newPost;
};

// --- STATS HELPERS (These would be efficient backend queries) ---

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/categories/:id/stats
 * =================================================================================
 * An efficient backend would calculate this with optimized SQL queries.
 *
 * MariaDB SQL Query Example:
 * SELECT
 *   (SELECT COUNT(*) FROM forum_topics WHERE categoryId = ?) AS topicCount,
 *   (SELECT COUNT(*) FROM forum_posts WHERE topicId IN (SELECT id FROM forum_topics WHERE categoryId = ?)) AS postCount;
 * =================================================================================
 */
export const getCategoryStats = async (categoryId: string) => {
    const topics = await getTopicsForCategory(categoryId);
    const topicIds = topics.map(t => t.id);
    const posts = (await getForumPosts()).filter(p => topicIds.includes(p.topicId));
    return {
        topicCount: topics.length,
        postCount: posts.length,
    };
};

export const getTopicStats = async (topicId: string) => {
    const posts = await getPostsForTopic(topicId); // Already sorted ascending by date
    const lastPost = posts.length > 0 ? posts[posts.length - 1] : null;

    return {
        replyCount: posts.length,
        lastPost: lastPost,
    };
};
