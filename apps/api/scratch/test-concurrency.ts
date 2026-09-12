const API_URL = "http://localhost:5000/api";
let counterId = "";

const runTests = async () => {
  try {
    console.log("🚀 Testing Backend Concurrency & Flow...");

    // 1. Register a test user
    const email = `testuser${Date.now()}@example.com`;
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email,
        password: "password123",
        confirmPassword: "password123",
      })
    });
    
    const cookie = res.headers.get("set-cookie") || "";
    
    // 2. Login as admin to get counters
    const adminRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dilipmotive@gmail.com",
        password: "ELITEADMIN@2026",
      })
    });
    const adminCookie = adminRes.headers.get("set-cookie") || "";

    // 3. Get Counters
    const countersRes = await fetch(`${API_URL}/counters`, {
      headers: { Cookie: cookie || adminCookie },
    });
    const countersData = await countersRes.json();
    const counter = countersData.data.find((c: any) => c.prefix === "A");
    counterId = counter.id;

    console.log(`✅ Fetched counter ${counter.name}`);

    // 4. Concurrency Test
    console.log(`⚡ Sending 10 concurrent generate token requests...`);
    
    const userCookies = [];
    for (let i = 0; i < 10; i++) {
        const uRes = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `u${Date.now()}_${i}@example.com`,
            password: "password123",
            confirmPassword: "password123",
          })
        });
        userCookies.push(uRes.headers.get("set-cookie") || "");
    }

    const promises = userCookies.map(c => 
      fetch(`${API_URL}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: c },
        body: JSON.stringify({ counterId })
      }).then(r => r.json()).then(data => data.success ? data.data.tokenNumber : data.message)
    );

    const results = await Promise.all(promises);
    console.log("Tokens generated:", results.sort());
    
    const unique = new Set(results);
    if (unique.size === results.length && !results.some(r => r.includes("already have an active"))) {
      console.log("✅ Concurrency test PASSED: No duplicate tokens generated.");
    } else {
      console.log("❌ Concurrency test FAILED or active token limit triggered.");
    }

  } catch (error: any) {
    console.error("❌ Test Failed:", error.message);
  }
};

runTests();
