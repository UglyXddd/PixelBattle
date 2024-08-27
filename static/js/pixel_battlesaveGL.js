document.addEventListener('DOMContentLoaded', function() {

    let drawingPrivateXcordOne = 0;
    let drawingPrivateYcordOne = 0;
    let drawingPrivateXcordTwo = 0;
    let drawingPrivateYcordTwo = 0;
    let drawingClearXcordOne = 0;
    let drawingClearYcordOne = 0;
    let drawingClearXcordTwo = 0;
    let drawingClearYcordTwo = 0;
    let currentColor = '#000000';
    let userScore = 0;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isDrawing = false;
    let drawnPixels = []; // Массив для хранения нарисованных пикселей
    console.log("DOM полностью загружен и разобран");
    const gridSize = 10; // Размер одной ячейки сетки
    const canvas = document.getElementById('drawing-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Вершинный шейдер, который просто передает данные во фрагментный шейдер
    const vertexShaderSource = `
        attribute vec2 position;
        uniform mat3 u_matrix;
        void main() {
            gl_Position = vec4((u_matrix * vec3(position, 1)).xy, 0, 1);
        }
    `;

    // Фрагментный шейдер, который окрашивает все в единый цвет
    const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 color;
        void main() {
            gl_FragColor = color;
        }
    `;

    // Функция для создания шейдера
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('Ошибка компиляции шейдера: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Функция для создания шейдерной программы
    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert('Ошибка связывания программы: ' + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    // Создаем шейдеры
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Создаем шейдерную программу
    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

    // Включаем прозрачность для текстур
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const imageCache = new Array(32).fill().map(() => new Array(32)); // Кэш для изображений

    let redrawScheduled = true;
    function loadImage(row, col) {
        if (imageCache[row][col]) {
            return; // Изображение уже загружено
        }

        const formattedRow = row.toString().padStart(2, '0');
        const formattedCol = col.toString().padStart(2, '0');
        const img = new Image();
        img.src = `/static/img/ocean/${col}/${row}.png`;
        img.onload = () => {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            imageCache[row][col] = texture;
            if (redrawScheduled) redraw();
            redrawScheduled = false;
        };
    }

    function drawImageFromCache(texture, col, row) {
        const x = col * 2048;
        const y = row * 2048;
        // Здесь код для установки шейдера и отрисовки текстуры
        // Обычно это делается с использованием вершинных и фрагментных шейдеров
    }

    function loadAllImages() {
        for (let row = 0; row < 32; row++) {
            for (let col = 0; col < 32; col++) {
                loadImage(row, col);
            }
        }
    }

    loadAllImages();
});

























fetchPrivateAreas();
function updateCoordsAndPrivatInfo(x, y) {
    // Получение элементов DOM для вывода информации
    var coordsElement = document.getElementById('coords');
    // Обновление информации на странице
    if(coordsElement) coordsElement.textContent = `X: ${x}, Y: ${y}`;
}

closeAlertButton.addEventListener('click', function() {
    alertBox.classList.add('hidden');
});

closePrivateAlertButton.addEventListener('click', function() {
    alertPrivateBox.classList.add('hidden');
});

// Функция для показа таблички
function showAlert() {
    alertBox.classList.remove('hidden');
}

// Функция для показа таблички о привате
function showPrivateAlert() {
    alertPrivateBox.classList.remove('hidden');
}

// Инициализация канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();  // Вызов функции перерисовки сцены
});

colors.forEach(color => {
    color.addEventListener('click', function() {
        // Удаляем класс 'active' с предыдущего активного цвета
        if (activeColor) {
            activeColor.classList.remove('active');
        }

        // Делаем текущий выбранный цвет активным
        this.classList.add('active');
        activeColor = this;
    });
});

// Функция redraw для WebGL
function redraw() {
    requestAnimationFrame(() => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Очищаем экран
        gl.viewport(0, 0, canvas.width, canvas.height); // Устанавливаем область отрисовки

        // Отрисовка загруженных картинок
        for (let row = 0; row < 32; row++) {
            for (let col = 0; col < 32; col++) {
                const texture = imageCache[row][col];
                if (texture) {
                    const x = col * 20480 - 327680; // Рассчитываем позицию каждого изображения
                    const y = row * 20480 - 327680;
                    drawTexture(texture, x, y, 20480, 20480); // drawTexture будет отрисовывать текстуру
                } else {
                    loadImage(row, col); // Загружаем изображение, если оно ещё не загружено
                }
            }
        }

        updateTransform(); // Обновляем матрицу трансформации для масштабирования и панорамирования
        if (scale >= 2) {
            drawGrid(); // Отрисовка сетки
        }

        drawPixels(); // Отрисовка пикселей
        drawSelections(); // Отрисовка выбранных областей

        if (document.getElementById('showPrivateAreasCheckbox') && document.getElementById('showPrivateAreasCheckbox').checked) {
            drawPrivateAreas(); // Отрисовка приватных областей
        }
    });
}

function drawTexture(texture, x, y, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    setupTextureShader(x, y, width, height); // Подготовить шейдер для текстуры
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function setupTextureShader(vertices, colors) {
    // Создание шейдерной программы
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Исходный код для вершинного шейдера
    const vsSource = `
        attribute vec2 position;
        attribute vec4 color;
        varying vec4 vColor;

        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
            gl_PointSize = 10.0; // размер точки, если отрисовывается gl.POINTS
            vColor = color;
        }
    `;

    // Исходный код для фрагментного шейдера
    const fsSource = `
        precision mediump float;
        varying vec4 vColor;

        void main() {
            gl_FragColor = vColor;
        }
    `;

    // Компиляция шейдеров
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    // Связывание шейдеров в программу
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Создание буферов
    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    // Привязка и загрузка вершинных данных
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(shaderProgram, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Привязка и загрузка данных цвета
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorLocation = gl.getAttribLocation(shaderProgram, 'color');
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
}


function updateTransform() {
    // Установка матрицы трансформации для WebGL
    let transformMatrix = calculateTransformMatrix(scale, panX, panY);
    setShaderMatrix(transformMatrix);
}

function calculateTransformMatrix(scale, translateX, translateY) {
    return [
        scale, 0, 0,
        0, scale, 0,
        translateX, translateY, 1
    ];
}

function drawGrid() {
    const gridSize = 10;
    const lines = [];
    for (let i = -canvas.width; i < canvas.width; i += gridSize) {
        lines.push(i, -canvas.height, i, canvas.height);
        lines.push(-canvas.width, i, canvas.width, i);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_matrix');
    const matrix = calculateTransformMatrix(scale, panX, panY);
    gl.uniformMatrix3fv(uMatrixLocation, false, matrix);

    const colorLocation = gl.getUniformLocation(shaderProgram, 'color');
    gl.uniform4fv(colorLocation, [0.9, 0.9, 0.9, 1]); // Светло-серый цвет для сетки

    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.LINES, 0, lines.length / 2);
}

function drawPixels() {
    // Предположим, что у вас есть массив drawnPixels, где каждый пиксель имеет {x, y, color}
    const positions = [];
    const colors = [];
    drawnPixels.forEach(pixel => {
        const {x, y, color} = pixel;
        positions.push(x, y);
        colors.push(...parseColor(color));
    });

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(shaderProgram, 'color');
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.POINTS, 0, drawnPixels.length);
}


function drawSelections() {
    // Предположим, что selectionStart и selectionEnd заданы
    if (!selectionStart || !selectionEnd) return;
    const x1 = Math.min(selectionStart.x, selectionEnd.x);
    const y1 = Math.min(selectionStart.y, selectionEnd.y);
    const x2 = Math.max(selectionStart.x, selectionEnd.x);
    const y2 = Math.max(selectionStart.y, selectionEnd.y);

    // Координаты и цвета вершин прямоугольника
    const positions = [x1, y1, x2, y1, x2, y2, x1, y2];
    const colors = [0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5];  // RGBA

    // Отправка данных в GPU
    setupTextureShader(positions, colors);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // Используем TRIANGLE_FAN для заполнения прямоугольника
}


function drawPrivateAreas() {
    // Аналогично drawSelections, но для массива privateAreas
    privateAreas.forEach(area => {
        const x1 = area.x1;
        const y1 = area.y1;
        const x2 = area.x2;
        const y2 = area.y2;
        const positions = [x1, y1, x2, y1, x2, y2, x1, y2];
        const colors = [1, 0, 0, 0.5, 1, 0, 0, 0.5, 1, 0, 0, 0.5, 1, 0, 0, 0.5]; // RGBA

        // Отправка данных в GPU
        setupTextureShader(positions, colors);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    });
}


    canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && e.target === canvas) {
        if (!infoMode) {
            isMouseDown = true;
            wasMoved = false;
            let startX = e.clientX;
            let startY = e.clientY;

            const handleMouseMove = (moveEvent) => {
                if (!isSelecting && !clearAreaMode) {
                    // Instead of moving a 2D context, we adjust WebGL view or model transformations
                    panX += moveEvent.clientX - startX;
                    panY += moveEvent.clientY - startY;
                    startX = moveEvent.clientX;
                    startY = moveEvent.clientY;

                    // Update WebGL view or projection matrix here
                    updateTransform(); // This function would update the transformation matrix in WebGL
                }
            };
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', () => {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }, { once: true });
        }
    }
});

function updateTransform() {
    // Adjust your WebGL transformation matrix and re-render scene
    let transformMatrix = calculateTransformMatrix(scale, panX, panY);
    setShaderMatrix(transformMatrix);
    drawScene(); // Redraw the WebGL scene with new transformations
}

// Расчет матрицы трансформации
function calculateTransformMatrix(scale, translateX, translateY) {
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [translateX, translateY, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, 1]);
    return modelViewMatrix;
}

// Установка матрицы в шейдер
function setShaderMatrix(matrix) {
    gl.useProgram(shaderProgram);
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

    // Передаем матрицы в шейдер
    gl.uniformMatrix4fv(uModelViewMatrix, false, matrix);
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
}

// Отрисовка сцены
function drawScene() {
    // Очистка канваса
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Настройка общих параметров
    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vertexArrayObject);

    // Обновление и применение матрицы проекции для всей сцены
    mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    // Различные части сцены
    drawPixels();     // Отрисовка пикселей
    drawGrid();       // Отрисовка сетки
    drawPrivateAreas(); // Отрисовка приватных областей
    drawSelections(); // Отрисовка выделенных областей

    // Отвязка шейдерной программы после завершения отрисовки
    gl.bindVertexArray(null);
    gl.useProgram(null);
}
// Эта функция принимает координаты касания и проверяет режимы перед рисованием
function drawMobile(x, y) {
    if (clearAreaMode || selectPrivatMode || infoMode) {
        if (infoMode) {
            console.log("Information mode is active.");
            mobileFetchPixelInfo(x, y); // Загружает информацию о пикселе в мобильном режиме
            return;
        }
        if (selectPrivatMode) {
            mobileDrawPrivatSelection(x, y); // Рисует выделение привата в мобильном режиме
            return;
        }
        if (clearAreaMode) {
            console.log("Clear area mode is active, x:", x, "y:", y);
            return;
        }
    }
    if (wasMoving) {
        console.log("Skipping drawing due to movement.");
        return;
    }
    if (!isUserLoggedIn) {
        console.log("User is not authenticated.");
        showAlert(); // Показывает предупреждение, если пользователь не аутентифицирован
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const adjustedX = Math.floor((x - rect.left - panX) / (gridSize * scale));
    const adjustedY = Math.floor((y - rect.top - panY) / (gridSize * scale));

    if (userScore >= 60) {
        console.error("Score is too high for drawing.");
        return;
    }

    const allowedToDraw = privateAreas.every(area => {
        const isInArea = adjustedX >= area.top_left_x && adjustedX <= area.bottom_right_x &&
                         adjustedY >= area.top_left_y && adjustedY <= area.bottom_right_y;
        return isInArea ? area.owner_id === currentUserId || area.allowed_users.includes(currentUserId.toString()) : true;
    });

    if (!allowedToDraw) {
        console.error("Drawing in this private zone is prohibited.");
        showPrivateAlert(); // Показывает уведомление о приватной зоне
        return;
    }

    const existingPixel = drawnPixels.find(p => p.x === adjustedX && p.y === adjustedY);
    if (existingPixel && existingPixel.color === currentColor) {
        console.log("Pixel is already this color.");
        return;
    }

    console.log(`User is drawing a pixel at: x=${adjustedX}, y=${adjustedY}, color=${currentColor}`);
    drawnPixels = drawnPixels.filter(p => !(p.x === adjustedX && p.y === adjustedY));
    drawnPixels.push({ x: adjustedX, y: adjustedY, color: currentColor }); // Добавляет новый пиксель в массив

    // Отрисовка изменений в WebGL
    drawPixels(); // Эта функция должна быть реализована для отрисовки пикселей с использованием WebGL
}

    fetch('/draw_pixel', {
        method: 'POST',
        body: JSON.stringify({ x: adjustedX, y: adjustedY, color: currentColor }),
        headers: { 'Content-Type': 'application/json' }

    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log('Pixel saved:', data);
        drawnPixels.push({ x: adjustedX, y: adjustedY, color: currentColor });
        redraw();
        updateScore();
    })
    .catch(error => console.error('Error saving pixel:', error));

    fetch('/update_score', {
        method: 'POST',
        body: JSON.stringify({ x: adjustedX, y: adjustedY, color: currentColor }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            userScore = data.score;
        }
    })
    .catch(error => console.error('Error updating score:', error));

//
    //
    //
    //

    function adjustImageColors(image) {
    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');
    canvasTemp.width = image.width;
    canvasTemp.height = image.height;

    ctxTemp.drawImage(image, 0, 0);
    let imageData = ctxTemp.getImageData(0, 0, canvasTemp.width, canvasTemp.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Изменяем черный цвет (0, 0, 0) на бледно-голубой (173, 216, 230)
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
            data[i] = 173;     // Красный канал
            data[i + 1] = 216; // Зеленый канал
            data[i + 2] = 230; // Синий канал
        }
    }
    ctxTemp.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = canvasTemp.toDataURL();
    });
}
    //
    //
    //
    let clearAreaStart = {x: 0, y: 0};
    let clearAreaEnd = {x: 0, y: 0};
    let privatAreaStart = {x: 0, y: 0};
    let privatAreaEnd = {x: 0, y: 0};


    // startAreaSelecting for mobile phone's
    canvas.addEventListener('touchstart', function(e) {
        if (!clearAreaMode) return; // Проверка активации режима очистки
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        console.log(scale, "asdasdasdasd", panX);

        clearAreaStart = {
            x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
            y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
        };
        isSelectingForClear = true;
        e.preventDefault();
    }, {passive: false});
    // end

    //
    canvas.addEventListener('touchmove', function(e) {
        if (!clearAreaMode || !isSelectingForClear) return; // Проверка активации режима очистки и процесса выбора
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        clearAreaEnd = {
            x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
            y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
        };


        redraw();
        drawClearAreaSelection();
        e.preventDefault();
    }, {passive: false});


    // endareaselection for mobile phone's
    canvas.addEventListener('touchend', function(e) {
        if (!clearAreaMode || !isSelectingForClear) return; // Проверка активации режима очистки и процесса выбора
        finalizeClearAreaSelection();
        isSelectingForClear = false;
    });
    //end
    //23.04 check chat
   function drawClearAreaSelection() {
    // Пересчет пиксельных координат для рисования на канвасе
    const x = Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale));
    const y = Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale));
    const width = Math.abs(clearAreaEnd.x - clearAreaStart.x) * gridSize * scale;
    const height = Math.abs(clearAreaEnd.y - clearAreaStart.y) * gridSize * scale;
    console.log(x,y,width,height);
    ctx.save();  // Сохраняем текущий контекст
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // Сбрасываем трансформацию
    ctx.clearRect(x, y, width, height);  // Очищаем только выделенную область
    ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
    ctx.fillRect(x, y, width, height);
    ctx.restore();  // Восстанавливаем контекст
}

    // end

    //рассчет координат для правильной очистки
    function finalizeClearAreaSelection() {
        const minX = Math.round(Math.min(clearAreaStart.x, clearAreaEnd.x));
        const minY = Math.round(Math.min(clearAreaStart.y, clearAreaEnd.y));
        const maxX = Math.round(Math.max(clearAreaStart.x, clearAreaEnd.x));
        const maxY = Math.round(Math.max(clearAreaStart.y, clearAreaEnd.y));

        if (confirm('Вы уверены, что хотите стереть выбранную область?')) {
            console.log("С мобилки удалена область",minX, minY, maxX, maxY);
            clearAreaOnServer(minX, minY, maxX, maxY);
            clearArea(clearAreaStart, clearAreaEnd);
            redraw(); // Перерисовываем канвас для обновления состояния
            console.log(1);
            //ЕЩКЕРЕЕЕЕЕ
            //window.location.reload();
        } else {
        console.log("отказано");
            redraw(); // Перерисовываем канвас для удаления ненужного выделения
        }

    }


    //пост запрос для очистки из бд
    function clearAreaOnServer(minX, minY, maxX, maxY) {
        fetch('/clear_area', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ minX: minX, minY: minY, maxX: maxX, maxY: maxY })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Area cleared:', data.message);
                toggleClearAreaMode();
            } else {
                console.error('Failed to clear area:', data.message);
            }
        })
        .catch(error => console.error('Error clearing area:', error));
        redraw();
        //toggleClearAreaMode();
    }
    //
    //
    //
    //
    //
    //



    // Начало выделения для режима selectPrivatMode ++++++++
canvas.addEventListener('touchstart', function(e) {
    if (!selectPrivatMode) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    privatAreaStart = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };
    isSelectingForPrivat = true;
    e.preventDefault();
}, {passive: false});

    // Начало выделения для режима ClearAreaMode ++++++++
canvas.addEventListener('touchstart', function(e) {
    if (!clearAreaMode) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    clearSelectionStart = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };
    isSelectingForClear = true;
    e.preventDefault();
}, {passive: false});


// Обработка перемещения для выделения привата ++++++++
canvas.addEventListener('touchmove', function(e) {
    if (!selectPrivatMode || !isSelectingForPrivat) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    privatAreaEnd = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };
    drawPrivatAreaSelection();
    e.preventDefault();
}, {passive: false});
// Обработка перемещения для выделения очистки ++++++++
canvas.addEventListener('touchmove', function(e) {
    if (!clearAreaMode || !isSelectingForClear) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    clearSelectionEnd = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };
    drawClearAreaSelection();
    e.preventDefault();
}, {passive: false});

// Завершение выделения и запись координат ++++++++
canvas.addEventListener('touchend', function(e) {
    if (!selectPrivatMode || !isSelectingForPrivat) return;
    isSelectingForPrivat = false;
    updateCoordsElement();
}, {passive: false});

// Завершение выделения и запись координат ++++++++
canvas.addEventListener('touchend', function(e) {
    if (!clearAreaMode || !isSelectingForClear) return;
    isSelectingForClear = false;
}, {passive: false});

// Функция для рисования выделенной области++++++++
function drawPrivatAreaSelection() {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, panX, panY); // Сброс трансформации
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';

    const x = Math.min(privatAreaStart.x, privatAreaEnd.x);
    const y = Math.min(privatAreaStart.y, privatAreaEnd.y);
    const width = Math.abs(privatAreaEnd.x - privatAreaStart.x);
    const height = Math.abs(privatAreaEnd.y - privatAreaStart.y);
    drawingPrivateXcordOne = x;
    drawingPrivateYcordOne = y;
    drawingPrivateXcordTwo = x+width;
    drawingPrivateYcordTwo = y+height;
    ctx.fillRect(x, y, x + width, y + height);
    redraw();

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка всего канвасаOSTAVIT'


    ctx.restore();
}
// Функция для рисования выделенной области++++++++
function drawClearAreaSelection() {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, panX, panY); // Сброс трансформации
    ctx.fillStyle = 'rgba(96, 132, 113, 0.5)';

    const x = Math.min(clearSelectionStart.x, clearSelectionEnd.x);
    const y = Math.min(clearSelectionStart.y, clearSelectionEnd.y);
    const width = Math.abs(clearSelectionEnd.x - clearSelectionStart.x);
    const height = Math.abs(clearSelectionEnd.y - clearSelectionStart.y);
    drawingClearXcordOne = x;
    drawingClearYcordOne = y;
    drawingClearXcordTwo = x+width;
    drawingClearYcordTwo = y+height;
    ctx.fillRect(x, y, x + width, y + height);
    redraw();

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка всего канвасаOSTAVIT'


    ctx.restore();
}

// Обновление элемента с координатами
function updateCoordsElement() {
    const coordsElement = document.getElementById('privat_cords');
    if (coordsElement) {
        coordsElement.value = `(${privatAreaStart.x}, ${privatAreaStart.y}) - (${privatAreaEnd.x}, ${privatAreaEnd.y})`;
    }
}



    //
    //
    //
    //
    //
    //
    //
    //
    //
function startAreaSelectionMobile(event) {
    if (!clearAreaMode) return;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    selectionStart = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };
    isSelecting = true;
}

function drawSelectionAreaMobile(event) {
    if (!isSelecting) return;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    selectionEnd = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale))
    };

    // Очистка и перерисовка для визуализации выделения
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';  // Синий цвет выделения
    ctx.fillRect(
        Math.min(selectionStart.x, selectionEnd.x) * gridSize,
        Math.min(selectionStart.y, selectionEnd.y) * gridSize,
        Math.abs(selectionEnd.x - selectionStart.x) * gridSize,
        Math.abs(selectionEnd.y - selectionStart.y) * gridSize
    );
    redraw();  // Перерисовываем канвас с текущими элементами
}

canvas.addEventListener('touchmove', drawSelectionAreaMobile);

 function endAreaSelectionMobile(event) {

    if (!clearAreaMode || !isSelecting) return;
    const touch = event.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    selectionEnd = {
        x: Math.floor((touch.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((touch.clientY - rect.top - panY) / (gridSize * scale)),
    };

    // Подтверждение очистки выбранной области
    if (confirm('Вы уверены, что хотите стереть выбранную область?')) {
        clearArea(selectionStart, selectionEnd);
        selectionStart = null;
        selectionEnd = null;
        console.log(2);
    }
    isSelecting = false;
    clearAreaMode = false;
    redraw();
    canvas.style.cursor = 'default';
    updateActiveModeText('drawing');
}

canvas.addEventListener('touchend', endAreaSelectionMobile);



    function draw(e) {

        if (!isUserLoggedIn) {
            console.log("Пользователь не авторизирован");
            showAlert();
            return;
        }

        if (!isDrawing || e.button !== 0) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - panX) / (gridSize * scale));
        const y = Math.floor((e.clientY - rect.top - panY) / (gridSize * scale));


        if (userScore >= 60) {
            console.error("Счет слишком высок для рисования");
            return;
        }

        const allowedToDraw = privateAreas.every(area => {
            const isInArea = x >= area.top_left_x && x <= area.bottom_right_x &&
                             y >= area.top_left_y && y <= area.bottom_right_y;
            if (!isInArea) return true;

            const allowedUsersArray = area.allowed_users ? area.allowed_users.split(' ') : [];
            console.log('allowedUsersArray для проверяемой зоны:', allowedUsersArray); // Проверка списка разрешенных пользователей

            const currentUserStringId = currentUserId.toString();
            return area.owner_id === currentUserId || allowedUsersArray.includes(currentUserStringId);
        });

        if (!allowedToDraw) {
            console.error("Рисование в этой приватной зоне запрещено");
            console.log("приват!!");
            showPrivateAlert();
            return;
        }

        const existingPixel = drawnPixels.find(p => p.x === x && p.y === y);
        if (existingPixel && existingPixel.color === currentColor) {
            console.log("Уже такого цвета");
            return;
        }

        console.log(`Пользователь закрасил пиксель: x=${x}, y=${y}, цвет=${currentColor}`);

        drawnPixels = drawnPixels.filter(p => !(p.x === x && p.y === y));

        fetch('/draw_pixel', {
            method: 'POST',
            body: JSON.stringify({ x, y, color: currentColor }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Pixel saved:', data);
            drawnPixels.push({ x, y, color: currentColor });
            redraw();
            updateScore();
        })
        .catch(error => console.error('Error saving pixel:', error));

        fetch('/update_score', {
            method: 'POST',
            body: JSON.stringify({ x, y, color: currentColor }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                userScore = data.score;
            }
        })
        .catch(error => console.error('Error updating score:', error));
    }

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const ws = e.deltaY > 0 ? 0.9 : 1.1;

        // Предыдущий масштаб
        const oldScale = scale;

        // Обновляем масштаб с учетом ограничений
        scale = Math.min(Math.max(scale * ws, 0.0027), 10);


        // Вычисляем центр канваса
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;

        // Учитываем изменение масштаба для смещения относительно центра канваса
        panX -= (canvasCenterX - panX) * (scale - oldScale) / oldScale;
        panY -= (canvasCenterY - panY) * (scale - oldScale) / oldScale;

        redraw();
    });

    // Создаем экземпляр Hammer, привязанный к канвасу
   let lastTouches = [];

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Предотвратить стандартные события касания
    if (clearAreaMode || selectPrivatMode) {
        return;
    }
    lastTouches = e.touches;
});

function getMidpoint(touches) {
    return {
        x: (touches[0].pageX + touches[1].pageX) / 2,
        y: (touches[0].pageY + touches[1].pageY) / 2
    };
}

function calculateScaleChange(startTouches, endTouches) {
    const startDistance = Math.hypot(
        startTouches[0].pageX - startTouches[1].pageX,
        startTouches[0].pageY - startTouches[1].pageY
    );
    const endDistance = Math.hypot(
        endTouches[0].pageX - endTouches[1].pageX,
        endTouches[0].pageY - endTouches[1].pageY
    );

    return endDistance / startDistance;
}

canvas.addEventListener('touchmove', function(e) {

    if (clearAreaMode || selectPrivatMode) {
        return;
    }
    if (e.touches.length === 2) {
        e.preventDefault();
        console.log("нихуя не стоп(");
        const currentTouches = e.touches;
        const midpoint = getMidpoint(currentTouches);
        const scaleChange = calculateScaleChange(lastTouches, currentTouches);

        // Обновляем масштаб только если это не вызовет перемещение
        const newScale = Math.max(0.0027, Math.min(scale * scaleChange, 10));
        if (newScale !== scale) {
            scale = newScale;

            // Обновляем позиции только если изменение масштаба произошло
            panX += (midpoint.x - panX) * (1 - scaleChange);
            panY += (midpoint.y - panY) * (1 - scaleChange);
        }
        lastTouches = currentTouches;
    }
});

canvas.addEventListener('touchend', function(e) {
    lastTouches = [];
});

    canvas.addEventListener('contextmenu', e => e.preventDefault());



    // Функция для обработки начала касания
    function handleTouchStart(e) {
        // Сброс флага перемещения на начало касания
    wasMoving = false;

    // Получаем координаты касания
    const touch = e.touches[0];
    let startX = touch.clientX;
    let startY = touch.clientY;

    // Обработчик движения при касании( CАМЫЙ РЕАЛЬНЫЙ И ДРУГИЕ НЕ ДВИГАЮТ КАНКВАС
    const handleTouchMove = (moveEvent) => {

        const touchMove = moveEvent.touches[0];
        if (clearAreaMode || selectPrivatMode) {
            return;
        }
        //if (clearAreaMode || infoAbout || selectPrivatMode){
            panX += touchMove.clientX - startX; // эти две переменные можно собирать для выделения начала и конца выделения привата или очистки
            panY += touchMove.clientY - startY;
        //}
        startX = touchMove.clientX;
        startY = touchMove.clientY;

        redraw();
        wasMoving = true; // Установка флага перемещения


    };

    // Добавляем обработчик движения
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Обработчик для окончания касания
    const handleTouchEnd = () => {
        canvas.removeEventListener('touchmove', handleTouchMove);
        if (!wasMoving) {
            drawMobile(startX, startY); // Рисуем, если не было перемещения
        }
    };

    // Добавляем обработчик окончания касания
    canvas.addEventListener('touchend', handleTouchEnd, { once: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { once: true });
}

// Добавляем обработчик начала касания к канвасу
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });


    function fetchRecentPixels() {
        fetch('/get_recent_pixels')
            .then(response => response.json())
            .then(pixels => {
                pixels.forEach(pixel => {
                    if (!drawnPixels.some(p => p.x === pixel.x && p.y === pixel.y && p.color === pixel.color)) {
                        drawnPixels.push(pixel);
                        // Учитываем масштаб и смещение при отрисовке
                        ctx.save();
                        ctx.setTransform(scale, 0, 0, scale, panX, panY);
                        drawPixelOnCanvas(pixel.x, pixel.y, pixel.color);
                        ctx.restore();
                    }
                });
            })
            .catch(error => console.error('Error fetching recent pixels:', error));
        fetch('/decrease_scores')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {

                }
            })
            .catch(error => console.error('Error decreasing scores:', error));
    }

    // Запускаем опрос сервера каждые 5 секунд
    setInterval(fetchRecentPixels, 1000);

  function loadAndDrawPixels() {
    fetch('/get_pixels')
        .then(response => response.json())
        .then(pixels => {
            pixels.forEach(pixel => {
                drawnPixels.push(pixel);
                drawPixelOnCanvas(pixel.x, pixel.y, pixel.color);
            });

        })
        .catch(error => console.error('Error loading pixels:', error));
}



    // Загрузить и отрисовать пиксели при загрузке страницы
    document.addEventListener('DOMContentLoaded', loadAndDrawPixels);


    function drawPixelOnCanvas(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }

    function updateScore() {
        fetch('/get_score')
            .then(response => response.json())
            .then(data => {
                userScore = data.score;
                updateTimerWithScore(); // Обновляем таймер
            })
            .catch(error => console.error('Error getting score:', error));
        }

    function updateScoreEverySecond() {
        fetch('/decrease_scores') //скорее всего, чем больше челов на сайте активны, тем больше тиков происходит
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (userIsAuthenticated) { // Псевдокод, замените на вашу реальную проверку
                        updateScore();
                    }
                }
            })
            .catch(error => console.error('Error decreasing scores:', error));
            //userScore = data.score; // Обновляем счет

    }

    // Вызываем функцию уменьшения счета каждую 5 секунду
    setInterval(updateScoreEverySecond, 1000);

    function updateTimerWithScore() {
        document.getElementById('seconds').textContent = userScore;
    }

    redraw(); // Первоначальная отрисовка сетки

   function drawGrid() {
    const width = canvas.width / scale;
    const height = canvas.height / scale;
    const startX = -panX / scale;
    const startY = -panY / scale;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, panX, panY);
    ctx.clearRect(startX, startY, width, height);
    ctx.beginPath();

    for (let x = startX - (startX % gridSize); x < startX + width; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + height);
    }
    for (let y = startY - (startY % gridSize); y < startY + height; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + width, y);
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1 / scale; // Убедитесь, что линии сетки остаются тонкими при масштабировании
    ctx.stroke();
    ctx.restore();
}




    // Отображение модального окна
    function showPixelInfo(info) {
        const modal = document.getElementById('pixelInfoContainer');
        const userInfoParagraph = document.getElementById('pixelInfoContainer');
        const banUserButton = document.getElementById('banUserButton');
        const closeModal = document.getElementById('closeModal');

        userInfoParagraph.textContent = `Пользователь: ${info.username} (${info.email})`;
        modal.style.display = "block";
        console.log(info.userId);
        if (closeModal){
            closeModal.onclick = function() {
                modal.style.display = "none";
            };
        }
        if(banUserButton){
            banUserButton.onclick = function() {
                // Запрос на сервер для блокировки пользователя
                banUser(data.info.userId);
            };
        }
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
        toggleInfoMode();
    }

    function banUser(userId) {
        if (userId == currentUserId) {
            alert("Вы не можете заблокировать себя!");
            return;
        }
        console.log(userId, currentUserId);
        if (userId == 9) {
                alert("Вы не можете главного админа!");
                return;
        }
        fetch(`/ban_user/${userId}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    console.log(`Пользователь с ID ${userId} заблокирован.`);
                    // Здесь можно добавить логику для обновления интерфейса, например скрыть модальное окно
                } else {
                    console.error('Ошибка при попытке заблокировать пользователя');
                }
            })
            .catch(error => console.error('Ошибка:', error));
    }

    if(document.getElementById('banUserButton')){
        document.getElementById('banUserButton').addEventListener('click', () => {
            banUser(selectedUserId); // предполагая, что selectedUserId - это ID выбранного пользователя
        });
    }

    // Функция для активации режима информации
    function toggleInfoMode() {
        // Если включен режим очистки области, отключаем его
        if (clearAreaMode) {
            toggleClearAreaMode();
        }
        infoMode = !infoMode;
        updateActiveModeText(infoMode ? 'info' : 'drawing');
        canvas.style.cursor = infoMode ? 'crosshair' : 'default';
        if (infoMode) {
            canvas.addEventListener('mousedown', onCanvasClick); // Используем onCanvasClick
        } else {
            canvas.removeEventListener('mousedown', onCanvasClick); // Убираем onCanvasClick
        }
    }
    if(document.getElementById('infoAbout')){
        document.getElementById('infoAbout').addEventListener('click', toggleInfoMode);
    }


    // Обработка клика на канвасе
    function onCanvasClick(event) {
        // Только если активен режим информации о пикселе
        if (infoMode) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left - panX) / (gridSize * scale));
            const y = Math.floor((event.clientY - rect.top - panY) / (gridSize * scale));
            fetchPixelInfo(x, y);
        }
    }
    // Запрос информации о пикселе
    function fetchPixelInfo(x, y) {
        console.log("ЧУМИЧУ");
        console.log(x);
        console.log(y);
        fetch(`/get_pixel_info?x=${x}&y=${y}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.info) {
                    showPixelInfo(data.info);
                    selectedUserId = data.info.userId;
                } else {
                    showPixelInfo({ userId: 'Нет', username: 'Пиксель не закрашен' }); // Обновите эту строку с учетом вашей логики отображения информации о пикселе
                    selectedUserId = null; // Сбросить выбранного пользователя
                }
            })

            .catch(error => console.error('Error:', error));
    }

    ////
    ///clear area
    // Начало выбора области


// Функция для переключения режима очистки области
function toggleClearAreaMode() {
    clearAreaMode = !clearAreaMode;
    isSelecting = false; // Сбрасываем флаг выбора области
    updateActiveModeText(clearAreaMode ? 'clearing' : 'drawing');
    if (clearAreaMode) {
        canvas.addEventListener('mousedown', startAreaSelection);
        canvas.addEventListener('mousemove', drawSelectionArea);
        canvas.addEventListener('mouseup', endAreaSelection);
        canvas.style.cursor = 'crosshair';
    } else {
        canvas.removeEventListener('mousedown', startAreaSelection);
        canvas.removeEventListener('mousemove', drawSelectionArea);
        canvas.removeEventListener('mouseup', endAreaSelection);
        canvas.style.cursor = 'default';
        isSelecting = false; // Сброс состояния выбора
    }
}

// Начало выбора области
function startAreaSelection(event) {
    if (!clearAreaMode) return;
    const rect = canvas.getBoundingClientRect();
    selectionStart = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };
    isSelecting = true;
}

// Отрисовка выбранной области
function drawSelectionArea(event) {
    if (!isSelecting) return;
    console.log('выделяю ли');
    console.log(isSelecting);
    console.log("Отрисовка выбора", selectionStart, selectionEnd);
    const rect = canvas.getBoundingClientRect();
    selectionEnd = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };
    redraw(); // Перерисовываем холст
}

// Конец выбора области и подтверждение очистки
function endAreaSelection(event) {
    if (!clearAreaMode || !isSelecting) return;
    const rect = canvas.getBoundingClientRect();
    selectionEnd = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };

    // Запрашиваем подтверждение у пользователя
    if (confirm('Вы уверены, что хотите стереть выбранную область?')) {
        clearArea(selectionStart, selectionEnd);
        // Сброс переменных выбора области
        selectionStart = null;
        selectionEnd = null;
        isSelecting = false;
        redraw(); // Перерисовываем канвас для обновления состояния
        console.log(3);
    } else {
        // Если пользователь отменяет действие, сбрасываем только флаг выбора
        isSelecting = false;
        redraw(); // Перерисовываем канвас для удаления ненужного выделения
    }
    clearAreaMode = !clearAreaMode;
    canvas.style.cursor = 'default';
    updateActiveModeText('drawing');
    isSelecting = false; // Сброс состояния выбора
}

// Очистка выбранной области
function clearArea(start, end) {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    // Удаление пикселей из массива, расположенных внутри выбранной области
    drawnPixels = drawnPixels.filter(pixel =>
        pixel.x < minX || pixel.x > maxX || pixel.y < minY || pixel.y > maxY
    );

    // Перерисовка канваса для отражения изменений
    redraw();

    // Отправляем запрос на сервер для очистки области в базе данных
    fetch('/clear_area', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minX, minY, maxX, maxY })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
        } else {
            console.error('Error clearing area:', data.message);
        }
    })
    .catch(error => console.error('Error clearing area:', error));
}

function mobileFetchPixelInfo(x, y) {
    console.log("получение инфы по пиксэлу");
    const adjustedX = Math.floor((x - canvas.getBoundingClientRect().left - panX) / (gridSize * scale));
    const adjustedY = Math.floor((y - canvas.getBoundingClientRect().top - panY) / (gridSize * scale));
    console.log(adjustedX);
    console.log(adjustedY);
    fetchPixelInfo(adjustedX, adjustedY);
}

function mobileDrawPrivatSelection(x, y) {
    if (!privatSelectionStart) {
        privatSelectionStart = {x: x, y: y};
    } else {
        privatSelectionEnd = {x: x, y: y};
        redraw();
        /*privatSelectionEnd = {x: x, y: y};
        const startX = Math.min(privatSelectionStart.x, privatSelectionEnd.x) * gridSize;
        const startY = Math.min(privatSelectionStart.y, privatSelectionEnd.y) * gridSize;
        const width = Math.abs(privatSelectionEnd.x - privatSelectionStart.x) * gridSize;
        const height = Math.abs(privatSelectionEnd.y - privatSelectionStart.y) * gridSize;

        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fillRect(startX, startY, width, height);
        ctx.restore();*/
    }
}

function mobileDrawClearArea(x, y) {
    console.log(clearAreaStart);
    if (!clearAreaStart) {
        StartAreaSelectionMobile = {x: x, y: y};
    } else {
        clearAreaEnd = {x: x, y: y};
        const startX = Math.min(clearAreaStart.x, clearAreaEnd.x) * gridSize;
        const startY = Math.min(clearAreaStart.y, clearAreaEnd.y) * gridSize;
        const width = Math.abs(clearAreaEnd.x - clearAreaStart.x) * gridSize;
        const height = Math.abs(clearAreaEnd.y - clearAreaStart.y) * gridSize;

        ctx.clearRect(startX, startY, width, height);  // Очистка выбранной области
    }
}



// Функция для отрисовки выбранной области
function drawSelection() {
    // Проверяем, что начало и конец выделения установлены
    if (!selectionStart || !selectionEnd) return;

    const startX = Math.min(selectionStart.x, selectionEnd.x) * gridSize;
    const startY = Math.min(selectionStart.y, selectionEnd.y) * gridSize;
    const width = Math.abs(selectionEnd.x - selectionStart.x) * gridSize;
    const height = Math.abs(selectionEnd.y - selectionStart.y) * gridSize;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'rgba(0, 0, 255, 0.9)';
    ctx.fillRect(startX, startY, width, height);
    ctx.restore();
}
if(document.getElementById('clearArea')){
    // Добавляем обработчик к кнопке
    document.getElementById('clearArea').addEventListener('click', toggleClearAreaMode);
}
//
//
//
//      Privates
//

function fetchPrivateAreas() {
    fetch('/get_private_areas')
        .then(response => response.json())
        .then(data => {
            privateAreas = data.privateAreas;
        })
        .catch(error => console.error('Ошибка при получении данных о приватных областях:', error));
}
fetchPrivateAreas(); // Вызовите эту функцию для загрузки данных о приватах


    var toggleButton = document.getElementById('toggleChatButton');
    toggleButton.addEventListener('click', function() {
        var chatElement = document.querySelector('.chat');
        if (chatElement.style.visibility === 'hidden') {
            chatElement.style.visibility = 'visible'; // Сделать видимым
        } else {
            chatElement.style.visibility = 'hidden'; // Сделать невидимым
        }
    });






function drawPrivateAreas() {
    ctx.save(); // Сохраняем текущее состояние контекста
    ctx.setTransform(scale, 0, 0, scale, panX, panY); // Применяем текущие трансформации канваса

    privateAreas.forEach(area => {
        // Настройте стиль отображения приватных областей
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Зеленый цвет с прозрачностью
        ctx.fillRect(
            area.top_left_x * gridSize,
            area.top_left_y * gridSize,
            (area.bottom_right_x - area.top_left_x) * gridSize,
            (area.bottom_right_y - area.top_left_y) * gridSize
        );
    });

    ctx.restore(); // Возвращаем контекст к его изначальному состоянию
}
if(document.getElementById('showPrivateAreasCheckbox')){
document.getElementById('showPrivateAreasCheckbox').addEventListener('change', redraw);

document.getElementById('showPrivateAreasCheckbox').addEventListener('change', function(e) {
    if (e.target.checked) {
        fetchPrivateAreas(); // Загрузка приватных областей только когда чекбокс включен
    }
    redraw();
});
}
//создание привата



// Функция для переключения режима выбора области для привата
function toggleSelectPrivatMode() {
    selectPrivatMode = !selectPrivatMode;
    updateActiveModeText(selectPrivatMode ? 'privateSelection' : 'drawing');
    isSelecting = false;
    canvas.style.cursor = selectPrivatMode ? 'crosshair' : 'default';
    if (selectPrivatMode) {
        canvas.addEventListener('mousedown', startPrivatSelection);
        canvas.addEventListener('mousemove', drawPrivatSelectionArea);
        canvas.addEventListener('mouseup', endPrivatSelection);
    } else {
        canvas.removeEventListener('mousedown', startPrivatSelection);
        canvas.removeEventListener('mousemove', drawPrivatSelectionArea);
        canvas.removeEventListener('mouseup', endPrivatSelection);
    }
    redraw(); // Возможно, вам нужно перерисовать канвас, чтобы очистить предыдущее выделение
}

// Начало выбора области для привата
function startPrivatSelection(event) {
    if (!selectPrivatMode) return;
    const rect = canvas.getBoundingClientRect();
    privatSelectionStart = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };
    isSelecting = true;
}

// Отрисовка выбранной области
function drawPrivatSelectionArea(event) {
    if (!selectPrivatMode || !isSelecting) return;
    const rect = canvas.getBoundingClientRect();
    privatSelectionEnd = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };
    redraw(); // Перерисовываем холст для отображения выделения
}

// Конец выбора области для привата
function endPrivatSelection(event) {
     if (!selectPrivatMode || !isSelecting) return;
    isSelecting = false;

    const rect = canvas.getBoundingClientRect();
    privatSelectionEnd = {
        x: Math.floor((event.clientX - rect.left - panX) / (gridSize * scale)),
        y: Math.floor((event.clientY - rect.top - panY) / (gridSize * scale))
    };

    // Заполнение полей ввода координатами
    document.getElementById('privat_cords').value =
        `(${privatSelectionStart.x}, ${privatSelectionStart.y}) - (${privatSelectionEnd.x}, ${privatSelectionEnd.y})`;
    toggleSelectPrivatMode(); // Выключаем режим выбора после завершения
    isSelecting = false;
    updateActiveModeText('drawing');
    redraw();
}

// Функция для отрисовки выбранной области для привата
function drawPrivatSelection() {
    if (!privatSelectionStart || !privatSelectionEnd) return;

    console.log(privatSelectionStart);
    console.log(privatSelectionEnd);
    const startX = Math.min(privatSelectionStart.x, privatSelectionEnd.x) * gridSize;
    const startY = Math.min(privatSelectionStart.y, privatSelectionEnd.y) * gridSize;
    const width = Math.abs(privatSelectionEnd.x - privatSelectionStart.x) * gridSize;
    const height = Math.abs(privatSelectionEnd.y - privatSelectionStart.y) * gridSize;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; // Цвет и прозрачность выделения
    ctx.fillRect(startX, startY, width, height);
    ctx.restore();
}

if(document.getElementById('SelectAreaForPrivat')){
// Обработчик для кнопки "Выделить область для привата"
document.getElementById('SelectAreaForPrivat').addEventListener('click', toggleSelectPrivatMode);
}
if(document.getElementById('CreatePrivet')){
// Функция для отправки данных о новой приватной области на сервер
    document.getElementById('CreatePrivet').addEventListener('click', function() {
        const privatCoords = document.getElementById('privat_cords').value;
        const userLogins = document.getElementById('owner_id').value.split(' ');

        Promise.all(userLogins.map(login =>
            fetch(`/get_user_id?login=${encodeURIComponent(login)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        return data.userId;
                    } else {
                        throw new Error(`Пользователь с логином ${login} не найден`);
                    }
                })
        ))
        .then(userIds => {
            if (userIds.length === 0) throw new Error('Необходимо указать хотя бы одного пользователя.');

            const owner_id = userIds[0];
            const allowed_users = userIds.slice(1).join(' ');

            const coordsMatch = privatCoords.match(/\((-?\d+), (-?\d+)\) - \((-?\d+), (-?\d+)\)/);
            if (!coordsMatch){

            console.log(coordsMatch);
            }

            const privatAreaData = {
                top_left_x: parseInt(coordsMatch[1]),
                top_left_y: parseInt(coordsMatch[2]),
                bottom_right_x: parseInt(coordsMatch[3]),
                bottom_right_y: parseInt(coordsMatch[4]),
                owner_id: owner_id,
                allowed_users: allowed_users
            };

            return fetch('/create_private_area', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(privatAreaData)
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка при создании приватной области');
            return response.json();
        })
        .then(data => {
            if (data.status !== 'success') throw new Error(data.message);
            console.log('Приватная область создана:', data);
            document.getElementById('privat_cords').value = '';
            document.getElementById('owner_id').value = '';
            fetchPrivateAreas(); // Обновляем список приватных областей
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert(error.message); // Показываем ошибку пользователю
        });
        var dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        if(dropdown.style.display === 'block'){
            dropdown.style.display = 'none';
        }
        toggleSelectPrivatMode();
        drawingPrivateXcordOne = 0;
        drawingPrivateXcordTwo = 0;
        drawingPrivateYcordOne = 0;
        drawingPrivateYcordTwo = 0;
        redraw();
    });
}

