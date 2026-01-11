import os

def fix_all_protected_pages(root_dir):
    protected_dirs = ["admin", "guru", "siswa", "orangtua"]
    
    for root, dirs, files in os.walk(root_dir):
        rel_path = os.path.relpath(root, root_dir)
        path_parts = rel_path.split(os.sep)
        
        # Check if we are in a protected directory
        is_protected = any(part in protected_dirs for part in path_parts)
        
        if not is_protected:
            continue
            
        # Skip API routes
        if "api" in path_parts:
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
                    
                    # Check if it's a client component
                    is_client = "'use client'" in content or '"use client"' in content
                    
                    # Even client components can benefit from force-dynamic if they use dynamic hooks at top level,
                    # but usually it's Server Components that cause build errors.
                    
                    # If it's a Server Component, mark it dynamic
                    if not is_client:
                        has_dynamic = "export const dynamic = 'force-dynamic'" in content or "export const dynamic = \"force-dynamic\"" in content
                        
                        if not has_dynamic:
                            print(f"Fixing Server Component: {file_path}")
                            
                            # Remove existing dynamic/revalidate lines if they exist
                            new_lines = []
                            for line in lines:
                                if "export const dynamic =" in line or "export const revalidate =" in line:
                                    continue
                                new_lines.append(line)
                            
                            # Insert at the top
                            new_lines.insert(0, "export const dynamic = 'force-dynamic';\n")
                            new_lines.insert(1, "export const revalidate = 0;\n")
                            
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.writelines(new_lines)
                    else:
                        # For client components, we usually don't need it, but if they are pages
                        # and they use searchParams, they might need it or Suspense.
                        # For now, let's focus on Server Components.
                        pass
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_all_protected_pages("src/app")
