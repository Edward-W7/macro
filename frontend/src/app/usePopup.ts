import { useState, useEffect } from 'react';

export function usePopup(timeout = 2000) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const trigger = (msg: string) => {
    setMessage(msg);
    setShow(true);
    setTimeout(() => setShow(false), timeout);
  };

  return { show, message, trigger };
}
