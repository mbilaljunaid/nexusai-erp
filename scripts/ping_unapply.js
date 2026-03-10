fetch("http://localhost:5002/api/ar/applications/123e4567-e89b-12d3-a456-426614174000/unapply", { method: "POST" })
    .then(res => res.text())
    .then(text => console.log("RESPONDED:", text))
    .catch(err => console.error("FAILED:", err));
