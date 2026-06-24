export default {
    async fetch(request) {
        // Разрешаем только POST-запросы
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        try {
            const { message } = await request.json();
            if (!message) {
                return new Response('Message is required', { status: 400 });
            }

            // Берём переменные из окружения
            const token = BOT_TOKEN;
            const chatId = CHAT_ID;

            if (!token || !chatId) {
                return new Response('Server configuration error', { status: 500 });
            }

            // Отправляем запрос в Telegram
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error('Error:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};
