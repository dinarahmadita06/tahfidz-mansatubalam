import os

def fix_pages(root_dir):
    for root, dirs, files in os.walk(root_dir):
        # Only process files in src/app but not in src/app/api
        if "api" in root.split(os.sep):
            continue
            
        for file in files:
            if file in ["page.js", "layout.js"]:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    if not lines:
                        continue
                        
                    content = "".join(lines)
                    
                    # Check if it uses dynamic features
                    needs_dynamic = "auth(" in content or "headers(" in content or "cookies(" in content or "request.url" in content
                    
                    if needs_dynamic:
                        # Check if force-dynamic is already there
                        has_dynamic = "export const dynamic = 'force-dynamic'" in content or "export const dynamic = \"force-dynamic\"" in content
                        
                        if not has_dynamic:
                            print(f"Fixing {file_path}")
                            
                            # Remove existing dynamic/revalidate lines if they exist
                            new_lines = []
                            for line in lines:
                                if "export const dynamic =" in line or "export const revalidate =" in line:
                                    continue
                                new_lines.append(line)
                            
                            # Insert at the top (after potential 'use client')
                            insert_idx = 0
                            if new_lines and "'use client'" in new_lines[0] or '"use client"' in new_lines[0]:
                                insert_idx = 1
                            
                            new_lines.insert(insert_idx, "export const dynamic = 'force-dynamic';\n")
                            new_lines.insert(insert_idx + 1, "export const revalidate = 0;\n")
                            
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.writelines(new_lines)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_pages("src/app")
