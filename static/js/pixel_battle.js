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
    let scale = 4;
    let panX = 0;
    let panY = 0;
    let isDrawing = false;
    let drawnPixels = []; // Массив для хранения нарисованных пикселей
    console.log("DOM полностью загружен и разобран");
    const gridSize = 1; // Размер одной ячейки сетки
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const moveX = 0;
    const moveY = 0;

    ///////////////////////////////////////////






    let isMouseDown = false; // Флаг для отслеживания состояния нажатия мыши
    let wasMoved = false; // Флаг для отслеживания перемещения после нажатия
    let isSelectingForPrivat = false;
    let isSelectingForClear = false;
    loadAndDrawPixels();
    ctx.imageSmoothingEnabled = false;

    // Инициализация и применение сетки
    //createGrid();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = document.querySelectorAll('.color');
    let activeColor = null;
    const alertBox = document.getElementById('alertBox');
    const alertPrivateBox = document.getElementById('alertPrivateBox');
    const closeAlertButton = document.getElementById('closeAlert');
    const closePrivateAlertButton = document.getElementById('closePrivateAlert');
    // Объявляем переменные для хранения информации о пикселе
    let clearAreaMode = false;
    let clearSelectionStart = null;
    let clearSelectionEnd = null;
    let isSelecting = false;
    let selectionStart = null;
    let selectionEnd = null;
    let infoMode = false;
    let selectPrivatMode = false;
    let privatSelectionStart = null;
    let privatSelectionEnd = null;
    let privateAreas = [];
    let wasMoving = false;
    canvas.style.imageRendering = 'pixelated'; // Это улучшает отображение на HiDPI экранах

// Теперь вызывайте fetchPrivateAreas()
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
        redraw();
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






    let redrawScheduleded = false;

    function redraw() {
        if (!redrawScheduleded) {
            redrawScheduleded = true;
            requestAnimationFrame(() => {
                requestredraw();
                redrawScheduleded = false;
            });
        }
    }


    function requestredraw() {
        const visibleLeft = Math.max(-32768, -panX / scale);
        const visibleTop = Math.max(-32768, -panY / scale);
        const visibleWidth = Math.min(canvas.width / scale, 32768 - visibleLeft);
        const visibleHeight = Math.min(canvas.height / scale, 32768 - visibleTop);


        requestAnimationFrame(() => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(scale, 0, 0, scale, panX, panY);
        ctx.save();

        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(scale, 0, 0, scale, panX, panY);

        if (scale >= 5) {
            //drawGrid();
        }

        // Определение границ рисования
        const maxDist = 32768; // Максимальное расстояние от центра
        const centerX = 0; // Центр канваса
        const centerY = 0;

        const centX = Math.floor((-panX / scale) / gridSize);
        const centY = Math.floor((-panY / scale) / gridSize);
        updateCoordsAndPrivatInfo(centX, centY);

        let tempArray = drawnPixels
        let sortedArray = [...tempArray].sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y; // Сортировка по Y, если X одинаковые
            }
            return a.x - b.x; // В противном случае сортировка по X
        });
        drawnPixels = sortedArray;
        drawnPixels.forEach(p => {
            // Проверяем, находится ли пиксель внутри заданного диапазона
            if (Math.abs(p.x - centerX) <= maxDist && Math.abs(p.y - centerY) <= maxDist) {
                ctx.fillStyle = p.color;
                ctx.fillRect(Math.round(p.x * gridSize) , Math.round(p.y * gridSize), Math.round(gridSize) , Math.round(gridSize) );
                ctx.fillRect(Math.round(p.x * gridSize) , Math.round(p.y * gridSize), Math.round(gridSize) , Math.round(gridSize) );
                ctx.fillRect(Math.round(p.x * gridSize) , Math.round(p.y * gridSize), Math.round(gridSize) , Math.round(gridSize) );
                /*ctx.fillRect(p.x * gridSize -0.1, p.y * gridSize-0.1, gridSize , gridSize );
                ctx.fillRect(p.x * gridSize +0.1, p.y * gridSize+0.1, gridSize -0.1, gridSize-0.1 );
                ctx.fillRect(p.x * gridSize -0.1, p.y * gridSize+0.1, gridSize -0.1, gridSize -0.1);
                ctx.fillRect(p.x * gridSize +0.1, p.y * gridSize-0.1, gridSize -0.1, gridSize -0.1);*/


            }
        });
        // Отрисовка приватной области если есть начальные и конечные точки ++++++++
        if (privatSelectionStart && privatSelectionEnd && selectPrivatMode) {
            const startX = Math.min(privatSelectionStart.x, privatSelectionEnd.x);
            const startY = Math.min(privatSelectionStart.y, privatSelectionEnd.y);
            const width = Math.abs(privatSelectionEnd.x - privatSelectionStart.x);
            const height = Math.abs(privatSelectionEnd.y - privatSelectionStart.y);

            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(Math.round(drawingPrivateXcordOne* gridSize) , Math.round(drawingPrivateYcordOne* gridSize) , Math.abs(drawingPrivateXcordOne*gridSize - drawingPrivateXcordTwo * gridSize) + gridSize, Math.abs(drawingPrivateYcordOne*gridSize - drawingPrivateYcordTwo *gridSize) + gridSize );
        }
        // Отрисовка приватной области если есть начальные и конечные точки ++++++++
        if (clearSelectionStart && clearSelectionEnd && clearAreaMode) {
            const startX = Math.min(clearSelectionStart.x, clearSelectionEnd.x);
            const startY = Math.min(clearSelectionStart.y, clearSelectionEnd.y);
            const width = Math.abs(clearSelectionEnd.x - clearSelectionStart.x);
            const height = Math.abs(clearSelectionEnd.y - clearSelectionStart.y);

            ctx.fillStyle = 'rgba(94, 168, 113, 0.5)';
            ctx.fillRect(Math.round(drawingClearXcordOne* gridSize) , Math.round(drawingClearYcordOne* gridSize) , Math.abs(drawingClearXcordOne*gridSize - drawingClearXcordTwo * gridSize) + gridSize, Math.abs(drawingClearYcordOne*gridSize - drawingClearYcordTwo *gridSize) + gridSize );
        }
        //drawGrid();
        // Показать сетку, если масштаб больше или равен 2, например
        // Сетка
        // Отрисовка сетки
        if (scale >= 5) {
            //updateGridBackground(scale, panX, panY);
        }
        if (isSelecting && selectionStart && selectionEnd) {
            drawSelection(); // Отрисовка выбранной области

        }

        // Отрисовка выделенной области для привата
        if (selectPrivatMode && isSelecting) {
            drawPrivatSelection(); // Отрисовываем выбранную область привата
            try{
            drawSelectionAreaMobile()
            } catch(erroe){
                const its_pc = 1;
            }
        }

        ctx.restore();
        if (document.getElementById('showPrivateAreasCheckbox')) {
            if (document.getElementById('showPrivateAreasCheckbox').checked) {
            drawPrivateAreas(); // Отрисовка приватных областей
        }
    }

    ctx.restore();
    });
    }










