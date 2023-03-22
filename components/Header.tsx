import { KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { FC, useCallback, useEffect } from 'react';

import { login, logout } from '@/utils/login';
import { sleep } from '@/utils/sleep';

interface HeaderProps {
  logged: boolean;
  setLogged: (logged: boolean) => void;
  isWeChat: boolean;
  title?: string | "";
}

/**
 * 顶部栏
 */
export const Header: FC<HeaderProps> = ({ logged = true, setLogged, isWeChat, title = "ChatBoot" }) => {
  useEffect(() => {
    (async () => {
      // 最开始如果未登录，则弹窗登录
      if (!logged) {
        // setLogged(await login());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 点击钥匙按钮，弹出重新登录框 */
  const onKeyIconClick = useCallback(async () => {
    // 如果未登录，则弹窗登录
    if (!logged) {
      setLogged(await login());
      return;
    }

    // 如果已登录，则弹窗登出
    const logoutResult = await logout();
    setLogged(!logoutResult);

    // 如果登出成功，则继续弹窗要求用户登录
    if (logoutResult) {
      await sleep(100);
      const loginResult = await login();
      setLogged(loginResult);
    }
  }, [logged, setLogged]);

  if (isWeChat) {
    return (
      <header className="absolute top-0 right-0">
        <h1 className="hidden">ChatGPT</h1>
        <button className="w-10 h-10 m-2 p-[0.625rem]">
          <KeyIcon
            className={classNames({
              'text-green-600': logged,
              'text-red-500': !logged,
            })}
            onClick={onKeyIconClick}
          />
        </button>
      </header>
    );
  }

  return (
    <>
      <div className="h-14 md:h-[4.5rem]" />
      <header className="fixed flex w-inherit justify-end top-0 md:px-4 md:pt-4 z-10 bg-[#ededed] border-gray-300 text-center border-b-[0.5px]">
        <div className="w-14 h-14 p-3.5" />
        <h1 className="grow text-lg py-3.5"> {title} </h1>
        {/* <button className="w-10 h-10 m-2 p-[0.625rem]" onClick={onKeyIconClick}>
          <KeyIcon
            className={classNames({
              'text-green-600': logged,
              'text-red-500': !logged,
            })}
          />
        </button> */}
      </header>
    </>
  );
};
