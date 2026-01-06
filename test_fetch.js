const main = async () => {
    try {
        console.log("Fetching http://127.0.0.1:8000/api/portfolio/status...");
        const res = await fetch("http://127.0.0.1:8000/api/portfolio/status");
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Data:", JSON.stringify(data, null, 2));
        } else {
            console.log("Response not OK");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
