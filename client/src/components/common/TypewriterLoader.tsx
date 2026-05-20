// Self-contained typewriter loader. The original was authored with
// styled-components; this project doesn't use that, so the CSS lives in a
// scoped <style> block keyed under `.typewriter`. Colors are themed to the
// report/indigo palette.
export function TypewriterLoader() {
  return (
    <div className="tw-loader" role="status" aria-label="Generating report">
      <style>{CSS}</style>
      <div className="typewriter">
        <div className="slide">
          <i />
        </div>
        <div className="paper" />
        <div className="keyboard" />
      </div>
    </div>
  );
}

const CSS = `
.tw-loader { display: flex; align-items: center; justify-content: center; }
.tw-loader .typewriter {
  --blue: #818cf8;
  --blue-dark: #4338ca;
  --key: #fff;
  --paper: #eef2ff;
  --text: #00000038;
  --tool: #ec4899;
  --duration: 3s;
  position: relative;
  animation: tw-bounce05 var(--duration) linear infinite;
}
.tw-loader .typewriter .slide {
  width: 92px; height: 20px; border-radius: 3px; margin-left: 14px;
  transform: translateX(14px);
  background: linear-gradient(var(--blue), var(--blue-dark));
  animation: tw-slide05 var(--duration) ease infinite;
}
.tw-loader .typewriter .slide:before,
.tw-loader .typewriter .slide:after,
.tw-loader .typewriter .slide i:before { content: ""; position: absolute; background: var(--tool); }
.tw-loader .typewriter .slide:before { width: 2px; height: 8px; top: 6px; left: 100%; }
.tw-loader .typewriter .slide:after { left: 94px; top: 3px; height: 14px; width: 6px; border-radius: 3px; }
.tw-loader .typewriter .slide i { display: block; position: absolute; right: 100%; width: 6px; height: 4px; top: 4px; background: var(--tool); }
.tw-loader .typewriter .slide i:before { right: 100%; top: -2px; width: 4px; border-radius: 2px; height: 14px; }
.tw-loader .typewriter .paper {
  position: absolute; left: 24px; top: -26px; width: 40px; height: 46px; border-radius: 5px;
  background: var(--paper); transform: translateY(46px);
  animation: tw-paper05 var(--duration) linear infinite;
}
.tw-loader .typewriter .paper:before {
  content: ""; position: absolute; left: 6px; right: 6px; top: 7px; border-radius: 2px; height: 4px;
  transform: scaleY(0.8); background: var(--text);
  box-shadow: 0 12px 0 var(--text), 0 24px 0 var(--text), 0 36px 0 var(--text);
}
.tw-loader .typewriter .keyboard { width: 120px; height: 56px; margin-top: -10px; z-index: 1; position: relative; }
.tw-loader .typewriter .keyboard:before, .tw-loader .typewriter .keyboard:after { content: ""; position: absolute; }
.tw-loader .typewriter .keyboard:before {
  top: 0; left: 0; right: 0; bottom: 0; border-radius: 7px;
  background: linear-gradient(135deg, var(--blue), var(--blue-dark));
  transform: perspective(10px) rotateX(2deg); transform-origin: 50% 100%;
}
.tw-loader .typewriter .keyboard:after {
  left: 2px; top: 25px; width: 11px; height: 4px; border-radius: 2px;
  box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  animation: tw-keyboard05 var(--duration) linear infinite;
}
@keyframes tw-bounce05 { 85%,92%,100% { transform: translateY(0); } 89% { transform: translateY(-4px); } 95% { transform: translateY(2px); } }
@keyframes tw-slide05 { 5% { transform: translateX(14px); } 15%,30% { transform: translateX(6px); } 40%,55% { transform: translateX(0); } 65%,70% { transform: translateX(-4px); } 80%,89% { transform: translateX(-12px); } 100% { transform: translateX(14px); } }
@keyframes tw-paper05 { 5% { transform: translateY(46px); } 20%,30% { transform: translateY(34px); } 40%,55% { transform: translateY(22px); } 65%,70% { transform: translateY(10px); } 80%,85% { transform: translateY(0); } 92%,100% { transform: translateY(46px); } }
@keyframes tw-keyboard05 {
  5%,12%,21%,30%,39%,48%,57%,66%,75%,84% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  9% { box-shadow: 15px 2px 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  18% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 2px 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  27% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 12px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  36% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 12px 0 var(--key), 60px 12px 0 var(--key), 68px 12px 0 var(--key), 83px 10px 0 var(--key); }
  45% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 2px 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  54% { box-shadow: 15px 0 0 var(--key), 30px 2px 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  63% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 12px 0 var(--key); }
  72% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 2px 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
  81% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 12px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
}
@media (prefers-reduced-motion: reduce) {
  .tw-loader .typewriter,
  .tw-loader .typewriter .slide,
  .tw-loader .typewriter .paper,
  .tw-loader .typewriter .keyboard:after { animation: none !important; }
}
`;
