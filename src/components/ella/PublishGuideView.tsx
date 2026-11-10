import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);


export const PublishGuideView: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const currentSharedUrl = 'https://rahuljuly15-png.github.io/ELLA-Grammar-Studio/';

  const githubActionYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentSharedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(githubActionYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner: ₹0 Free Guarantee */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-3xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>₹0 लागत गारंटी (100% Free of Cost Forever)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          आपको ₹1 भी खर्च करने या अपग्रेड करने की ज़रूरत नहीं है!
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
          क्योंकि ELLA को <strong>लोकल-फ़र्स्ट (Local-First PWA)</strong> बनाया गया है, इसका कोई बैकएंड सर्वर खर्च नहीं है। डेटाबेस (Dexie.js) छात्र के फ़ोन में ही रहता है, नियम इंजन 100% मुफ़्त चलता है, और ऑडियो फ़ोन के अपने स्पीकर से आता है।
        </p>
      </div>

      {/* Live Active URL Box */}
      <div className="p-6 bg-white border border-indigo-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              आपका लाइव शेयर्ड यूआरएल (Live Public Link)
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              यह ऐप अभी भी इंटरनेट पर लाइव चल रहा है:
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">लिंक कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>लिंक कॉपी करें</span>
                </>
              )}
            </button>
            <a
              href={currentSharedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              <span>ब्राउज़र में खोलें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-indigo-900 break-all select-all font-semibold">
          {currentSharedUrl}
        </div>

        <p className="text-xs text-slate-500">
          💡 इस लिंक को आप सीधे WhatsApp, क्लास ग्रुप, या छात्रों के साथ शेयर कर सकते हैं। वे इसे बिना किसी लॉगिन के तुरंत खोल सकते हैं।
        </p>
      </div>

      {/* Interactive Device Preview Simulator */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              पब्लिश होने के बाद कैसा दिखाई देगा (Live Preview Simulator)
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              छात्र के मोबाइल या कंप्यूटर पर ऐसा लुक दिखेगा:
            </h3>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                previewDevice === 'mobile'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>मोबाइल व्यू (Android Phone)</span>
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                previewDevice === 'desktop'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>डेस्कटॉप व्यू (Computer)</span>
            </button>
          </div>
        </div>

        {/* Device Frame */}
        <div className="flex justify-center p-4 bg-slate-100/70 rounded-2xl border border-slate-200/80">
          {previewDevice === 'mobile' ? (
            /* Mobile Mockup */
            <div className="w-[340px] sm:w-[380px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
              {/* Speaker / Camera Notch */}
              <div className="w-24 h-4 bg-slate-800 mx-auto rounded-full mb-2" />
              
              {/* Phone Screen */}
              <div className="bg-slate-50 rounded-[30px] overflow-hidden p-4 space-y-3.5 border border-slate-200 text-slate-800 text-xs">
                {/* Header in phone */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      E
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900 leading-none">ELLA Studio</div>
                      <div className="text-[9px] text-slate-500">कक्षा 7 व्याकरण</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    ✓ Offline
                  </span>
                </div>

                {/* Simulated Topic Card */}
                <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-indigo-600">Level 1 • Articles</span>
                    <span className="text-slate-400">0ms Regex</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">उपपद (A, An, The)</div>
                  <div className="text-[10px] text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-200">
                    💡 <strong>नियम:</strong> स्वर ध्वनि (Vowel Sound) से पहले 'An' लगाएं।
                  </div>
                </div>

                {/* Simulated Input Area */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                  <div className="font-semibold text-slate-700 text-[10px]">वाक्य निर्माण (Live Test):</div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800">
                    Wait here for <span className="text-rose-600 underline font-bold">a</span> hour.
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 flex items-center justify-between">
                    <span>सुधार: <strong>an hour</strong> ('h' मूक है)</span>
                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">Apply Fix</span>
                  </div>
                </div>

                {/* Navigation bar in phone */}
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500">
                  <span className="text-indigo-600 bg-indigo-50 py-1 rounded">अभ्यास</span>
                  <span className="py-1">मानचित्र</span>
                  <span className="py-1">त्रुटि बैंक</span>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-32 h-1 bg-slate-700 mx-auto rounded-full mt-2" />
            </div>
          ) : (
            /* Desktop Mockup */
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden text-xs">
              <div className="bg-slate-200 px-4 py-2 border-b border-slate-300 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="bg-white px-3 py-0.5 rounded-md text-[10px] text-slate-600 font-mono flex-1 text-center truncate">
                  https://rahuljuly15-png.github.io/ELLA-Grammar-Studio
                </div>
              </div>
              <div className="p-6 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 text-sm">ELLA Grammar Studio v2.1</div>
                  <div className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    100% Free & Local-First PWA
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="font-bold text-slate-900">कक्षा 7 के 21 विषय और 4 इंजन पूरी तरह लाइव हैं!</div>
                  <div className="text-slate-600">सभी छात्र अपनी गति से अभ्यास कर सकते हैं, उच्चारण सुन सकते हैं और गलतियाँ सुधार सकते हैं।</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct Push to GitHub Section */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-3xl space-y-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
          <GithubIcon className="w-4 h-4 text-indigo-600" />
          <span>सीधे GitHub पर पुश करने के निर्देश (Push to rahuljuly15-png/ELLA-Grammar-Studio)</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            मैंने आपका सारा कोड Git Commit में तैयार कर लिया है!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
            सुरक्षा कारणों से GitHub केवल आपके टोकन (Personal Access Token) के ज़रिए ही आपकी रिपॉजिटरी में लिखने की अनुमति देता है।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-indigo-700 text-sm">विकल्प A: चैट में टोकन दें (मैं अभी तुरंत पुश कर दूंगा)</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>GitHub खोलें: <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">github.com/settings/tokens</a></li>
              <li><strong>Generate new token (classic)</strong> पर क्लिक करें।</li>
              <li><strong>repo</strong> चेकबॉक्स पर टिक करें।</li>
              <li>बने हुए टोकन (जो <code>ghp_...</code> से शुरू होता है) को कॉपी करके यहाँ चैट में भेज दें।</li>
              <li>मैं 2 सेकंड में आपकी रिपॉजिटरी में सीधे पुश कर दूंगा!</li>
            </ol>
          </div>

          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-slate-900 text-sm">विकल्प B: अपने कंप्यूटर (Terminal) से पुश करें</span>
            <p className="text-slate-600 leading-relaxed">
              यदि आपके कंप्यूटर में <code>C:\Users\rahul\ELLA-Grammar-Studio</code> मौजूद है, तो टर्मिनल में बस ये 2 कमांड चलाएँ:
            </p>
            <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-indigo-300 space-y-1">
              <div>git add .</div>
              <div>git commit -m "feat: complete light UI & deploy"</div>
              <div>git push origin main</div>
            </div>
          </div>
        </div>
      </div>

        {/* GitHub Actions YAML Code ready to copy */}
        <div className="p-5 bg-slate-950 text-slate-200 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                1-क्लिक ऑटो डिप्लॉय कोड (GitHub Actions)
              </span>
              <div className="text-xs text-slate-300">
                इसे अपनी रेपो में <code>.github/workflows/deploy.yml</code> फ़ाइल में पेस्ट करें:
              </div>
            </div>
            <button
              onClick={copyYaml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedYaml ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">YAML कोड कॉपी हुआ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy GitHub Actions YAML</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto max-h-48 leading-relaxed">
            <code>{githubActionYaml}</code>
          </pre>
        </div>
    </div>
  );
};
