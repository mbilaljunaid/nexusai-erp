import * as schema from "../shared/schema/index";
console.log("Schema keys count:", Object.keys(schema).length);
console.log("Example keys:", Object.keys(schema).slice(0, 10));
console.log("Scanning for constructionContracts:", "constructionContracts" in schema);
console.log("Scanning for procureRfqLines:", "procureRfqLines" in schema || "procure_rfq_lines" in schema);
console.log("Scanning for glEntries:", "glEntries" in schema || "gl_entries" in schema);
