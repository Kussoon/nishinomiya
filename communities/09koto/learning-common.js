/* 共通クイズ進行 6.5.255。地域データの分離は次の段階で行う。 */
(() => {
 const mode=document.body.dataset.quizMode;
 if(!mode)return;
 Object.assign(base,{color:'#93acc5',weight:1.3,fillColor:'#dceafb',fillOpacity:1});
 Object.assign(correct,{color:'#22613d',weight:2.5,fillColor:'#70cf91',fillOpacity:1});
 if(mode==='location')Object.assign(incorrect,{color:'#923737',weight:2.5,fillColor:'#f9dddd',fillOpacity:1});
 else Object.assign(highlight,{color:'#b6842b',weight:2.5,fillColor:'#ffe4a5',fillOpacity:1});
 const quiz=byId('quiz'),status=document.createElement('p');status.className='auto-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');quiz.querySelector('.mapwrap').before(status);
 const progress=byId('progress'),scoreNode=byId('scoreNow');scoreNode.hidden=true;quiz.querySelector('.stats').replaceChildren(progress,scoreNode);
 quiz.querySelector('.stage').textContent=mode==='location'?'甲東・名前 → 場所':'甲東・場所 → 名前';
 byId('result').querySelector('.resulthead').textContent='甲東・学習結果';byId('resultCharacter')?.remove();
 if(mode==='name'){quiz.querySelector('.prompt').textContent='黄色の場所の町名は？';}
 let advanceTimer=null,tickTimer=null,remaining=3,deadline=0;
 const dialog=document.querySelector('.exit-dialog');
 function clearAdvance(){clearTimeout(advanceTimer);clearInterval(tickTimer);advanceTimer=tickTimer=null;}
 function canAdvance(){return locked&&!quiz.classList.contains('hidden')&&!dialog.open&&!document.hidden;}
 function schedule(){clearAdvance();if(!canAdvance())return;remaining=3;deadline=Date.now()+3000;status.textContent='3秒後に次の問題へ進みます';tickTimer=setInterval(()=>{remaining=Math.max(1,Math.ceil((deadline-Date.now())/1000));status.textContent=remaining+'秒後に次の問題へ進みます';},200);advanceTimer=setTimeout(()=>{clearAdvance();if(!canAdvance())return;index++;if(index>=order.length)finish();else loadQuestion();},3000);}
 const previousLoad=loadQuestion;loadQuestion=function(){clearAdvance();status.textContent='';previousLoad();};
 const previousStart=start;start=function(...args){clearAdvance();status.textContent='';previousStart(...args);};
 const previousAnswer=answer;answer=function(...args){if(locked||(mode==='name'&&args[0].disabled))return;previousAnswer(...args);score=order.length-missed.size;scoreNode.textContent=score;if(locked){byId('nextBtn').hidden=true;schedule();}};
 finish=function(){clearAdvance();locked=true;status.textContent='';const firstCorrect=order.length-missed.size;byId('resultTotal').textContent='最初の回答で正解した問題';byId('finalScore').textContent=firstCorrect+' / '+order.length+' 問';byId('mistakes').textContent='誤答回数：'+wrong+'回';byId('comment').textContent=missed.size?'間違えた問題を復習して、名前と場所を確かめましょう。':'すべて最初の回答で正解できました！';byId('mistakeRetryBtn').hidden=missed.size===0;byId('retryBtn').textContent='全18町をもう一度';show('result');};
 byId('quitBtn').addEventListener('click',()=>{clearAdvance();if(locked)status.textContent='確認中は自動進行を停止しています';},true);
 dialog.addEventListener('close',()=>{if(canAdvance())schedule();});
 if(layers.length&&!locked&&!quiz.classList.contains('hidden'))loadQuestion();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearAdvance();if(locked)status.textContent='自動進行を一時停止しています';}else if(canAdvance())schedule();});
})();
