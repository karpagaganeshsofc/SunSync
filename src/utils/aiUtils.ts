export async function parseAlarmCommand(transcript: string): Promise<number | 'cancel' | null>{
try {
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
    system: `You are an alarm assistant. The user will either set or cancel an alarm relative to sunrise. If the user wants to set an alarm (e.g. "wake me up 30 minutes before sunrise", "set alarm at sunrise"), reply with ONLY: {"action": "set", "offset": -30} where offset is minutes from sunrise (negative = before, positive = after, 0 = at sunrise). If the user wants to cancel/disable/turn off the alarm (e.g. "cancel my alarm", "turn off alarm", "disable alarm"), reply with ONLY: {"action": "cancel"}. Nothing else.`
  })
});

    const data = await response.json();
    const text = data.content[0].text;
    const parsed = JSON.parse(text);
    if (parsed.action === 'cancel') return 'cancel';
    if (parsed.action === 'set' && typeof parsed.offset === 'number') return parsed.offset;
    return null;
} catch (e) {
  return null;
}
}