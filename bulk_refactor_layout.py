import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if any(wrapper in content for wrapper in ['StandardPage', 'StandardDashboard', 'ModulePageTemplate', 'IndustryPageTemplate', 'AdminLayout', 'DashboardLayout', 'SidebarLayout']):
        return False

    if not ('export default function' in content or 'export default const' in content or 'export const' in content):
        return False
        
    if 'LoginPage' in filepath or 'SignupPage' in filepath:
        return False

    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    if not title_match:
        return False
        
    title_raw = title_match.group(1).strip()
    title = re.sub(r'<[^>]+>', '', title_raw).strip()
    title = re.sub(r'\s+', ' ', title).replace('"', '&quot;').replace('{', '&#123;').replace('}', '&#125;')

    import_statement = 'import { StandardPage } from "@/components/layout/StandardPage";\n'
    
    new_content = content
    if 'from "@/components/layout/StandardPage"' not in new_content:
        imports = list(re.finditer(r'^import .*?;$', new_content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            new_content = new_content[:last_import.end()] + '\n' + import_statement + new_content[last_import.end():]
        else:
            new_content = import_statement + new_content

    # Find the last `return (` followed by a div wrapper
    # Using a relaxed regex to match typical containers
    pattern = r'(return\s*\(\s*)<div\s+className="[^"]*(?:space-y-[0-9]|p-[0-9]|gap-[0-9]|flex-col)[^"]*"[^>]*>'
    return_matches = list(re.finditer(pattern, new_content))
    
    if not return_matches:
        # Maybe it's missing the className entirely but it's the root? Be safe and only match classes we know represent root pages
        return False
        
    root_div_match = return_matches[-1]

    start_idx = root_div_match.end(1)
    end_idx = root_div_match.end()
    
    standard_page_open = f'<StandardPage title="{title}">'
    
    new_content = new_content[:start_idx] + standard_page_open + new_content[end_idx:]

    last_div_idx = new_content.rfind('</div>')
    if last_div_idx != -1:
        new_content = new_content[:last_div_idx] + '</StandardPage>' + new_content[last_div_idx+6:]
    else:
        return False

    # Remove the H1 exactly
    # Must search again because string changed
    new_title_match = re.search(r'<h1[^>]*>.*?</h1>', new_content, re.DOTALL)
    if new_title_match:
        new_content = new_content[:new_title_match.start()] + new_content[new_title_match.end():]

    with open(filepath, 'w') as f:
        f.write(new_content)
    return True

if __name__ == "__main__":
    pages_dir = "src/pages"
    files = glob.glob(f"{pages_dir}/**/*.tsx", recursive=True)
    
    processed = 0
    for f in files:
        if "node_modules" in f: continue
        try:
            if process_file(f):
                print(f"Refactored {f}")
                processed += 1
        except Exception as e:
            pass
            
    print(f"Successfully processed {processed} files.")
