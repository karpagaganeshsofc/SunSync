export async function parseAlarmCommand(transcript: string): Promise<number | null>{
    const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_KEY ?? '',
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: transcript
    }],
    system: `You are an alarm assistant. The user will say something like "wake me up 30 minutes before sunrise" or "set alarm 15 minutes after sunrise". Extract the offset in minutes from sunrise. Before sunrise = negative number. After sunrise = positive number. At sunrise = 0. Reply with ONLY a JSON object like: {"offset": -30}. Nothing else.`
  })
});

try {
  const data = await response.json();
  const text = data.content[0].text;
  const parsed = JSON.parse(text);
  return parsed.offset;
} catch (e) {
  return null;
}
}