// Вызывается при инициализации или после загрузки страницы


    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && e.target === canvas) {
            if (!infoMode){ // Убедитесь, что infoMode написан с двумя буквами "e"
                isMouseDown = true;
                wasMoved = false; // Сбрасываем флаг перемещения
                let startX = e.clientX;
                let startY = e.clientY;

                const handleMouseMove = (moveEvent) => {
                    if (!isSelecting && !clearAreaMode){
                        panX += moveEvent.clientX - startX;
                        panY += moveEvent.clientY - startY;
                        startX = moveEvent.clientX;
                        startY = moveEvent.clientY;
                        redraw();
                    }
                };
                canvas.addEventListener('mousemove', handleMouseMove);
                canvas.addEventListener('mouseup', () => {
                    canvas.removeEventListener('mousemove', handleMouseMove);
                }, { once: true });
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        isDrawing = false;
        if (e.button === 0 && isMouseDown && !wasMoved) {
            // Если мышь была отпущена и не было перемещения, вызываем функцию рисования
            isDrawing = true;
            draw(e);
        }
        isMouseDown = false; // Сбрасываем флаг нажатия мыши
    });
    //canvas.addEventListener('mousemove', draw);

    // Добавляем обработчики клика для каждого элемента палитры
    const colorElements = document.querySelectorAll('.color');
    colorElements.forEach(el => {
        el.addEventListener('click', function(event) {
            currentColor = this.style.backgroundColor;
            event.stopPropagation(); // Останавливаем всплытие события
        });
    });

