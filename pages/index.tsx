import { getCookie } from 'cookies-next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { useCallback, useState } from 'react';

import { Header } from '@/components/Header';
import { Message, MessageProps, SystemMessage } from '@/components/Message';
import { TextareaForm } from '@/components/TextareaForm';
import { fetchChat } from '@/utils/api';
import { isWeChat as utilsIsWeChat } from '@/utils/device';
// import { exampleChatMessage, htmlMessage, regexpNumberMessage, userMessage } from '@/utils/exampleChatMessage';
import { scrollToBottom } from '@/utils/scrollToBottom';
import { sleep } from '@/utils/sleep';

const SYSTEM_MESSAGE = `请注意隐私风险，禁止发送违法内容`;
const WELCOME_MESSAGE = '你好！有什么我可以帮助你的吗？';
const LOADING_MESSAGE = '正在努力思考...';

interface HomeProps {
  OPENAI_API_KEY?: string;
  userAgent?: string;
}

export default function Home({ OPENAI_API_KEY, userAgent }: HomeProps) {
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [logged, setLogged] = useState(!!OPENAI_API_KEY);
  const isWeChat = utilsIsWeChat(userAgent);

  /** 提交回调 */
  const onSubmit = useCallback(
    async (text: string) => {
      let newMessages: MessageProps[] = [];
      newMessages.push({ align: 'right', chatMessage: { text } });
      setMessages([...messages, ...newMessages]);
      setChatLoading(true);
      await sleep(16);
      scrollToBottom();
      try {
        const clientId = messages[messages.length - 1]?.chatMessage?.clientId
        const conversationId = messages[messages.length - 1]?.chatMessage?.conversationId
        const conversationSignature = messages[messages.length - 1]?.chatMessage?.conversationSignature
        const chatRes = await fetchChat({ text, conversationId, clientId, conversationSignature });
        newMessages.push({ avatar: '/new-bing.svg', chatMessage: chatRes });
        setChatLoading(false);
        setMessages([...messages, ...newMessages]);
        await sleep(16);
        scrollToBottom();
      } catch (e: any) {
        setChatLoading(false);
        newMessages.push({ avatar: '/new-bing.svg', error: e });
        setMessages([...messages, ...newMessages]);
        await sleep(16);
        scrollToBottom();
      }
    },
    [messages],
  );

  return (
    <>
      <Head>
        <title>NewBing</title>
        <meta name="description" content="A Personal NewBing Client" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/chatgpt-green-icon.png" />
        <link rel="apple-touch-icon" type="image/png" href="/chatgpt-green-icon.png" />
      </Head>
      <main className="mx-auto w-full md:min-h-screen md:bg-[#ededed] md:w-[48rem] md:flex md:flex-col">
        <Header logged={logged} setLogged={setLogged} isWeChat={isWeChat} title="NewBing" />
        <div className="md:grow md:px-4" style={{ display: 'flow-root' }}>
          <SystemMessage text={SYSTEM_MESSAGE} />
          {/* <SystemMessage text="Tips: [Shift+回车]换行" /> */}
          <Message avatar="/new-bing.svg" chatMessage={{ text: WELCOME_MESSAGE }} />
          {/* <Message align="right" chatMessage={userMessage} />
          <Message avatar="ChatGPT" chatMessage={regexpNumberMessage} />
          <Message align="right" chatMessage={userMessage} />
          <Message avatar="ChatGPT" chatMessage={htmlMessage} /> */}
          {messages.map((messageProps, index) => (
            <Message key={index} {...messageProps} />
          ))}
          {chatLoading && <Message avatar="/new-bing.svg" chatMessage={{ text: LOADING_MESSAGE }} />}
        </div>
        <TextareaForm logged={true} onSubmit={onSubmit} />
      </main>
    </>
  );
}

// This gets called on every request
export async function getServerSideProps(ctx: NextPageContext) {
  const OPENAI_API_KEY = getCookie('OPENAI_API_KEY', ctx);
  const userAgent = ctx.req?.headers['user-agent'];

  return {
    props: {
      ...(OPENAI_API_KEY ? { OPENAI_API_KEY } : {}),
      ...(userAgent ? { userAgent } : {}),
    },
  };
}
