import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/NavigationBar.tsx';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate('/'); // Redirect to home after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Determine current page type for Navbar
  const currentPageType = location.pathname === '/' ? 'home' : 'topics';

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPage={currentPageType}
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
        }}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
        onLogoutClick={handleLogout}
      />

      <Routes>
        <Route path="/" element={<HomePage onTopicClick={(topicId) => navigate(`/topics/${topicId}`)} />} />
        <Route 
          path="/topics/:topicId" 
          element={
            <TopicPage 
              onBack={() => navigate('/')} 
              onPostClick={(postId) => {
                const currentTopicId = location.pathname.split('/')[2];
                navigate(`/topics/${currentTopicId}/posts/${postId}`);
              }} 
            />
          } 
        />
        <Route 
          path="/topics/:topicId/posts/:postId" 
          element={
            <PostDetailPage 
              onBack={() => {
                 // Go back to the topic page
                 const currentTopicId = location.pathname.split('/')[2];
                 navigate(`/topics/${currentTopicId}`);
              }} 
            />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={() => console.log("Navigate to signup")} 
            />
          } 
        />
      </Routes>
    </div>
  );
}
