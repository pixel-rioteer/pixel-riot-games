// Keep form controls (especially the Spacer height slider) interactive while preserving drag-to-reorder.
function fixBuilderDrag(root=document){
  root.querySelectorAll('.layout-card[draggable="true"]').forEach(card=>{
    card.draggable=false;
    const handle=card.querySelector('.drag');
    if(!handle || handle.dataset.dragFix==='1') return;
    handle.dataset.dragFix='1';
    handle.draggable=true;
    handle.addEventListener('dragstart',e=>{
      e.stopPropagation();
      const slot=card.closest('[data-builder-slot]');
      if(slot) slot.dataset.drag=card.dataset.i ?? card.dataset.iPlus ?? '';
      handle.classList.add('dragging');
    });
    handle.addEventListener('dragend',()=>{
      const slot=card.closest('[data-builder-slot]');
      if(slot) delete slot.dataset.drag;
      handle.classList.remove('dragging');
    });
  });
}
fixBuilderDrag();
new MutationObserver(()=>fixBuilderDrag()).observe(document.documentElement,{childList:true,subtree:true});
