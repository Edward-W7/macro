"use client";
import { useRouter } from "next/navigation";

export default function Questionnaire() {
  const router = useRouter();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/register");
  }
  return (
    <main>
      <div className="card">
        <h2>Tell us more about yourself.</h2>
        <p>All of your information will be kept confidential and will only be used for the purpose of determining your macro nutrition targets.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
          <label className="form-label-row">
            <span>Enter your height (in inches):</span>
            <input type="number" name="height" min="0" step="1" className="input" style={{ width: '8rem' }} defaultValue={67} />
          </label>
          <label className="form-label-row">
            <span>Enter your weight (in pounds):</span>
            <input type="number" name="weight" min="0" step="1" className="input" style={{ width: '8rem' }} defaultValue={150} />
          </label>

          <label style={{ width: '100%' }}> 
            Tell us more about your nutrition goals:
            <textarea name="about" rows={4} className="input-textarea" />
          </label>
          <div className="button-group">
            {/* This will need some backend queries */}
            <button type="submit" className="button">Submit</button>
          </div>
        </form>
      </div>
    </main>
  );
}
