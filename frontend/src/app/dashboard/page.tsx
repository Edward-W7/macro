"use client";
// --- No login test code ---
export default function Dashboard() {
  return (
    <main>
      <div className="card">
        <h2>Welcome to your dashboard!</h2>
        <p>You are now logged in. Here you can view your meal suggestions:</p>

        {/* Quick summary of your macro goals */}

        {/* List of meals presented nicely with a lock button next to it*/}

        {/* click to expand for full macro information on all meals*/}

        {/* quick text that says whether you're meeting your goals */}

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '1.5rem' }}>
          <button
            className="button button-small"
            onClick={e => {
              alert('Rerolling meals! (implement logic here)');
              e.currentTarget.blur();
            }}
          >
            🔄 Reroll
          </button>
        </div>
      </div>
    </main>
  );
}


// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// // Dummy authentication check (replace with real logic)
// function isAuthenticated() {
//   if (typeof window === "undefined") return false;
//   // Example: check for a token in sessionStorage
//   return !!sessionStorage.getItem("authToken");
// }

// import { useState } from "react";

// export default function Dashboard() {
//   const router = useRouter();
//   const [authChecked, setAuthChecked] = useState(false);
//   const [authed, setAuthed] = useState(false);

//   useEffect(() => {
//     const authed = isAuthenticated();
//     setAuthed(authed);
//     setAuthChecked(true);
//     if (!authed) {
//       router.replace("/login");
//     }
//   }, [router]);

//   if (!authChecked) {
//     return null; // or a loading spinner/message
//   }
//   if (!authed) {
//     return null;
//   }
//   return (
//     <main>
//       <div className="card">
//         <h2>Welcome to your dashboard!</h2>
//         <p>You are now logged in. Here you can view your macro targets and track your progress.</p>
//         {/* Add more dashboard content here */}
//       </div>
//     </main>
//   );
// }
