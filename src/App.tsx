import { NoteWindow } from "./components/NoteWindow";
import "./styles/global.css";

function App() {
  const params = new URLSearchParams(window.location.search);
  const noteId = params.get("noteId");

  if (!noteId) {
    return null;
  }

  return <NoteWindow noteId={noteId} />;
}

export default App;
