import React from 'react';
import logo from './logo.svg';
import './App.css';

export interface Props {
  name: String;
  enthusiasmLevel?: number;
}

function App({ name, enthusiasmLevel = 1 }: Props) {
  if (enthusiasmLevel <= 0) {
    throw new Error('You could be a little more enthusiastic.');
  }
  return (
    <div className="App">
      <div className="greeting">
        This is Example of {name + getExclamationMarks(enthusiasmLevel)}
      </div>
    </div>
  );
}

export default App;

function getExclamationMarks(numChars: number) {
  return Array(numChars + 1).join('!');
}