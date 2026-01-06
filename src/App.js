import Chatbot from "./pages/Chatbot";
import ProfileSettings from "./pages/ProfileSettings";
function App() {
  return (
    <>
      {/* Your existing screens */}
      <ProfileSettings />

      {/* AI Chatbot Overlay */}
      <Chatbot />
    </>
  );
}

export default App;
