import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # Fix the .find() formatNumber(.amount) glitch
    if "formatNumber(.amount)" in content:
        content = content.replace(
            ")formatNumber(.amount)",
            ")?.amount)"
        )
        # We need to wrap it inside formatNumber. 
        # original was: `$${preview.allocations.find((a: any) => a.projectId === row.projectId)formatNumber(.amount)}`
        content = content.replace(
            "`$${preview.allocations.find((a: any) => a.projectId === row.projectId)?.amount)}`",
            "`$${formatNumber(preview.allocations.find((a: any) => a.projectId === row.projectId)?.amount)}`"
        )
        
    # Fix trailing ? inside formatNumber, formatCurrency, formatPercent
    content = re.sub(r'(formatNumber|formatCurrency|formatPercent)\(([^()]+)\?\)', r'\1(\2)', content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

print(f"Residuals fixed in {files_modded} files")
