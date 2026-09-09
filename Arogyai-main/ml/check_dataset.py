import os

DATASET_PATH = r"C:\Users\Vaibhavi\Downloads\Arogyai-main_finall\Arogyai-main\ml\Skin Disease Dataset\archive (5)\SkinDisease\SkinDisease"

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def count_images(folder):
    return sum(
        1
        for file in os.listdir(folder)
        if file.lower().endswith(VALID_EXTENSIONS)
    )


for split in ["train", "test"]:

    split_path = os.path.join(DATASET_PATH, split)

    print("\n" + "=" * 60)
    print(f"{split.upper()} DATASET")
    print("=" * 60)

    total = 0

    classes = sorted(
        folder
        for folder in os.listdir(split_path)
        if os.path.isdir(os.path.join(split_path, folder))
    )

    for class_name in classes:

        class_path = os.path.join(split_path, class_name)
        count = count_images(class_path)

        total += count

        print(f"{class_name:<30} {count:>6}")

    print("-" * 60)
    print(f"Number of classes : {len(classes)}")
    print(f"Total images      : {total}")