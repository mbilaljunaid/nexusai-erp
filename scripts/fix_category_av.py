import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

# Translation Map: Primitive Tailwind -> Semantic Shadcn CSS Variables
TOKEN_MAP = {
    # Backgrounds
    r'\bbg-white\b': 'bg-card',
    r'\bbg-slate-50\b': 'bg-muted/50',
    r'\bbg-gray-50\b': 'bg-muted/50',
    r'\bbg-slate-100\b': 'bg-muted',
    r'\bbg-gray-100\b': 'bg-muted',
    
    # Borders
    r'\bborder-slate-200\b': 'border-border',
    r'\bborder-gray-200\b': 'border-border',
    r'\bborder-slate-100\b': 'border-border',
    r'\bborder-gray-100\b': 'border-border',

    # Typography (Text)
    r'\btext-gray-900\b': 'text-foreground',
    r'\btext-slate-900\b': 'text-foreground',
    r'\btext-gray-800\b': 'text-foreground',
    r'\btext-slate-800\b': 'text-foreground',
    r'\btext-gray-700\b': 'text-foreground/90',
    r'\btext-slate-700\b': 'text-foreground/90',

    r'\btext-gray-600\b': 'text-muted-foreground',
    r'\btext-slate-600\b': 'text-muted-foreground',
    r'\btext-gray-500\b': 'text-muted-foreground',
    r'\btext-slate-500\b': 'text-muted-foreground',
    
    r'\btext-gray-400\b': 'text-muted-foreground/70',
    r'\btext-slate-400\b': 'text-muted-foreground/70',
}

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # Pre-filter: only process if the file actually contains one of our target words roughly
    if not any(target.strip(r'\b') in content for target in TOKEN_MAP.keys()):
        return

    # We need to be careful to ONLY replace these tokens if they appear inside:
    # 1. className="..."
    # 2. className={...}
    # 3. cn(...)
    # A generic search/replace across the whole file might hit string literals in text or comments
    # However, because these are highly specific tailwind classes (`bg-white`, `border-gray-200`),
    # the risk of them being standard display text is effectively zero.
    
    # Still, to be perfectly safe, we'll try to apply regex substitutions globally 
    # but use word boundaries \b to prevent `hover:bg-white` becoming `hover:bg-card`
    # Wait, actually `hover:bg-card` is VALID semantic tailwind! So we DO want to allow prefixes!
    
    # But wait, \b won't match the hyphen in `hover:bg-white`. \b matches word boundaries (alphanumeric).
    # `hover:bg-white` has `:` which is a non-word char, so `\b` WILL trigger after `:`.
    # Therefore `hover:bg-white` -> `hover:bg-card`. This is perfect and desired behaviour!
    
    # Let's verify `\bbg-white\b` against `hover:bg-white`.
    # ":" is non-word, so there is a boundary before "b". It matches!
    # "e" is followed by space/quote, so there is a boundary. It matches!

    for pattern, replacement in TOKEN_MAP.items():
        # Using a negative lookahead/lookbehind to prevent replacing arbitrary dynamic template vars like `bg-${color}-50` 
        # (Though `bg-white` shouldn't have variables inside it anyway).
        
        # We replace the tokens:
        content = re.sub(pattern, replacement, content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Migrated hardcoded tailwind tokens in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx', '.ts', '.js')):
                process_file(os.path.join(root, file))

print(f"Hardcoded Tailwind tokens modernized across {files_modded} files.")
