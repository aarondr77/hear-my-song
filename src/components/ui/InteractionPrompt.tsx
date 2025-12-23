import './InteractionPrompt.css';

interface InteractionPromptProps {
  message: string;
  visible: boolean;
}

export function InteractionPrompt({ message, visible }: InteractionPromptProps) {
  if (!visible) return null;

  return (
    <div className="interaction-prompt">
      <div className="prompt-content">
        <span className="prompt-key">Space</span>
        <span className="prompt-message">{message}</span>
      </div>
    </div>
  );
}