//дропдаун для привата
document.getElementById('owner_id').addEventListener('click', function() {
    var dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    if (dropdown.style.display === 'block') {
        loadUsersDropdown();  // Загрузить список пользователей при открытии dropdown
    }
});

function toggleDropdown() { //юзадж есть, но из html
    var dropdown = document.getElementById('userDropdown');
    dropdown.style.display = 'none';
}

function loadUsersDropdown() {
    fetch('/get_users')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('userDropdown');
            dropdown.innerHTML = ''; // Очищаем dropdown перед новой загрузкой
            data.users.forEach(user => {
                // Создаем элементы чекбокса для каждого пользователя
                const checkboxHtml = `<input type="checkbox" id="user${user.id}" name="user" value="${user.username}">
                                      <label for="user${user.id}">${user.username}</label><br>`;
                dropdown.innerHTML += checkboxHtml;
            });

            updateSelectedUsers(); // Обновить текстовое поле с выбранными пользователями
        })
        .catch(error => console.error('Ошибка:', error));
}

function updateSelectedUsers() {
    var checkboxes = document.querySelectorAll('#userDropdown input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var selectedUsers = [];
            checkboxes.forEach(function(box) {
                if (box.checked) {
                    selectedUsers.push(box.value);
                }
            });
            document.getElementById('owner_id').value = selectedUsers.join(' ');
        });
    });
}

