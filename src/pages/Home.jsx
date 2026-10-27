import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Home.module.css';

// Images
import heroimg from '../assets/images/heroimg.png';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLearnMore = () => {
    const aboutSec = document.getElementById('about');
    if (aboutSec) {
      aboutSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.mainWrappeer}>
          {/* ---------------HERO SECTION--------------*/}
          <section className={styles.hero}>
            <div className={styles.heroWrapper}>
              <div className={styles.heroTextContainer}>
                <p className={styles.heroFirstLine}>
                  <i className="fa-solid fa-diamond"></i> Your Study Partner
                </p>
                <h1 className={styles.heroBigText}>
                  Plan Better <br /> <span>Study Smarter</span> Achieve More
                </h1>
                <p className={styles.heroPara}>
                  StudyMate brings all your study activities together into a single web application.
                  Organize subjects, structure daily timetables, stay on top of assignments, and track your
                  academic journey with ease.
                </p>
                <div className={styles.heroBtnContainer}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={handleGetStarted}
                  >
                    <span>Get Started</span> <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.lmBtn}`}
                    onClick={handleLearnMore}
                  >
                    Learn More
                  </button>
                </div>
              </div>
              <div className={styles.heroImgContainer}>
                <img
                  src={heroimg}
                  alt="StudyMate Hero"
                  className={styles.heroImg}
                />
              </div>
            </div>
          </section>

          {/* ---------------ABOUT SECTION-------------- */}
          <section id="about" className={styles.about}>
            <div className={styles.aboutCard}>
              <h2 className={styles.aboutHeading}>Why Choose StudyMate?</h2>
              <div className={styles.featuresRow}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <i className="fa-solid fa-book-open"></i>
                  </div>
                  <h3>Subject Organization</h3>
                  <p>Categorize subjects with custom color tags, notes, and course details.</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <h3>Smart Planning</h3>
                  <p>Design personalized study timetables that fit your learning rhythm.</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <h3>Track Progress</h3>
                  <p>Visualize completed study hours and celebrate your consistency.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;