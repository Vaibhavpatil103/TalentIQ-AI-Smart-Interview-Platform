import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

function WhiteboardPanel() {
  return (
    <div className="h-full w-full bg-white rounded-lg overflow-hidden">
      <Tldraw />
    </div>
  );
}

export default WhiteboardPanel;