// Обработчик для кнопки "Список приватных областей"
if(document.getElementById('showPrivateAreasList')){
document.getElementById('showPrivateAreasList').addEventListener('click', function() {
    const privateAreasListContainer = document.getElementById('privateAreasList');
    privateAreasListContainer.classList.toggle('hidden');
    if (!privateAreasListContainer.classList.contains('hidden')) {
        fetch('/get_private_areas')
            .then(response => response.json())
            .then(data => {
                privateAreasListContainer.innerHTML = ''; // Очищаем предыдущий список
                data.privateAreas.forEach(area => {
                    // И измените HTML, добавив event в onclick атрибут:
                    privateAreasListContainer.innerHTML += `<p>Область ID: ${area.id}, Владелец: ${area.owner_id} <button onclick="deletePrivateArea(${area.id}, event)">Удалить</button></p>`;
                });
            })
            .catch(error => console.error('Ошибка:', error));
    }
});
}

if(document.getElementById('showUsersList')){
// Обработчик для кнопки "Список пользователей"
document.getElementById('showUsersList').addEventListener('click', function() {
    const usersListContainer = document.getElementById('usersList');
    usersListContainer.classList.toggle('hidden');
    if (!usersListContainer.classList.contains('hidden')) {
        fetch('/get_users')
            .then(response => response.json())
            .then(data => {
                usersListContainer.innerHTML = ''; // Очищаем предыдущий список
                data.users.forEach(user => {
                    // И измените HTML, добавив event в onclick атрибут:
                    usersListContainer.innerHTML += `<p>Пользователь: ${user.username}, ID: ${user.id} <button onclick="toggleUserBan(${user.id}, ${user.is_banned}, event)">${user.is_banned ? 'Разбанить' : 'Забанить'}</button></p>`;
                });
            })
            .catch(error => console.error('Ошибка:', error));
    }
});
}
// Функция для обновления текста активного режима
function updateActiveModeText(mode) {
    const activeModeText = document.getElementById('ActiveMode');
    switch(mode) {
        case 'drawing':
            activeModeText.textContent = 'Выбран режим: Рисование';
            break;
        case 'clearing':
            activeModeText.textContent = 'Выбран режим: Очистки';
            break;
        case 'info':
            activeModeText.textContent = 'Выбран режим: Информации';
            break;
        case 'privateSelection':
            activeModeText.textContent = 'Выбран режим: Выделение привата';
            break;
        default:
            activeModeText.textContent = 'Выбран режим: Рисование';
    }
}


