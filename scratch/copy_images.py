import os
import shutil
import re

source_dir = r"C:\Users\USER\.gemini\antigravity\brain\44f6cad5-435b-420c-9433-1585c21b403e"
dest_dir = r"c:\Users\USER\Desktop\food\assets\images"

# Ensure destination exists
os.makedirs(dest_dir, exist_ok=True)

# List files
files = os.listdir(source_dir)
print(f"Listing {len(files)} files in source directory...")

mappings = {
    r"pizza_login_bg.*\.png$": "pizza_login_bg.png",
    r"pizza_margherita.*\.png$": "pizza_margherita.png",
    r"pizza_pepperoni.*\.png$": "pizza_pepperoni.png",
    r"pizza_veggie.*\.png$": "pizza_veggie.png",
    r"pizza_bbq_chicken.*\.png$": "pizza_bbq_chicken.png",
    r"pizza_seafood.*\.png$": "pizza_seafood.png",
    r"pizza_four_cheese.*\.png$": "pizza_four_cheese.png",
    r"pizza_super_supreme.*\.png$": "pizza_super_supreme.png",
    r"pizza_mushroom.*\.png$": "pizza_mushroom.png",
    r"pizza_hot_dog.*\.png$": "pizza_hot_dog.png",
    r"tomato_icon.*\.png$": "tomato_icon.png"
}

copied_count = 0
for file in files:
    for pattern, new_name in mappings.items():
        if re.match(pattern, file):
            src_path = os.path.join(source_dir, file)
            dest_path = os.path.join(dest_dir, new_name)
            shutil.copy2(src_path, dest_path)
            print(f"Copied: {file} -> {new_name}")
            copied_count += 1
            break

print(f"Copying complete. Total copied: {copied_count} files.")
