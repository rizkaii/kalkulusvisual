export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="swiss-grid">
          <div className="col-span-8">
            <div className="text-sm text-muted-foreground">
              <p data-testid="footer-purpose">
                <a
                  href="https://www.instagram.com/rzllri/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    border: '2px solid black',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#007bff'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'red'}
                >
                  CLICK FOR CONTACT DEVELOPER
                </a>
              </p>
              {/* <p className="mb-2" data-testid="footer-description">
                Educational mathematics visualization tool by @rizallazuardi.
              </p> */}

            </div>
          </div>
          <div className="col-span-4 text-right">
            <div className="text-sm">
              <div className="font-medium" data-testid="footer-title">CALCULUS VISUAL EXPLORER</div>
              <div className="text-muted-foreground" data-testid="footer-version">Version 1.0</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
