import { Tooltip } from '@nextui-org/react';
import { tooltip } from './slots';
import { useState } from 'react';

export default function SearchTooltip() {
  const [isOpen, setOpen] = useState(false);

  return (
    <Tooltip
      classNames={tooltip}
      content={
        <ul className="list-inside list-disc">
          <li>Enter 3 or more more characters to start searching</li>
          <li>
            Searches starting with "<code>0x</code>" will search for matching
            addresses
          </li>
        </ul>
      }
      isOpen={isOpen}
      onOpenChange={open => setOpen(open)}
      placement="top"
      showArrow={true}
    >
      <span
        className="material-symbols-outlined cursor-pointer text-xl text-foreground-1"
        onPointerDown={() => setOpen(!isOpen)}
        style={{
          fontVariationSettings: `'FILL' 0`
        }}
      >
        info
      </span>
    </Tooltip>
  );
}