// Функция для обновления статуса пользователя (бан/разбан)
function toggleUserBan(userId) {
event.stopPropagation(); // Предотвращает закрытие списка
    fetch(`/update_user_status/${userId}`, { method: 'POST' })
        .then(response => {
            if (userId == 9) {
                alert("Вы не можете заблокировать главного администратора!");
                return;
            }
            if (userId == currentUserId) {
                alert("Вы не можете заблокировать себя!");
                return;
            }

            if (response.ok) {
                console.log(`Статус пользователя ${userId} изменён`);
                // Обновляем список пользователей после изменения статуса
                document.getElementById('showUsersList').click();
                document.getElementById('showUsersList').click();
            } else {
                console.error('Ошибка при изменении статуса пользователя');
            }
        })
        .catch(error => console.error('Ошибка:', error));
        loadAndShowUsersList(); // Обновляем список пользователей
}

// Функция для удаления приватной области
function deletePrivateArea(areaId) {
event.stopPropagation(); // Предотвращает закрытие списка
    fetch(`/delete_private_area/${areaId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                console.log(`Область ${areaId} удалена`);
                // Обновляем список областей после удаления
                document.getElementById('showPrivateAreasList').click();
                document.getElementById('showPrivateAreasList').click();
            } else {
                console.error('Ошибка при удалении области');
            }
        })
        .catch(error => console.error('Ошибка:', error));
        loadAndShowPrivateAreasList(); // Обновляем список приватных областей
}

// Функция загрузки и отображения списка пользователей
function loadAndShowUsersList() {
    fetch('/get_users')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('usersList');
            listContainer.innerHTML = '';
            data.users.forEach(user => {
                listContainer.innerHTML += `<p>Пользователь: ${user.username}, ID: ${user.id} <button onclick="toggleUserBan(${user.id}, ${user.is_banned})">${user.is_banned ? 'Разбанить' : 'Забанить'}</button></p>`;
            });
            listContainer.style.display = 'block'; // Отображаем список пользователей
        })
        .catch(error => console.error('Ошибка:', error));
}
if(document.getElementById('showUsersList')){
    document.getElementById('showUsersList').addEventListener('click', function() {
        const listContainer = document.getElementById('usersList');
        if (listContainer.style.display === 'block') {
            listContainer.style.display = 'none'; // Скрываем список, если он уже отображается
        } else {
            loadAndShowUsersList(); // Загружаем и отображаем список, если он скрыт
        }
    });
}
// Функция загрузки и отображения списка приватных областей
function loadAndShowPrivateAreasList() {
    fetch('/get_private_areas')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.getElementById('privateAreasList');
            listContainer.innerHTML = '';
            data.privateAreas.forEach(area => {
                listContainer.innerHTML += `<p>Область ID: ${area.id}, Владелец: ${area.owner_id} <button onclick="deletePrivateArea(${area.id})">Удалить</button></p>`;
            });
            listContainer.style.display = 'block';
        })
        .catch(error => console.error('Ошибка:', error));
}
if(document.getElementById('showPrivateAreasList')){
document.getElementById('showPrivateAreasList').addEventListener('click', function() {
    const listContainer = document.getElementById('privateAreasList');
    if (listContainer.style.display === 'block') {
        listContainer.style.display = 'none'; // Скрываем список, если он уже отображается
    } else {
        loadAndShowPrivateAreasList(); // Загружаем и отображаем список, если он скрыт
    }
});
}
// Теперь функция redraw должна учитывать измененный размер и масштабирование контекста
