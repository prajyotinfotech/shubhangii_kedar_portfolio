import { useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JourneyAurora from '../components/JourneyAurora';

const JourneyPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app">
      {/* <Navbar /> */}
      <main>
        <div className="container" style={{ position: 'relative', zIndex: 5, paddingTop: '0.0rem' }}>
          <Link to="/" className="back-to-home">
            ← Back to Home
          </Link>
        </div>
        <JourneyAurora />
      </main>

      <Footer />
    </div>
  );
};

export default JourneyPage;