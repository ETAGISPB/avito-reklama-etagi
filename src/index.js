export default {
    async fetch(request) {
        // Логируем входящий запрос
        console.log('📥 Входящий запрос:', request.method, request.url);

        // Обработка CORS preflight
        if (request.method === 'OPTIONS') {
            console.log('🔄 CORS preflight запрос');
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Разрешаем только POST
        if (request.method !== 'POST') {
            console.log('❌ Не POST запрос:', request.method);
            return new Response('Method Not Allowed', {
                status: 405,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            console.log('📦 Читаем тело запроса...');
            const requestData = await request.json();
            const message = requestData.message;
            console.log('💬 Сообщение:', message);

            if (!message) {
                console.log('⚠️ Ошибка пустого');
                return new Response(JSON.stringify({ error: 'Message is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // ======== ВАЖНО! Переменные окружения ========
            console.log('🔑 Проверяем переменные...');
            const token = env.BOT_TOKEN;
            const chatId = env.CHAT_ID;
            console.log('   - BOT_TOKEN:', token ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН');
            console.log('   - CHAT_ID:', chatId ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН');

            if (!token || !chatId) {
                console.error('❌ ОШИБКА: Переменные окружения не найдены!');
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            console.log('📤 Отправляем в Telegram...');
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
            console.log('✅ Ответ от Telegram:', data);

            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            console.error('❌ Worker error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
};
