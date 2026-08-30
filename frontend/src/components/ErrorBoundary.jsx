import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error?.message || 'Something went wrong.' };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section page-top">
          <div className="container">
            <div className="alert alert-error">
              <h3>Oops, something went wrong.</h3>
              <p>
                Something unexpected happened while rendering this page. Please reload
                the page. If the problem continues, first sign out and sign back in
                (this clears your saved session).
              </p>
              <button
                type="button"
                className="button button-primary form-submit"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}