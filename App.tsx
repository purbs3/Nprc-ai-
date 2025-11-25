import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Preloader from './components/Preloader';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import CommunityPage from './components/CommunityPage';
import CategoryPage from './components/CategoryPage';
import TopicPage from './components/TopicPage';
import UserDashboard from './components/UserDashboard';
import ClinicianDashboard from './components/ClinicianDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import AdminPasswordReset from './components/AdminPasswordReset';
import { authService } from './services/authService';
import type { CurrentUser } from './types';

type Page =
    | { name: 'home' }
    | { name: 'login' }
    | { name: 'register' }
    | { name: 'forgot-password' }
    | { name: 'dashboard' }
    | { name: 'admin-login' }
    | { name: 'admin-panel' }
    | { name: 'admin-password-reset', secret: string }
    | { name: 'terms' }
    | { name: 'privacy' }
    | { name: 'contact' }
    | { name: 'blog' }
    | { name: 'blog-post', slug: string }
    | { name: 'community' }
    | { name: 'community-category', slug: string }
    | { name: 'community-topic', categorySlug: string, topicId: string };


const App: React.FC = () => {
    const [page, setPage] = useState<Page>({ name: 'home' });
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const route = useCallback(() => {
        const path = window.location.pathname;
        if (path === '/') setPage({ name: 'home' });
        else if (path === '/login') setPage({ name: 'login' });
        else if (path === '/register') setPage({ name: 'register' });
        else if (path === '/forgot-password') setPage({ name: 'forgot-password' });
        else if (path === '/dashboard') setPage({ name: 'dashboard' });
        else if (path === '/admin') setPage(isAdminLoggedIn ? { name: 'admin-panel' } : { name: 'admin-login' });
        else if (path.startsWith('/admin-password-reset/')) {
            const secret = path.split('/')[2];
            setPage({ name: 'admin-password-reset', secret });
        }
        else if (path === '/terms') setPage({ name: 'terms' });
        else if (path === '/privacy') setPage({ name: 'privacy' });
        else if (path === '/contact') setPage({ name: 'contact' });
        else if (path === '/blog') setPage({ name: 'blog' });
        else if (path.startsWith('/blog/')) {
            const slug = path.split('/')[2];
            setPage({ name: 'blog-post', slug });
        }
        else if (path === '/community') setPage({ name: 'community' });
        else if (path.startsWith('/community/')) {
            const parts = path.split('/').filter(Boolean);
            if (parts.length === 3) { // /community/:categorySlug/:topicId
                setPage({ name: 'community-topic', categorySlug: parts[1], topicId: parts[2] });
            } else if (parts.length === 2) { // /community/:categorySlug
                setPage({ name: 'community-category', slug: parts[1] });
            } else {
                setPage({ name: 'community' });
            }
        }
        else setPage({ name: 'home' });
        window.scrollTo(0, 0);
    }, [isAdminLoggedIn]);

    const handleNavigation = useCallback((path: string) => {
        window.history.pushState({}, '', path);
        route();
    }, [route]);

    useEffect(() => {
        authService.checkSession().then(user => {
            setCurrentUser(user);
        });

        const handlePopState = () => route();
        window.addEventListener('popstate', handlePopState);
        route(); // Initial route

        const timer = setTimeout(() => setIsLoading(false), 1000); // Simulate loading time

        return () => {
            clearTimeout(timer);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [route]);

    useEffect(() => {
        // This effect handles redirects based on authentication status.
        const path = window.location.pathname;

        // If user is not logged in and tries to access a protected route, redirect to login.
        if (path === '/dashboard' && !currentUser) {
            handleNavigation('/login');
        }

        // If user is logged in and tries to access login/register, redirect to dashboard.
        if ((path === '/login' || path === '/register') && currentUser) {
            handleNavigation('/dashboard');
        }
    }, [currentUser, handleNavigation]);

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        handleNavigation('/');
    };

    const renderPage = () => {
        switch (page.name) {
            case 'home': return <HomePage onNavigate={handleNavigation} />;
            case 'login': return <LoginPage onLoginSuccess={() => { setCurrentUser(authService.getCurrentUser()); handleNavigation('/dashboard'); }} onNavigate={handleNavigation} />;
            case 'register': return <RegisterPage onRegisterSuccess={() => { setCurrentUser(authService.getCurrentUser()); handleNavigation('/dashboard'); }} onNavigate={handleNavigation} />;
            case 'forgot-password': return <ForgotPasswordPage onNavigate={handleNavigation} />;
            case 'dashboard':
                // If we are here and currentUser is null, we are in a transient state before the redirect happens.
                if (!currentUser) {
                    return null; // Render nothing while the redirect is processed.
                }
                return currentUser.role === 'clinician' ? <ClinicianDashboard currentUser={currentUser} /> : <UserDashboard currentUser={currentUser} />;
            case 'admin-login': return <AdminLogin onLoginSuccess={() => { setIsAdminLoggedIn(true); handleNavigation('/admin'); }} />;
            case 'admin-panel': return <AdminPanel onLogout={() => setIsAdminLoggedIn(false)} />;
            case 'admin-password-reset': return <AdminPasswordReset onNavigate={handleNavigation} />;
            case 'terms': return <TermsPage onGoBack={() => handleNavigation('/')} />;
            case 'privacy': return <PrivacyPage onGoBack={() => handleNavigation('/')} />;
            case 'contact': return <ContactPage onGoBack={() => handleNavigation('/')} />;
            case 'blog': return <BlogPage onGoBack={() => handleNavigation('/')} onSelectPost={(slug) => handleNavigation(`/blog/${slug}`)} />;
            case 'blog-post': return <BlogPostPage postSlug={page.slug} onGoBack={() => handleNavigation('/blog')} />;
            case 'community': return <CommunityPage onGoBack={() => handleNavigation('/')} onNavigate={handleNavigation} />;
            case 'community-category': return <CategoryPage categorySlug={page.slug} onNavigate={handleNavigation} />;
            case 'community-topic': return <TopicPage categorySlug={page.categorySlug} topicId={page.topicId} onNavigate={handleNavigation} />;
            default: return <HomePage onNavigate={handleNavigation} />;
        }
    };

    if (isLoading) return <Preloader />;

    const isSimplePage = ['admin-login', 'admin-panel', 'admin-password-reset', 'login', 'register', 'forgot-password'].includes(page.name);
    const showHeaderFooter = !isSimplePage && !(page.name === 'dashboard');

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col">
            {showHeaderFooter && <Header currentUser={currentUser} onNavigate={handleNavigation} onLogout={handleLogout} />}
            <main className="flex-grow">
                {renderPage()}
            </main>
            {showHeaderFooter && <Footer onAdminClick={() => handleNavigation('/admin')} onNavigate={handleNavigation} />}
        </div>
    );
};

export default App;