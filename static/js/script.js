document.addEventListener("DOMContentLoaded", function() {
    var adminButton = document.querySelector(".admin-button");
    var adminSubpanel = document.querySelector(".admin-subpanel");
    var messagesContainer = document.getElementById("messagesContainer");
    var sendMessageForm = document.getElementById("sendMessageForm");
    var messageInput = document.getElementById("messageInput");
    var chat = document.querySelector(".chat");
    if (adminSubpanel) {
    adminSubpanel.classList.add("hidden");
    };
    const chatButton = document.getElementById("toggleChatButton");
    //const chat = document.querySelector(".chat"); // Ссылка непосредственно на элемент .chat
    let lastLoadedPage = 0;
    let lastMessageId = null; // Хранит ID последнего загруженного сообщения
    let loading = false;// флаг, указывающий, идет ли загрузка
    // Инициализация переменных
    let currentPage = 2;
    let isLoading = false;
    const maxAutoLoadPages = 5;
    let pageSize = 10;

    if(chatButton){
        chatButton.addEventListener("click", function() {
            var chatIcon = document.querySelector('.toggle-chat-button img[src="static/img/chat.svg"]');
            var closeIcon = document.querySelector('.toggle-chat-button img[src="static/img/crossed.svg"]');
            // Переключение видимости иконок
            if (closeIcon.style.display === 'none') {
                closeIcon.style.display = 'block';  // Показываем иконку "Закрыть"
            } else {
                closeIcon.style.display = 'none';   // Скрываем иконку "Закрыть"
            }
        });
    }

    if(sendMessageForm){
        sendMessageForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Предотвращаем стандартное поведение формы

            var messageInput = document.getElementById("messageInput");
            var messageText = messageInput.value;

            fetch('/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Если используется CSRF-токен, добавьте его здесь
                },
                body: JSON.stringify({ message: messageText })
            })
            .then(response => {
                if(response.ok) {
                    // Очищаем поле ввода и обновляем чат
                    messageInput.value = '';
                    loadMessages(); // Функция для загрузки и отображения новых сообщений
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
    if (!adminSubpanel) {
        // Если элемент с классом admin-subpanel не существует, скрываем кнопку "Панель администратора"
        adminButton.style.display = "none";
    }

    if (adminButton) { // Проверяем, существует ли кнопка на странице
        adminButton.addEventListener("click", function() {
            // Проверяем, видна ли панель администратора
            if (!adminSubpanel.classList.contains("hidden")) {
                adminSubpanel.classList.add("hidden"); // Скрываем панель, если она видна
            } else {
                adminSubpanel.classList.remove("hidden"); // Показываем панель, если она скрыта
            }
        });
    }

    const secondsElement = document.getElementById('seconds');
    let seconds = 0;


/////////////////////////////////////////////////////////////////////////
    function loadMessages() {
    // Запоминаем текущее положение скролла и высоту контента
    const scrollTopBeforeLoad = messagesContainer.scrollTop;
    const scrollHeightBeforeLoad = messagesContainer.scrollHeight;

    // Функция для генерации хеша из строки
    function stringToHash(string) {
        var hash = 0;
        if (string.length === 0) return hash;
        for (var i = 0; i < string.length; i++) {
            var char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // Массив с цветами
    const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

    // Функция для получения цвета для ника
    function getColorForUsername(username) {
        const index = Math.abs(stringToHash(username)) % colors.length;
        return colors[index];
    }



    fetch('/get_messages')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            messagesContainer.innerHTML = ""; // Очищаем текущие сообщения
            data.reverse().forEach(message => {
            var messageElement = document.createElement("div");
            messageElement.classList.add("message");

            const usernameSpan = document.createElement("span");
            usernameSpan.textContent = message.username; // Удалено ": " отсюда
            if (message.username === "Miron") {
                usernameSpan.classList.add("owner");  // Применяем специальный класс
            }
            else{
                        usernameSpan.classList.add("boldNicksInChat");
                        usernameSpan.style.color = getColorForUsername(message.username);
            }

            const textSpan = document.createElement("span");
            textSpan.textContent = `:${message.message}`; // Добавлено ": " перед сообщением

            messageElement.appendChild(usernameSpan);
            messageElement.appendChild(textSpan);
            messagesContainer.appendChild(messageElement);
        });



            // Проверяем, находился ли скролл в нижней позиции перед загрузкой
            const wasAtBottom = scrollTopBeforeLoad + messagesContainer.clientHeight === scrollHeightBeforeLoad;

            if (wasAtBottom) {
                // Если были внизу, скроллим вниз после добавления сообщений
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                // Если пользователь прокручивал чат, сохраняем его позицию скролла
                messagesContainer.scrollTop = scrollTopBeforeLoad + (messagesContainer.scrollHeight - scrollHeightBeforeLoad);
            }
        })
        .catch(error => {
        console.error('Error:', error);
        // Можно добавить вывод в пользовательский интерфейс
        alert("Не удалось загрузить сообщения. Пожалуйста, проверьте ваше интернет-соединение.");
    });

}
    // Инициализируем загрузку последних сообщений при загрузке страницы
    document.addEventListener("DOMContentLoaded", function() {
        loadMessages();
    });





    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Обновляем сообщения каждую секунду
    setInterval(loadMessages, 1000);

        var infoButton = document.getElementById('MoreInfo');
        var closeButton = document.getElementById('closeInstruction');
        var instructionModal = document.getElementById('instructionModal');
        console.log(instructionModal);
        console.log(closeButton);
        console.log(infoButton);
        console.log("Инструкция появилась");
        if (infoButton && closeButton && instructionModal) {
            infoButton.addEventListener('click', function() {
                instructionModal.classList.add('visible');  // Показываем инструкцию
                instructionModal.classList.remove('hidden');  // Убедитесь, что окошко будет видно
            });

            closeButton.addEventListener('click', function() {
                instructionModal.classList.add('hidden');  // Скрываем инструкцию
                instructionModal.classList.remove('visible');
            });
        }

        document.getElementById('helpButton').addEventListener('click', function() {
        var modal = document.getElementById('helpModal');
        modal.style.display = 'block'; // Показать модальное окно
    });

    document.querySelector('.close').addEventListener('click', function() {
        var modal = document.getElementById('helpModal');
        modal.style.display = 'none'; // Скрыть модальное окно
});

});
