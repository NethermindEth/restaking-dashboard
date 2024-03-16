import { NextUIProvider } from '@nextui-org/react';
import { Button } from '@nextui-org/button';
import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button>Press me</Button>
    </>
  );
}

export default App;
