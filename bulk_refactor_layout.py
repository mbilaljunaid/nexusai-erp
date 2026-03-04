import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if any(wrapper in content for wrapper in ['StandardPage', 'StandardDashboard', 'ModulePageTemplate', 'IndustryPageTemplate', 'AdminLayout', 'DashboardLayout']):
        return False

    if not ('export default function' in content or 'export default const' in content or 'export const' in content):
        return False

    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    if not title_match:
        return False
        
    title_raw = title_match.group(1).strip()
    title = re.sub(r'<[^>]+>', '', title_raw).strip()

    import_statement = 'import { StandardPage } from "@/components/layout/StandardPage";\n'
    
    new_content = content
    if 'from "@/components/layout/StandardPage"' not in new_content:
        imports = list(re.finditer(r'^import .*?;$', new_content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            new_content = new_content[:last_import.end()] + '\n' + import_statement + new_content[last_import.end():]
        else:
            new_content = import_statement + new_content

    # Find the main return statement's opening tag
    return_match = re.search(r'return\s*\(\s*(<div[^>]*>)', new_content)
    if not return_match:
        return False
        
    start_idx = return_match.start(1)
    
    # We will replace the first <div...> with <StandardPage title="...">
    # and find its matching closing </div> to replace with </StandardPage>
    
    # Count divs to find the matching closing tag
    div_count = 0
    i = start_idx
    end_idx = -1
    
    while i < len(new_content):
        if new_content[i:i+4] == '<div':
            div_count += 1
            i += 4
        elif new_content[i:i+6] == '</div>':
            div_count -= 1
            if div_count == 0:
                end_idx = i
                break
            i += 6
        else:
            i += 1
            
    if end_idx == -1:
        return False
        
    # Replace closing first
    new_content = new_content[:end_idx] + '</StandardPage>' + new_content[end_idx+6:]
    
    # Replace opening
    open_tag = return_match.group(1)
    replacement = f'<StandardPage title="{title}">'
    new_content = new_content[:start_idx] + replacement + new_content[start_idx + len(open_tag):]

    # Delete the H1
    h1_full = title_match.group(0)
    new_content = new_content.replace(h1_full, '')

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
            print(f"Error processing {f}: {e}")
            
    print(f"Successfully processed {processed} files.")
