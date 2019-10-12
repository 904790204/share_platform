import React from 'react';
import Header from './components/header'

class App extends React.Component{
    render(){
      return (
        <div className="App">
          <Header />
          {content.userName}
        </div>
      );
    }
}

let content = {
    userName:'kim'
}

export default App;
