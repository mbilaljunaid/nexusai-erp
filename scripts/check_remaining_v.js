import * as fs from "fs";

const filePaths = JSON.parse(fs.readFileSync("category_v_violations.json", "utf-8"));
const remaining = [];

for (const filePath of filePaths) {
    const text = fs.readFileSync(filePath, "utf-8");
    if (text.includes("Previous") && text.includes("Next") && text.includes("Button") && !text.includes("<Pagination ")) {
        remaining.push(filePath);
    }
}

console.log("Remaining files:", remaining);
