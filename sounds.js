window.GM_SOUNDS={
 unlock:function(){},
 draw:function(){try{const a=document.getElementById('drawSound'); if(a){a.currentTime=0; a.play().catch(()=>{});}}catch(e){}},
 applause:function(){try{const a=document.getElementById('applauseSound'); if(a){a.currentTime=0; a.play().catch(()=>{});}}catch(e){}}
};