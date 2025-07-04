import { Link, useLocation } from 'react-router-dom';

function Navbar({ isAdmin, onLogout}) {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Media Management</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
                Images
              </Link>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/approve_images" ? "active" : ""}`} to="/approve_images">
                  Approve Images
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/preapprove_images" ? "active" : ""}`} to="/preapprove_images">
                Pre Approve Images
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/assign_keywords" ? "active" : ""}`} to="/assign_keywords">
                Assign Keywords
              </Link>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/metrics" ? "active" : ""}`} to="/metrics">
                  Metrics
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/books_data" ? "active" : ""}`} to="/books_data">
                Books
              </Link>
            </li>
          </ul>
          <button className='btn btn-outline-danger' onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
