import os

def find_conflict_files():
    conflicts = []
    for root, dirs, files in os.walk('src/app'):
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        has_client = '"use client"' in content or "'use client'" in content
                        has_config = 'export const dynamic' in content or 'export const revalidate' in content
                        if has_client and has_config:
                            conflicts.append(path)
                except: pass
    return conflicts

if __name__ == "__main__":
    conflicts = find_conflict_files()
    for c in conflicts:
        print(c)
