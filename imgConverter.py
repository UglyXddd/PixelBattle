from PIL import Image
import os


def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)


def combine_and_downscale_images(base_path, output_path):
    # Создание выходного каталога
    create_directory(output_path)

    # Размер каждого изображения в новой папке
    img_size = 1024  # Размер изображений после предыдущего уменьшения

    # Проходимся по сетке 0..15 с шагом 2, учитывая уменьшенное количество изображений
    for i in range(0, 16, 2):
        for j in range(0, 16, 2):
            # Создаем новое большое изображение
            new_image = Image.new('RGB', (img_size * 4, img_size * 4))

            # Загружаем и добавляем 4 изображения в новое большое изображение
            paths = [
                f"{base_path}/{i}/{j}.png",  # верхний левый
                f"{base_path}/{i}/{j + 1}.png",  # верхний правый
                f"{base_path}/{i}/{j + 2}.png",  # верхний правый
                f"{base_path}/{i}/{j + 3}.png",  # верхний правый
                f"{base_path}/{i + 1}/{j}.png",  # нижний левый
                f"{base_path}/{i + 1}/{j + 1}.png"  # нижний правый
                f"{base_path}/{i + 1}/{j + 2}.png"  # нижний правый
                f"{base_path}/{i + 1}/{j + 3}.png"  # нижний правый
                f"{base_path}/{i + 2}/{j}.png",  # нижний левый
                f"{base_path}/{i + 2}/{j + 1}.png"  # нижний правый
                f"{base_path}/{i + 2}/{j + 2}.png"  # нижний правый
                f"{base_path}/{i + 2}/{j + 3}.png"  # нижний правый
                f"{base_path}/{i + 3}/{j}.png",  # нижний левый
                f"{base_path}/{i + 3}/{j + 1}.png"  # нижний правый
                f"{base_path}/{i + 3}/{j + 2}.png"  # нижний правый
                f"{base_path}/{i + 3}/{j + 3}.png"  # нижний правый
            ]
            positions = [(0, 0), (img_size, 0), (0, img_size), (img_size, img_size)]
            print(f"Combining images: {paths}")  # Вывод информации о процессе объединения
            for (file_path, (x, y)) in zip(paths, positions):
                if os.path.exists(file_path):
                    img = Image.open(file_path)
                    new_image.paste(img, (x, y))

            # Уменьшаем размер изображения в два раза
            new_image = new_image.resize((img_size, img_size), Image.Resampling.LANCZOS)

            # Вычисляем индекс для сохранения
            folder_index = i // 3
            image_index = j // 3
            output_folder = f"{output_path}/{folder_index}"
            create_directory(output_folder)

            # Сохраняем изображение
            new_image.save(f"{output_folder}/{image_index}.png")
            print(
                f"Saved combined image to {output_folder}/{image_index}.png")  # Вывод информации о сохранении изображения


# Запускаем функцию
base_path = "static/img/ocean"
output_path = "static/img/ocean8"
combine_and_downscale_images(base_path, output_path)
