import { useEffect, useState } from 'react';
import { Navbar } from './components/NavigationBar.tsx';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { LoginPage } from './pages/LoginPage';

type Page = 
  | { type: 'home' }
  | { type: 'topic'; topicId: string }
  | { type: 'post'; postId: string; topicId: string }
  | { type: 'login' }
  | { type: 'signup' }; // Placeholder for now

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (token: string, username: string, userId: number) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('user_id', String(userId));
    setIsAuthenticated(true);
    setCurrentPage({ type: 'home' }); // Redirect to home after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setCurrentPage({ type: 'home' });
  };

  // Navigation Helpers
  const navigateToHome = () => setCurrentPage({ type: 'home' });
  const navigateToTopic = (topicId: string) => setCurrentPage({ type: 'topic', topicId });
  const navigateToPost = (postId: string, topicId: string) => setCurrentPage({ type: 'post', postId, topicId });
  const navigateToLogin = () => setCurrentPage({ type: 'login' });

  const handleBackFromPost = () => {
    if (currentPage.type === 'post') {
      setCurrentPage({ type: 'topic', topicId: currentPage.topicId });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPage={currentPage.type === 'home' ? 'home' : 'topics'}
        onNavigate={(page) => {
          if (page === 'home') navigateToHome();
        }}
        // Pass auth state to Navbar so it can show "Login" or "Logout" button
        isAuthenticated={isAuthenticated}
        onLoginClick={navigateToLogin}
        onLogoutClick={handleLogout}
      />

      {currentPage.type === 'home' && (
        <HomePage onTopicClick={navigateToTopic} />
      )}

      {currentPage.type === 'topic' && (
        <TopicPage
          topicId={currentPage.topicId}
          onBack={navigateToHome}
          onPostClick={(postId: string) => navigateToPost(postId, currentPage.topicId)}
        />
      )}

      {currentPage.type === 'post' && (
        <PostDetailPage
          postId={currentPage.postId}
          onBack={handleBackFromPost}
        />
      )}

      {currentPage.type === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={() => console.log("Navigate to signup")} // Placeholder
        />
      )}
    </div>
  );
}
