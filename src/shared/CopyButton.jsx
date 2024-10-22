import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@nextui-org/react';

export default function CopyButton({ className, color, value, variant }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, []);

  const handleCopy = useCallback(value => {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(value).catch();

      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }

      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <Button
      className={className}
      color={color}
      isIconOnly
      onClick={() => handleCopy(value)}
      size="sm"
      variant="light"
    >
      <span className="material-symbols-outlined text-xl"
        style={variant === "outlined" ? {
          fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
        } : {}}
      >
        {copied ? 'check' : 'content_copy'}
      </span>
    </Button>
  );
}
