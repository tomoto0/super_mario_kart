import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            🏎️ Super Kart Racing 3D
          </h1>
          <p className="text-xl text-slate-300">
            Experience high-speed racing with AI opponents, drift mechanics, and power-ups!
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <a href="/game.html">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg px-8 py-6"
            >
              🏁 Start Racing
            </Button>
          </a>
        </div>

        <div className="mt-12 bg-slate-800/50 backdrop-blur rounded-lg p-8 max-w-2xl mx-auto text-left">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <p className="font-semibold text-white mb-2">Controls:</p>
              <ul className="space-y-1 text-sm">
                <li>↑ W - Accelerate</li>
                <li>↓ S - Brake</li>
                <li>← A - Turn Left</li>
                <li>→ D - Turn Right</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Special Actions:</p>
              <ul className="space-y-1 text-sm">
                <li>SPACE - Drift (Turbo!)</li>
                <li>SHIFT - Use Item</li>
                <li>P / ESC - Pause</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            💡 Drift to build turbo! Watch the color change from blue → orange → purple to maximize your boost!
          </p>
        </div>
      </div>
    </div>
  );
}
