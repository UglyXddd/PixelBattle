import os
from PIL import Image

# Папки, содержащие изображения
input_folders = ["ocean16", "ocean32"]

# Функция для уменьшения изображения вдвое, сохраняя исходное разрешение
def downscale_and_restore_resolution(image):
    # Получаем размеры исходного изображения
    original_width, original_height = image.size
    # Уменьшаем размер вдвое
    reduced_image = image.resize((original_width // 8, original_height // 8), Image.LANCZOS)
    # Восстанавливаем исходное разрешение
    restored_image = reduced_image.resize((original_width, original_height), Image.LANCZOS)
    return restored_image

# Проходим по каждой указанной папке
for input_folder in input_folders:
    # Проверяем, существует ли папка
    if not os.path.exists(input_folder):
        print(f"Папка {input_folder} не найдена, пропуск...")
        continue

    # Проходим по всем подкаталогам и файлам внутри каждой папки
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if file.lower().endswith((".png", ".jpg", ".jpeg")):
                file_path = os.path.join(root, file)
                try:
                    # Открываем изображение
                    with Image.open(file_path) as img:
                        print(f"Обрабатывается {file_path}")

                        # Уменьшаем и восстанавливаем изображение
                        processed_image = downscale_and_restore_resolution(img)

                        # Сохраняем обратно в тот же файл
                        processed_image.save(file_path)
                        print(f"Изображение сохранено {file_path}")

                except Exception as e:
                    print(f"Ошибка обработки {file_path}: {e}")

print("Процесс завершен.")
