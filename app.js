import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

// Transformers.js browser cache: model files are cached by the browser's Cache API.
env.allowLocalModels = false;
env.useBrowserCache = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

const $ = id => document.getElementById(id);
let asr = null, translator = null, stream = null, recording = false, loopTimer = null;
let busy = false, lastLine = "";
const setStatus = (s,on=false) => { $("status").textContent=s; $("dot").classList.toggle("on",on); };
const setMic = (s,on=false) => { $("micstatus").textContent=s; $("micdot").classList.toggle("on",on); };

async function loadModels(){
  $("load").disabled = true;
  $("modelState").textContent = "Hazırlanıyor…";
  $("progress").value = 3;
  setStatus("Yerel modeller yükleniyor. İlk indirme uzun sürebilir…",true);
  try{
    // Whisper tiny is multilingual and can transcribe English locally.
    asr = await pipeline("automatic-speech-recognition","Xenova/whisper-tiny",{
      progress_callback: p => {
        if (p.status === "progress" && p.total) {
          $("progress").value = Math.max(3,Math.min(99,Math.round(p.loaded/p.total*100)));
          $("modelState").textContent = "İndiriliyor…";
        }
      }
    });
    $("progress").value = 65;
    // Marian English -> Turkish translation model.
    translator = await pipeline("translation",onnx-community/opus-mt-tc-big-en-tr);
    $("progress").value = 100;
    $("modelState").textContent = "Hazır";
    $("modelInfo").textContent = "Modeller yüklendi. Tarayıcı önbelleğinde tutulmaları beklenir; iOS depolama temizliği bunları silebilir.";
    $("start").disabled = false;
    setStatus("Modeller hazır. İnternet bağlantısını kapatıp tekrar açarak çevrimdışı testi yapabilirsin.",true);
  }catch(e){
    console.error(e);
    $("modelState").textContent = "Yükleme başarısız";
    setStatus("Model yüklenemedi: "+(e.message||e));
    $("modelInfo").textContent = "Bağlantını ve boş depolama alanını kontrol et. Bazı iPhone tarayıcıları bu modelleri çalıştırmak için yeterli bellek sunmayabilir.";
  }finally{$("load").disabled=false;}
}

function resampleTo16k(audioBuffer){
  const src=audioBuffer.getChannelData(0), from=audioBuffer.sampleRate, to=16000;
  if(from===to) return src;
  const length=Math.round(src.length*to/from), out=new Float32Array(length);
  const ratio=from/to;
  for(let i=0;i<length;i++){
    const pos=i*ratio, left=Math.floor(pos), right=Math.min(left+1,src.length-1), frac=pos-left;
    out[i]=src[left]*(1-frac)+src[right]*frac;
  }
  return out;
}
async function transcribeBlob(blob){
  if(!blob.size || busy) return;
  busy=true;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const buffer=await ctx.decodeAudioData(await blob.arrayBuffer());
    const audio=resampleTo16k(buffer);
    await ctx.close();
    const result=await asr(audio,{language:"english",task:"transcribe",chunk_length_s:10,stride_length_s:2});
    const text=(result.text||"").trim();
    if(!text || text===lastLine) return;
    lastLine=text;
    $("original").textContent=text;$("original").classList.remove("empty");
    setStatus("Konuşma algılandı, çevriliyor…",true);
    const translated=await translator(text,{});
    const tr=(translated?.[0]?.translation_text||"").trim();
    $("translated").textContent=tr || "Çeviri üretilemedi";$("translated").classList.remove("empty");
    addHistory(text,tr);
    setStatus("Dinliyor · Yerel işleme",true);
  }catch(e){
    console.error(e);
    setStatus("Ses işlenemedi: "+(e.message||e));
  }finally{busy=false;}
}
function addHistory(en,tr){
  const empty=$("history").querySelector(".note"); if(empty) empty.remove();
  const item=document.createElement("div");item.className="item";
  const a=document.createElement("small");a.className="history-en";a.textContent=en;
  const b=document.createElement("div");b.textContent=tr;
  item.append(a,b);$("history").prepend(item);
  if(!$("showEnglish").checked) a.classList.add("hidden");
}
async function recordCycle(){
  if(!recording || !stream) return;
  let mime="";
  for(const t of ["audio/mp4","audio/webm;codecs=opus","audio/webm"]){
    if(MediaRecorder.isTypeSupported?.(t)){mime=t;break;}
  }
  let recorder;
  try{recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);}
  catch(e){setMic("Bu tarayıcıda ses kaydı desteklenmiyor");stopListening();return;}
  const chunks=[];
  recorder.ondataavailable=e=>{if(e.data?.size) chunks.push(e.data);};
  recorder.onstop=async()=>{
    const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});
    await transcribeBlob(blob);
    if(recording) loopTimer=setTimeout(recordCycle,150);
  };
  recorder.start();
  setTimeout(()=>{if(recorder.state==="recording")recorder.stop();},6000);
}
async function startListening(){
  if(!asr||!translator){setStatus("Önce modelleri yükle.");return;}
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    recording=true;$("start").disabled=true;$("stop").disabled=false;
    setMic("Mikrofon açık · TV sesini telefona duyur",true);
    setStatus("Dinliyor · Yaklaşık 6 saniyelik ses parçaları işlenir",true);
    recordCycle();
  }catch(e){setMic("Mikrofon izni verilmedi");setStatus(e.message||"Mikrofon açılamadı");}
}
function stopListening(){
  recording=false;clearTimeout(loopTimer);
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
  $("start").disabled=!asr;$("stop").disabled=true;
  setMic("Mikrofon kapalı");setStatus("Durduruldu");
}
$("load").addEventListener("click",loadModels);
$("check").addEventListener("click",()=>setStatus(navigator.onLine?"İnternet var. Model önbelleği ayrıca doğrulanmalı.":"Çevrimdışısın. Daha önce indirilen modeller önbellekteyse çalışabilir."));
$("start").addEventListener("click",startListening);
$("stop").addEventListener("click",stopListening);
$("clear").addEventListener("click",()=>{$("original").textContent="Konuşma bekleniyor…";$("translated").textContent="Türkçe altyazı burada görünecek.";$("original").classList.add("empty");$("translated").classList.add("empty");$("history").innerHTML='<div class="note">Henüz altyazı yok.</div>';lastLine="";});
$("showEnglish").addEventListener("change",e=>document.querySelectorAll(".history-en").forEach(x=>x.classList.toggle("hidden",!e.target.checked)));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
