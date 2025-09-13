import Link from 'next/link';
export default function Home() {
  return (
    <>
      <header>
        <h1>Welcome to macro.</h1>
      </header>
      <main>
            <div className="card">
              <h2>Some Cheeky Message</h2>
              <div className="button-group">
                <Link href="/questionnaire" className="button">Get Started</Link>
                <Link href="/login" className="button">Login</Link>
              </div>
            </div>
      </main>
    </>
  );
}