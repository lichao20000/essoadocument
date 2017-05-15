var layoutRender = {
  blocks: [],
  init: function() {
    var blocks = layoutRender.blocks, block, id, t, appid, viewname, row;
    $('#desktop .block').each(function(){
      block = $(this);
      id = block.attr('id');
      t = id.split(':');
      appid = t[0];
      viewname = t[1];
      blocks.push({
        el: block,
        url: '/service/view/' + appid + '/' + viewname
      });
    });
    layoutRender.loadBlock();
  },
  loadBlock: function() {
    var blocks = layoutRender.blocks, block;
    block = blocks.shift();
    if (typeof block !== 'undefined') {
      $.get(block.url, function(resp) {
        block.el.css('width', 'auto').find('.cnt').html(resp);
        layoutRender.loadBlock();
      });
    }
  }
};
