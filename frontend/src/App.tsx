import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import AddMemory from "./pages/AddMemory";
import Quiz from "./pages/Quiz";
import ReviewStory from "./pages/ReviewStory";
import RecordPage from "./pages/RecordPage";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/add" component={AddMemory} />
      <Route path="/review/:id" component={ReviewStory} />
      <Route path="/quiz/:id" component={Quiz} />
      <Route path="/record/:id" component={RecordPage} />
    </Switch>
  );
}

export default App;
