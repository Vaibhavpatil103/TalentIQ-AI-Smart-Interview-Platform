import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Loader2Icon,
  MaximizeIcon,
  MessageSquareIcon,
  MinimizeIcon,
  SignalIcon,
  SignalLowIcon,
  SignalMediumIcon,
  UsersIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const videoContainerRef = useRef(null);

  // Connection quality indicator
  const getConnectionIndicator = () => {
    switch (callingState) {
      case CallingState.JOINED:
        return (
          <div className="flex items-center gap-1.5 text-success">
            <SignalIcon className="size-4" />
            <span className="text-xs font-medium">Connected</span>
          </div>
        );
      case CallingState.RECONNECTING:
        return (
          <div className="flex items-center gap-1.5 text-warning animate-pulse">
            <SignalLowIcon className="size-4" />
            <span className="text-xs font-medium">Reconnecting...</span>
          </div>
        );
      case CallingState.MIGRATING:
        return (
          <div className="flex items-center gap-1.5 text-warning">
            <SignalMediumIcon className="size-4" />
            <span className="text-xs font-medium">Migrating...</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-error">
            <WifiOffIcon className="size-4" />
            <span className="text-xs font-medium">Disconnected</span>
          </div>
        );
    }
  };

  // PiP toggle
  const togglePiP = () => {
    setIsPiP(!isPiP);
  };

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  // PiP (Picture-in-Picture) mode — smaller floating video
  if (isPiP) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30 bg-base-300">
        <div className="flex items-center justify-between px-3 py-2 bg-base-100 border-b border-base-300">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-primary" />
            <span className="text-xs font-semibold">{participantCount}</span>
            {getConnectionIndicator()}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={togglePiP}
              className="btn btn-ghost btn-xs btn-circle"
              title="Expand video"
            >
              <MaximizeIcon className="size-3" />
            </button>
          </div>
        </div>
        <div className="h-44 str-video">
          <SpeakerLayout />
        </div>
        <div className="bg-base-100 p-2 flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* Header bar with participants, connection, chat toggle, PiP */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>
            {/* Connection indicator */}
            {getConnectionIndicator()}
          </div>

          <div className="flex items-center gap-2">
            {/* PiP toggle */}
            <button
              onClick={togglePiP}
              className="btn btn-ghost btn-sm gap-1"
              title="Picture-in-Picture mode"
            >
              <MinimizeIcon className="size-4" />
              PiP
            </button>

            {chatClient && channel && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
                title={isChatOpen ? "Hide chat" : "Show chat"}
              >
                <MessageSquareIcon className="size-4" />
                Chat
              </button>
            )}
          </div>
        </div>

        <div ref={videoContainerRef} className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout />
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SECTION */}
      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default VideoCallUI;
