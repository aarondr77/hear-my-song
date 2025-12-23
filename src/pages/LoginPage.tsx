import { SignInScene } from '../components/canvas/SignInScene';
import { SpotifyButton } from '../components/ui/SpotifyButton';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="login-page">
      <div className="login-scene-container">
        <SignInScene />
      </div>
      <div className="login-overlay">
        <SpotifyButton onClick={onLogin} />
      </div>
    </div>
  );
}

