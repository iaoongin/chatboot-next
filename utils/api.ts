import { ChatReq, ChatRes } from '@/pages/api/chat';

/** 请求 /api/chat 接口 */
export const fetchChat = async ({ text, conversationId, clientId, conversationSignature }: ChatReq): Promise<ChatRes> => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, conversationId, clientId, conversationSignature }),
  });

  const resContentType = res.headers.get('Content-Type');
  // 如果不是 json 格式的返回，则抛错
  if (!resContentType?.startsWith('application/json')) {
    const resText = await res.text();
    throw new Error(resText);
  }

  const resJson: ChatRes = await res.json();

  if (!res.ok) {
    let error = new Error();
    Object.assign(error, resJson);
    throw error;
  }

  return resJson;
};
