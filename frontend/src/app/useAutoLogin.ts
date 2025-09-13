import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useAutoLogin(onAutoLogin?: () => void) {
  const router = useRouter();
  const calledRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !calledRef.current) {
      const loggedIn = Cookies.get('loggedIn');
      if (loggedIn === 'true') {
        calledRef.current = true;
        if (onAutoLogin) onAutoLogin();
        setTimeout(() => router.replace('/dashboard'), onAutoLogin ? 1200 : 0);
      }
    }
  }, [router, onAutoLogin]);
}
