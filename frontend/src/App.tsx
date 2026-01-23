import React from 'react';
import { Navbar } from './components/Navigationbar';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { PostDetailPage } from './pages/PostDetailPage';

type Page = 
  | { type: 'home' }
  | { type: 'topic'; topicId: string }
  | { type: 'post'; postId: string; topicId: string };

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>({ type: 'home' });

  const navigateToHome = () => {
    setCurrentPage({ type: 'home' });
  };

  const navigateToTopic = (topicId: string) => {
    setCurrentPage({ type: 'topic', topicId });
  };

  const navigateToPost = (postId: string, topicId: string) => {
    setCurrentPage({ type: 'post', postId, topicId });
  };

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
    </div>
  );
}
