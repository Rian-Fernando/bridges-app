import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Students from "@/pages/students";
import Staff from "@/pages/staff";
import Availability from "@/pages/availability";
import Matching from "@/pages/matching";
import Conflicts from "@/pages/conflicts";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/students" component={Students} />
      <Route path="/staff" component={Staff} />
      <Route path="/availability" component={Availability} />
      <Route path="/matching" component={Matching} />
      <Route path="/conflicts" component={Conflicts} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
