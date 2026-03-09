import fetch from "node-fetch";

async function hitApi() {
    try {
        const res = await fetch("http://localhost:5002/api/ar/invoices");
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
        
        // Let's also try catching the raw backend log
    } catch(e) {
        console.log("Fetch Error:", e);
    }
}
hitApi();
