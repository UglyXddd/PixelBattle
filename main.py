from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, current_user, LoginManager, login_user, logout_user, login_required
from flask_mail import Mail, Message
from werkzeug.security import check_password_hash, generate_password_hash
from flask import jsonify
from datetime import datetime, timedelta
import json
from flask import request, session
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'your_secret_keys'  # Измените на ваш секретный ключ
app.config.from_pyfile('config.py')  # Используйте ваш файл конфигурации
db = SQLAlchemy(app)
login_manager = LoginManager(app)
mail = Mail(app)

# Создаем хэндлер, который записывает сообщения в файл
handler = RotatingFileHandler('logs/yourapp.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)

# Создание формата сообщений
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)

# Добавление хэндлера к основному приложению
app.logger.addHandler(handler)
# Определение модели данных для пользователей
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)
    score = db.Column(db.Integer, default=0)

    def __init__(self, username, email, password, is_admin=False):
        self.username = username
        self.email = email
        self.password = password
        self.is_admin = is_admin

    def __repr__(self):
        return f"<User {self.username}>"


# Модель данных для пиксельной доски
class Pixel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Integer, nullable=False)
    y = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(7), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('pixels', lazy=True))


class Messages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('Message', lazy=True))


# Модель
# данных для приватных областей
class PrivateArea(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    top_left_x = db.Column(db.Integer, nullable=False)
    top_left_y = db.Column(db.Integer, nullable=False)
    bottom_right_x = db.Column(db.Integer, nullable=False)
    bottom_right_y = db.Column(db.Integer, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    allowed_users = db.Column(db.String(255), nullable=True)

    owner = db.relationship('User', backref=db.backref('private_areas', lazy=True))


# Реализация функциональности Flask приложения
# Роуты для аутентификации и авторизации
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        texts = load_translations()
        if user and check_password_hash(user.password, password):
            login_user(user)
            app.logger.info(f"User {username} logged in successfully.")
            return redirect(url_for('test', is_admin=user.is_admin))
        else:
            error_message = "Неверные учетные данные. Пожалуйста, попробуйте снова."
            app.logger.warning(f"Login failed for user {username}: {error_message}")
            return render_template('login.html', error_message=error_message, texts=texts)

    texts = load_translations()
    return render_template('login.html', texts=texts)


@login_manager.user_loader
def load_user(user_id):
    # Return the user object based on the user ID
    return db.session.get(User, int(user_id))


# Роут для страницы регистрации
@app.route('/register', methods=['GET', 'POST'])
def register():
    error_message = None
    username = ''
    email = ''

    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if password != confirm_password:
            error_message = 'Пароли не совпадают'

        elif User.query.filter_by(username=username).first():
            error_message = 'Этот логин уже занят'

        elif User.query.filter_by(email=email).first():
            error_message = 'Эта почта уже используется'

        if not error_message:
            hashed_password = generate_password_hash(password)
            new_user = User(username=username, email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('login'))
    texts = load_translations()
    return render_template('register.html', error_message=error_message, username=username, email=email, texts=texts)


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    logout_user()  # Разлогиниваем пользователя
    return redirect(url_for('login'))  # Перенаправляем на страницу входа


# Роуты для рисования на пиксельной доске
@app.route('/draw', methods=['GET', 'POST'])
def draw():
    texts = load_translations()
    if current_user.is_authenticated:
        if current_user.is_banned:
            return render_template('banned.html', texts=texts)
    is_admin = request.args.get('is_admin', False)
    return render_template('painting.html', is_admin=is_admin, current_user=current_user, texts=texts)


# Роуты для рисования на пиксельной доске
@app.route('/', methods=['GET', 'POST'])
def test():
    texts = load_translations()
    if current_user.is_authenticated:
        if current_user.is_banned:
            return render_template('banned.html', texts=texts)
    is_admin = request.args.get('is_admin', False)
    return render_template('test.html', is_admin=is_admin, current_user=current_user, texts=texts)


# Административные функции
@app.route('/admin')
def admin_panel():
    # ...
    pass


def intersects(new_area, existing_area):
    """Проверка пересечения двух приватных областей"""
    return not (new_area['top_left_x'] > existing_area.bottom_right_x or
                new_area['bottom_right_x'] < existing_area.top_left_x or
                new_area['top_left_y'] > existing_area.bottom_right_y or
                new_area['bottom_right_y'] < existing_area.top_left_y)


@app.route('/create_private_area', methods=['POST'])
def create_private_area():
    data = request.get_json()
    new_area = {
        'top_left_x': data['top_left_x'],
        'top_left_y': data['top_left_y'],
        'bottom_right_x': data['bottom_right_x'],
        'bottom_right_y': data['bottom_right_y']
    }

    # Проверяем, не пересекается ли новый участок с уже существующими
    existing_areas = PrivateArea.query.all()
    for area in existing_areas:
        if intersects(new_area, area):
            return jsonify({'status': 'error', 'message': 'Новая приватная область пересекается с уже существующей.'}), 400

    # Если пересечений нет, добавляем новый приватный участок
    new_private_area = PrivateArea(**data)
    db.session.add(new_private_area)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Приватная область создана'})


def check_area_intersection(new_area):
    """Проверка пересечения новой области с существующими в базе."""
    existing_areas = PrivateArea.query.all()
    for area in existing_areas:
        if not (new_area['top_left_x'] > area.bottom_right_x or
                new_area['bottom_right_x'] < area.top_left_x or
                new_area['top_left_y'] > area.bottom_right_y or
                new_area['bottom_right_y'] < area.top_left_y):
            return True
    return False


@app.route('/private_area/manage/<int:area_id>', methods=['GET', 'POST'])
def manage_private_area(area_id):
    # ...
    pass


# Роут для отправки сообщения
@app.route('/send_message', methods=['POST'])
def send_message():
    if current_user.is_authenticated:
        data = request.json
        # Получаем текст сообщения из POST-запроса
        message_text = data['message']

        # Создаем объект сообщения и добавляем его в базу данных
        message = Messages(message=message_text, user_id=current_user.id)
        db.session.add(message)
        db.session.commit()

        # После успешной отправки сообщения перенаправляем пользователя обратно на страницу рисования
        return jsonify({'status': 'success'})
    else:
        # Если пользователь не авторизован, перенаправляем его на страницу входа
        return jsonify({'status': 'unauthorized'}), 401


# Роут для получения последних сообщений
@app.route('/get_messages')
def get_messages():
   # if current_user.is_authenticated:
        latest_messages = Messages.query.order_by(Messages.id.desc()).limit(100).all()
        messages_list = [{'username': message.user.username, 'message': message.message} for message in latest_messages]
        return jsonify(messages_list)
 #   else:
#        return jsonify([])


@app.route('/get_recent_pixels')
def get_recent_pixels():
    time_threshold = datetime.utcnow() - timedelta(seconds=5)  # Например, за последние 5 секунд
    recent_pixels = Pixel.query.filter(Pixel.timestamp > time_threshold).all()
    pixels_data = [{'x': pixel.x, 'y': pixel.y, 'color': pixel.color} for pixel in recent_pixels]
    return jsonify(pixels_data)


@app.route('/draw_pixel', methods=['POST'])
@login_required
def draw_pixel():
    # Получаем данные из запроса
    data = request.get_json()
    print("Received data:", data)  # Добавьте это для логирования
    x = data.get('x')
    y = data.get('y')
    color = data.get('color')

    try:
        # Проверяем, существует ли уже пиксель с заданными координатами
        existing_pixel = Pixel.query.filter_by(x=x, y=y).first()

        if existing_pixel:
            # Если пиксель уже существует, обновляем его цвет и пользователя
            existing_pixel.color = color
            existing_pixel.user_id = current_user.id
        else:
            # Если пиксель не существует, создаем новую запись
            new_pixel = Pixel(x=x, y=y, color=color, user_id=current_user.id)
            db.session.add(new_pixel)

        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Pixel updated or created'})
    except Exception as e:
        # В случае ошибки возвращаем сообщение об ошибке
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/toggle_admin_status/<int:user_id>', methods=['POST'])
@login_required
def toggle_admin_status(user_id):
    if not current_user.is_admin:
        return jsonify({'status': 'error', 'message': 'Недостаточно прав'}), 403

    user = User.query.get(user_id)
    if user:
        user.is_admin = not user.is_admin
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Статус обновлен', 'is_admin': user.is_admin})
    return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404


# Новая функция для массового добавления пикселей
@app.route('/draw_pixels', methods=['POST'])
@login_required
def draw_pixels():
    data = request.get_json()
    pixels = data.get('pixels', [])

    try:
        for pixel_data in pixels:
            x = pixel_data.get('x')
            y = pixel_data.get('y')
            color = pixel_data.get('color')

            existing_pixel = Pixel.query.filter_by(x=x, y=y).first()

            if existing_pixel:
                existing_pixel.color = color
                existing_pixel.user_id = current_user.id
            else:
                new_pixel = Pixel(x=x, y=y, color=color, user_id=current_user.id)
                db.session.add(new_pixel)

        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Пиксели успешно сохранены'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/get_pixels')
def get_pixels():
    all_pixels = Pixel.query.all()
    pixels_data = [{'x': pixel.x, 'y': pixel.y, 'color': pixel.color} for pixel in all_pixels]
    return jsonify(pixels_data)


@app.route('/update_score', methods=['POST'])
@login_required
def update_score():
    user = current_user
    data = request.get_json()
    x, y, color = data['x'], data['y'], data['color']

    # Логика определения, чей это был пиксель и обновления счета
    pixel = Pixel.query.filter_by(x=x, y=y).first()
    if pixel:
        if pixel.user_id != user.id:
            user.score += 2 # Закрашиваем чужой пиксель
        # Если пиксель уже принадлежит пользователю, счет не изменяется
    else:
        user.score += 1  # Закрашиваем ничейный пиксель

    db.session.commit()
    return jsonify({'status': 'success', 'score': user.score})


@app.route('/get_score')
@login_required
def get_score():
    print(current_user)
    user = current_user
    return jsonify({'score': user.score})


@app.template_filter('nl2br')
def nl2br(s):
    return s.replace('\n', '<br>\n')


@app.route('/decrease_scores')
def decrease_scores():
    users = User.query.all()
    for user in users:
        if user.score > 0:
            user.score -= 1
    db.session.commit()
    return jsonify({'status': 'success'})


@app.route('/get_pixel_info')
def get_pixel_info():
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)

    pixel = Pixel.query.filter_by(x=x, y=y).first()
    if pixel:
        user = User.query.get(pixel.user_id)
        if user:
            return jsonify({'status': 'success', 'info': {'userId': user.id, 'username': user.username, 'email': user.email}})
    return jsonify({'status': 'error', 'message': 'Pixel not found'})


