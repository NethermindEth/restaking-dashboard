import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@nextui-org/react';
import { useTheme } from './ThemeContext';

export default function Settings() {
  const { applyTheme, theme } = useTheme();

  return (
    <footer className="grow content-end pb-1 ps-2">
      <Dropdown className="border border-outline shadow-none">
        <DropdownTrigger>
          <Button color="default" isIconOnly={true} size="sm" variant="light">
            <span className="material-symbols-outlined">contrast</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectedKeys={[theme]}
          aria-label="theme"
          selectionMode="single"
          onSelectionChange={key => applyTheme(Array.from(key)[0])}
        >
          <DropdownItem
            key="system"
            startContent={
              <span className="material-symbols-outlined">contrast</span>
            }
          >
            System
          </DropdownItem>
          <DropdownItem
            key="light"
            startContent={
              <span className="material-symbols-outlined text-foreground">
                light_mode
              </span>
            }
          >
            Light
          </DropdownItem>
          <DropdownItem
            key="dark"
            startContent={
              <span className="material-symbols-outlined">dark_mode</span>
            }
          >
            Dark
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </footer>
  );
}
