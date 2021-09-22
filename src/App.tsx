import React from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./App.scss";
import Swap from "./screens/Swap";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main">
        <Swap />
      </main>
      <Footer />
    </div>
  );
}

export default App;