canvas.addEventListener('mousemove', function(e) {
    if (isMouseDown) {
            wasMoved = true;
    }
    if (clearAreaMode || selectPrivatMode) {
        console.log("по идее стоп11111111");
        return;
    }
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - panX) / (gridSize * scale));
        const y = Math.floor((e.clientY - rect.top - panY) / (gridSize * scale));

    const privatInfo = getPrivatInfo(x, y);
    //console.log(privateAreas);
    updateCoordsAndPrivatInfo(x, y, privatInfo ? privatInfo.id : '-', privatInfo ? privatInfo.ownerLogin : '-');
});
function getPrivatInfo(x, y) {
    for (let area of privateAreas) {
        if (x >= area.top_left_x && x <= area.bottom_right_x && y >= area.top_left_y && y <= area.bottom_right_y) {
            console.log(`Найден приват: ${area.id}, владелец: ${area.ownerLogin}`);
            return { id: area.id, ownerLogin: area.ownerLogin };
        }
    }
    //console.log(`Приват не найден для координат: ${x}, ${y}`);
    return null;
}

canvas.addEventListener('touchmove', function(e) {
    if (clearAreaMode || selectPrivatMode) {
        return;
    }
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    updateCoordsAndPrivatInfo(x, y);
});

let touchStartX = 0;
let touchStartY = 0;
let isMoved = false;

canvas.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    if (clearAreaMode || selectPrivatMode) {
        return;
    }
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    if (clearAreaMode || selectPrivatMode) {
        console.log("по идее стоп");
        return;
    }
    isMoved = false; // Сброс при начале касания
});

const moveThreshold = 5; // Пороговое значение для определения "перемещения"

canvas.addEventListener('touchmove', function(e) {

    if (clearAreaMode || selectPrivatMode) {
        return;
    }
    const touch = e.touches[0];
    const moveX = touch.clientX - touchStartX;
    const moveY = touch.clientY - touchStartY;

    if (Math.abs(moveX) >= moveThreshold || Math.abs(moveY) >= moveThreshold) {
        isMoved = true;
    }
});


canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    drawMobile(touchX, touchY);
});

 function drawMobile(x, y) {
    // Используйте x и y, переданные в качестве аргументов функции
    if (clearAreaMode || selectPrivatMode || infoMode)  {
        if (infoMode) {
            console.log(infoMode);
            mobileFetchPixelInfo(x, y);
            return;
        }
        if (selectPrivatMode) {
            mobileDrawPrivatSelection(x, y);
            return;
        }
        if (clearAreaMode) {
            console.log(x, y);
            //startClearAreaSelection(x, y);  // Запуск процесса выделения
            //updateClearAreaSelection(x, y); // Может понадобиться для немедленного обновления, если требуется
            return;
        }
    }
    if (wasMoving) {
        console.log("Пропуск рисования из-за перемещения");
        return;
    }
    if (!isUserLoggedIn) {
        console.log("Пользователь не авторизирован");
        showAlert();
        return;
    }

    // Используйте x и y вместо touchX и touchY
    const rect = canvas.getBoundingClientRect();
    const adjustedX = Math.floor((x - rect.left - panX) / (gridSize * scale));
    const adjustedY = Math.floor((y - rect.top - panY) / (gridSize * scale));

    if (userScore >= 60) {
        console.error("Счет слишком высок для рисования");
        return;
    }

    const allowedToDraw = privateAreas.every(area => {
        const isInArea = adjustedX >= area.top_left_x && adjustedX <= area.bottom_right_x &&
                         adjustedY >= area.top_left_y && adjustedY <= area.bottom_right_y;
        if (!isInArea) return true;

        const allowedUsersArray = area.allowed_users ? area.allowed_users.split(' ') : [];
        console.log('allowedUsersArray для проверяемой зоны:', allowedUsersArray);

        const currentUserStringId = currentUserId.toString();
        return area.owner_id === currentUserId || allowedUsersArray.includes(currentUserStringId);
    });

    if (!allowedToDraw) {
        console.error("Рисование в этой приватной зоне запрещено");
        showPrivateAlert();
        return;
    }

    const existingPixel = drawnPixels.find(p => p.x === adjustedX && p.y === adjustedY);
    if (existingPixel && existingPixel.color === currentColor) {
        console.log("Уже такого цвета");
        return;
    }

    console.log(`Пользователь закрасилллл пиксель: x=${adjustedX}, y=${adjustedY}, цвет=${currentColor}`);

    drawnPixels = drawnPixels.filter(p => !(p.x === adjustedX && p.y === adjustedY));

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
}
//
    //
    //
    //
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
        scale = Math.min(Math.max(scale * ws, 0.01), 20);


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
        const newScale = Math.max(0.01, Math.min(scale * scaleChange, 20));
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

                    updateScore();
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
window.onload = function() {
    redraw(); // Первоначальный вызов функции отрисовки
};
});
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
