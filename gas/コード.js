const ANTHROPIC_API_KEY_PROP = 'ANTHROPIC_API_KEY';

  function doGet(e) {
    const hour = parseInt(e.parameter.hour ?? new Date().getHours());
    const item = e.parameter.item ?? '';
    const type = e.parameter.type ?? '';

    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
      const apiKey = PropertiesService.getScriptProperties()
                       .getProperty(ANTHROPIC_API_KEY_PROP);

      const timeContext = hour < 5 ? '夜' : hour < 12 ? '朝' : hour < 18 ? '昼' : '夜';
      let prompt = '';
      if (item && type === 'event') {
        prompt =
  `「${item}」という予定について、友達に話しかけるようなタメ口で短いコメントを一言。${timeContext}らしい雰囲気で。文頭に予定の内容を自然に含めて（例：「${item}かぁ！楽しみだね」など、毎回違う言い回しで）。30文字以内、記号・絵文字なし。`;
      } else if (item && type === 'task') {
        prompt =
  `「${item}」というタスクについて、友達に話しかけるようなタメ口で短いコメントを一言。${timeContext}らしい雰囲気で。文頭にタスクの内容を自然に含めて（例：「${item}かぁ！がんばって」など、毎回違う言い回しで）。30文字以内、記号・絵文字なし。`;
      } else if (item && type === 'memo') {
        prompt =
  `「${item}」というメモについて、友達に話しかけるようなタメ口で短いコメントを一言。${timeContext}らしい雰囲気で。文頭にメモの内容を自然に含めて（例：「${item}かぁ！いいね」など、毎回違う言い回しで）。30文字以内、記号・絵文字なし。`;
      } else {
        prompt =
  `今日の${timeContext}に相応しい、前向きな一言をタメ口で。20文字以内、体言止めや短文で。記号・絵文字なし。`;
      }

      const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        payload: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 80,
          messages: [{ role: 'user', content: prompt }]
        }),
        muteHttpExceptions: true,
      });

      const data = JSON.parse(res.getContentText());
      const message = data?.content?.[0]?.text?.trim() ?? '今日も一日よろしく！';
      output.setContent(JSON.stringify({ message }));
    } catch (err) {
      output.setContent(JSON.stringify({ message: '今日も一日よろしく！' }));
    }

    return output;
  }