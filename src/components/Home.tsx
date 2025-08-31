import React from 'react';
import blogsData  from '../data/blogsData.json';
import '../styles/App.css';

interface BlogPost {
  id: string | number;
  date: string;
  title: string;
  summary: string;
  link: string;
}

const Home: React.FC = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Home</h1>
      </header>

      {/* Feature Cards */}
      <section className="feature-cards">
        <div className="feature-card">
          <h3>Get started</h3>
          <p>Read our getting started guide to get the most out of your Capitalmind subscription.</p>
          <a href="#" className="feature-link">↗</a>
        </div>
        <div className="feature-card">
          <h3>Community</h3>
          <p>Join the conversation on our exclusive community on Slack for Capitalmind Premium subscribers</p>
          <a href="#" className="feature-link">↗</a>
        </div>
        <div className="feature-card">
          <h3>Visit website</h3>
          <p>Keep up with our latest content on our website</p>
          <a href="#" className="feature-link">↗</a>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="latest-posts">
        <h2>Latest Posts</h2>
        <div className="posts-grid">
          {(blogsData as BlogPost[]).map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <time className="post-date">{post.date}</time>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-summary">{post.summary}</p>
              <a href={post.link} className="post-link">Read full post</a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
