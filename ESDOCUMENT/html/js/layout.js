
var Layout = {
  count: 0,
  apps: [],
  data: [],
  tplBlock: null,
  postUrl : '',
  init: function() {
    var self = Layout;
    var tplBlock = self.tplBlock = jQuery('#tpl_block');
    self.apps = jQuery.evalJSON(jQuery('#app_list').html());
    var html = jQuery('#data').html();
    html = jQuery.trim(html);
    if(html.length > 0) {
      self.data = jQuery.evalJSON(html);
    }
    self.rebuildBlock(self.data); 
    self.postUrl = jQuery('#post_url').val();
    jQuery('#add_block').click(function(e) {
      e.preventDefault();
      Layout.addBlock();
      /*
      jQuery('#msg').show();
      setTimeout(function(){
          $('#msg').fadeOut('slow');
        }
      ,1000);
      */
    });
    jQuery('#save_layout').click(function(e) {
      Layout.save();
      e.preventDefault();
    });
    $( ".column" ).sortable({
      opacity: 0.5,
      cursor: 'move',
      connectWith: ".column",
      update: function(event, ui){
        if($(ui.item).parent().hasClass('columnR')){
          $(ui.item).find('input').css({width:'150px'});
          $(ui.item).find('select').css({width:'165px'});
          $(ui.item).find('p.hd').css({width:'100%'});
        } else {
          $(ui.item).find('input').css({width:'300px'});
          $(ui.item).find('select').css({width:'310px'});
          $(ui.item).find('p.hd').css({width:'380px'});
        }
      }
    });
    $( ".column" ).disableSelection();

  },
  addBlock: function() {
    var self = Layout;
    var newBlock = self.tplBlock.clone();
    self.setBlock(newBlock);
    jQuery('#builder div.column:eq(0)').append(newBlock);
    self.count = self.count + 1;
    newBlock.attr('id', 'block_' + (self.count)).show();
    return;
    $(newBlock).find('select[name=ba]').change(function(){
      var val = $(this).val();
      if(val === '0' || typeof self.apps[val] === 'undefined'){
        $(newBlock).find('select[name=bv]').html('');
        return;
      }
      var html = '';
      for(viewName in self.apps[val].views){
        html += '<option value="'+viewName+'">'+self.apps[val].views[viewName]+'</option>';
      }
      $(newBlock).find('select[name=bv]').html(html);
    });
  },
  setBlock: function(el, title, appid, viewid,c) {
    if (typeof title === 'undefined') {
      title = '';
    }
    if (typeof appid === 'undefined') {
      for (appid in Layout.apps) {
        break;
      }
    }
    if (typeof viewid === 'undefined') {
      viewid = '';
    }
    var hd = el.find('h3.hd');
    if (title !== '') {
      hd.text(title);
    }
    var selView = el.find('select[name=bv]');
    el.find('input[name=bt]').val(title).keyup(function(e) {
      hd.text(jQuery(this).val());
    }).change(function(e) {
      hd.text(jQuery(this).val());
    });
    el.find('select[name=ba]').val(appid).change(function(e) {
      var appid = jQuery(this).val();
      var views = Layout.apps[appid].views;
      var html = ['<option value="">- 请选择视图 -</option>'], i;
      $(selView).html('');
      for (i in views) {
        selView[0].options[selView[0].options.length]=new Option(views[i],i);
        //html.push('<option value="' + i + '">' + views[i] + '</option>');
      }
      //selView.html(html.join(''));
    });
    if(c == 1){
      $(el).find('input').css({width:'150px'});
      $(el).find('select').css({width:'165px'});
      $(el).find('p.hd').css({width:'100%'});
    }
    if (typeof Layout.apps[appid] !== 'undefined') {
      var views = Layout.apps[appid].views;
      var html = [], i;
      for (i in views) {
        html.push('<option value="' + i + '">' + views[i] + '</option>');
      }
      selView.html(html.join(''));
    }
    el.find('a.btn_close').click(function(e) {
      if (window.confirm('删除该区块吗？')) {
        el.slideUp('fast', function() {
          el.remove();
        });
      }
      e.preventDefault();
    });
    
    selView.val(viewid);
  },
  getBlock: function(el) {
    return [
      el.find('input[name=bt]').val(),
      el.find('select[name=ba]').val(),
      el.find('select[name=bv]').val()
    ];
  },
  save: function() {
    // 遍历block
    var self = Layout;
    var result = [];
    
    
    jQuery('#builder div.column').each(function(i, column) {
      if (typeof result[i] === 'undefined') {
        result[i] = [];
      }
      jQuery(column).children().each(function(j, block) {
        result[i].push(self.getBlock(jQuery(block)));
      });
    });
    $.ajax({
      url:self.postUrl,
      type:'post',
      dataType:'json',
      data:{data:jQuery.toJSON(result)},
      success:function(resp){
        if( typeof resp.redirect_url != 'undefined') {
          window.location.href = resp.redirect_url;
        } else {
          alert('保存成功');
        }
      }
    });
    return;
    // 写入data
    jQuery('#data').val(jQuery.toJSON(result));
    // 提交表单
    jQuery('form#layout_form').submit();
  },
  rebuildBlock: function(data) {
    var self = Layout;
    var columns = [];
    var newBlock, c, b, i, j;
    for (i in data) {
      if (typeof columns[i] === 'undefined') {
        columns[i] = jQuery('#builder div.column.c' + i);
      }
      c = data[i];
      for (j in c) {
        b = c[j]; 
        newBlock = self.tplBlock.clone();
        self.setBlock(newBlock, b[0], b[1], b[2],i);
        columns[i].append(newBlock);
        self.count = self.count + 1;
        newBlock.attr('id', 'block_' + (self.count)).show();
      }
    }
  }
};


