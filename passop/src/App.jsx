import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/Navbar'
import './App.css'
import Manager from './components/Manager'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Navbar/>
     <Manager/>
    </>
  )
}

export default App