@app.route('/ban_user/<int:user_id>', methods=['POST'])
def ban_user(user_id):
    if not current_user.is_admin:  # Проверяем, является ли текущий пользователь администратором
        return jsonify({'status': 'error', 'message': 'Недостаточно прав'}), 403
    if (user_id == 9):
        return
    print(user_id)
    print("_+_+_+_+_+_+_+_+_+")
    print(current_user)
    print(current_user.id)
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404

    user.is_banned = True
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Пользователь заблокирован'})


@app.route('/clear_area', methods=['POST'])
def clear_area():
    if not current_user.is_admin:  # Проверяем, что пользователь - администратор
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    data = request.get_json()
    minX = data['minX']
    minY = data['minY']
    maxX = data['maxX']
    maxY = data['maxY']
    print(minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n",minX, minY, maxX, maxY, "\n")
    try:
        # Удалить записи из базы данных для выбранной области
        Pixel.query.filter(
            Pixel.x >= minX,
            Pixel.x <= maxX,
            Pixel.y >= minY,
            Pixel.y <= maxY
        ).delete()

        db.session.commit()
        return jsonify({'status': 'success', 'message': f'Area cleared from ({minX}, {minY}) to ({maxX}, {maxY})'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


def load_translations():
    lang = session.get('lang', 'ru')  # Считываем язык из сессии, по умолчанию 'ru'
    try:
        with open(f'translations/{lang}.json', 'r', encoding='utf-8') as lang_file:
            translations = json.load(lang_file)
            return translations
    except FileNotFoundError:
        return {}


# Сохранение выбранного языка
@app.route('/set_language')
def set_language():
    lang = request.args.get('lang', 'ru')  # Получаем язык из запроса
    session['lang'] = lang
    return redirect(request.referrer)


@app.route('/get_private_areas')
def get_private_areas():
    # Получаем все приватные области из базы данных
    private_areas = PrivateArea.query.all()
    # Формируем список для отправки данных в формате JSON
    private_areas_data = [{
        'id': area.id,
        'top_left_x': area.top_left_x,
        'top_left_y': area.top_left_y,
        'bottom_right_x': area.bottom_right_x,
        'bottom_right_y': area.bottom_right_y,
        'owner_id': area.owner_id,
        'allowed_users': area.allowed_users
    } for area in private_areas]

    # Отправляем данные обратно клиенту в формате JSON
    return jsonify({'privateAreas': private_areas_data})


# Маршрут для удаления приватной области
@app.route('/delete_private_area/<int:area_id>', methods=['POST'])
def delete_private_area(area_id):
    area = PrivateArea.query.get(area_id)
    if area:
        db.session.delete(area)
        db.session.commit()
        return jsonify(status='success')
    return jsonify(status='error', message='Area not found')


@app.route('/get_user_id', methods=['GET'])
def get_user_id():
    login = request.args.get('login')
    user = User.query.filter_by(username=login).first()
    if user:
        return jsonify({'status': 'success', 'userId': user.id})
    else:
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404


# Маршрут для получения списка пользователей
@app.route('/get_users')
def get_users():
    users = User.query.all()
    return jsonify(users=[{
        'id': user.id,
        'username': user.username,
        'is_banned': user.is_banned,
        'is_admin': user.is_admin
    } for user in users])


@app.route('/get-texts')
def get_texts():
    texts = load_translations()
    return jsonify(texts)


# Маршрут для обновления статуса пользователя
@app.route('/update_user_status/<int:user_id>', methods=['POST'])
def update_user_status(user_id):
    print(current_user)
    print(user_id)
    print(current_user.id)
    user = User.query.get(user_id)
    if(user_id == current_user.id):
        return jsonify(status='error', message='YOU CANT BAN YOURSELF!!')
    if(user_id == 9):
        return jsonify(status='error', message='YOU CANT BAN MIRON')
    if user:
        user.is_banned = not user.is_banned
        db.session.commit()
        return jsonify(status='success')
    return jsonify(status='error', message='User not found')


# Создаем контекст приложения
with app.app_context():
    # Создаем все таблицы, если их еще нет
    db.create_all()


# Дополнительные функции и роуты по необходимости
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

