import os
import re

directories = ["src/pages", "src/components"]

for d in directories:
    for root, _, files in os.walk(d):
        if 'components/ui' in root: continue
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'): continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            is_dialog = 'DialogContent' in content or 'SheetContent' in content
            if not is_dialog: continue
            
            # Print any block matching the div flex justify-end pattern
            pattern = re.compile(r'<div\s+className="([^"]*(?:justify-end)[^"]*)"[^>]*>.*?</div>', re.DOTALL)
            for match in pattern.finditer(content):
                block = match.group(0)
                if ('<Button' in block or '<button' in block) and block.count('<div') < 3 and len(block) < 1000:
                    print(f"File: {filepath}")
                    print(block)
                    print("-" * 40)
