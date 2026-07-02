import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "./App.css";
import ExercisePage from "./pages/ExercisePage";
import LogPage from "./pages/LogPage";
import WeightPage from "./pages/WeightPage";

function App() {
  // TODO: replace with real auth state once Cognito is wired up
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => setIsSignedIn(true);
  const handleSignOut = () => setIsSignedIn(false);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar__container">
            <Link to="/" id="navbar__logo">
              <i className="fas fa-dumbbell"></i> Workout Tracker
            </Link>
            <div className="navbar__toggle" id="mobile-menu">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
            <ul className="navbar__menu">
              <li className="navbar__item">
                <Link to="/" className="navbar__links" id="home-link">
                  Home
                </Link>
              </li>
              <li className="navbar__item">
                <Link to="/exercise" className="navbar__links" id="exercise-link">
                  Logs
                </Link>
              </li>
              <li className="navbar__item">
                <Link to="/weight" className="navbar__links" id="weight-link">
                  Weight
                </Link>
              </li>
              <li className="navbar__btn">
                {isSignedIn ? (
                  <button className="button" onClick={handleSignOut}>
                    Sign Out
                  </button>
                ) : (
                  <button className="button" onClick={handleSignIn}>
                    Sign In
                  </button>
                )}
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="main">
                  <div className="main__container">
                    <div className="main__content">
                      <h1>Improve Your Health.</h1>
                      <h2>Reach Your Goals.</h2>
                      {!isSignedIn && (
                        <button className="main__btn" onClick={handleSignIn}>
                          Get Started
                        </button>
                      )}
                    </div>
                    <div className="main__img--container">
                      <img
                        src="/images/pic1.svg"
                        alt="Workout illustration"
                        id="main__img"
                      />
                    </div>
                  </div>
                </div>
                <div className="services">
                  <h1>Change Your Life Today</h1>
                  <div className="services__container">
                    <div className="services__card">
                      <h2>See Change</h2>
                      <p>Start Today</p>
                      <div className="get-started-wrapper">
                        {isSignedIn ? (
                          <Link to="/exercise">
                            <button className="button get-started">Get Started</button>
                          </Link>
                        ) : (
                          <button className="button get-started" onClick={handleSignIn}>
                            Get Started
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="services__card">
                      <h2>Are you Ready?</h2>
                      <p>Take the leap</p>
                      <div className="get-started-wrapper">
                        {isSignedIn ? (
                          <Link to="/exercise">
                            <button className="button get-started">Get Started</button>
                          </Link>
                        ) : (
                          <button className="button get-started" onClick={handleSignIn}>
                            Get Started
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            }
          />
          <Route
            path="/exercise"
            element={isSignedIn ? <ExercisePage /> : <Navigate to="/" />}
          />
          <Route
            path="/log"
            element={isSignedIn ? <LogPage /> : <Navigate to="/" />}
          />
          <Route
            path="/weight"
            element={isSignedIn ? <WeightPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;