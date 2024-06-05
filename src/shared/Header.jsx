import { Button, Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import Sidebar from './Sidebar';

export default function Header() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="bg-background">
      <header className={`flex items-center gap-x-3 px-5 py-6`} data-theme>
        <Button
          color="default"
          isIconOnly={true}
          onClick={onOpen}
          size="sm"
          variant="light"
        >
          <span className="material-symbols-outlined">menu</span>
        </Button>
        <div className="font-bold font-display text-[#ffa726] uppercase">
          Restaking Dashboard
        </div>
        <Modal
          classNames={{
            base: 'h-full m-0 sm:m-0 p-0 rounded-none w-full',
            closeButton: 'hover:bg-default/20 text-foreground',
            wrapper: [
              'bottom-0',
              'fixed',
              'items-start',
              'sm:items-start',
              'justify-start',
              'left-0',
              'm-0',
              'min-h-full',
              'sm:m-0',
              'top-0',
              '[--opacity-enter:100%]',
              '[--opacity-exit:0%]',
              // '[--scale-enter:100%]',
              // '[--scale-exit:100%]',
              'sm:[--scale-enter:100%]',
              'sm:[--scale-exit:100%]',
              '[--slide-x-enter:0px]',
              '[--slide-x-exit:-200px]',
              '[--slide-y-enter:0px]',
              '[--slide-y-exit:0px]'
            ]
          }}
          isOpen={isOpen}
          motionProps={{
            variants: {
              enter: {
                x: 'var(--slide-x-enter)',
                opacity: 'var(--opacity-enter)',
                scale: 'var(--scale-enter)',
                y: 'var(--slide-y-enter)'
                // transition: {
                //   duration: 0.3,
                //   ease: 'easeOut'
                // }
              },
              exit: {
                x: 'var(--slide-x-exit)',
                opacity: 'var(--opacity-exit)',
                scale: 'var(--scale-exit)',
                y: 'var(--slide-y-exit)'
                // transition: {
                //   duration: 0.2,
                //   ease: 'easeIn'
                // }
              }
            }
          }}
          placement="top"
          onOpenChange={onOpenChange}
        >
          <ModalContent>{() => <Sidebar />}</ModalContent>
        </Modal>
      </header>
    </div>
  );
}
