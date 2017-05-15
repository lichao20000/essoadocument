var Desktop = {
  count: 0,
  apps: [],
  data: [],
  tplBlock: null,
  init: function() {
    var self = Desktop;
    var tplBlock = self.tplBlock = jQuery('#tpl_block');
    
    self.apps = jQuery.evalJSON(jQuery('#form_applist').html());
    var data = self.data = jQuery.evalJSON(jQuery('#form_data').html());
    self.rebuildBlock(data);
    jQuery('#add_block').click(function(e) {
      Desktop.addBlock();
      e.preventDefault();
    });
    jQuery('#save_layout').click(function(e) {
      Desktop.save();
      e.preventDefault();
    });
    $( ".column" ).sortable({
      opacity: 0.5,
      cursor: 'move',
      connectWith: ".column",
      update: function(event, ui){
        if($(ui.item).parent().hasClass('appDesktopR')){
          $(ui.item).find('input').css({width:'150px'});
          $(ui.item).find('select').css({width:'165px'});
          $(ui.item).find('p.hd').css({width:'200px'});
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
    var self = Desktop;
    var newBlock = self.tplBlock.clone();
    self.setBlock(newBlock);
    jQuery('#department div.column:eq(0)').append(newBlock);
    self.count = self.count + 1;
    newBlock.attr('id', 'block_' + (self.count)).show();
  },
  setBlock: function(el, title, appid, viewid, c) {
    if (typeof title === 'undefined') {
      title = '';
    }
    if (typeof appid === 'undefined') {
      for (appid in Desktop.apps) {
        break;
      }
    }
    if (typeof viewid === 'undefined') {
      viewid = '';
    }
    var selView = el.find('select[name=bv]');
    el.find('input[name=bt]').val(title).keyup(function(e) {
      hd.text(jQuery(this).val());
    }).change(function(e) {
      hd.text(jQuery(this).val());
    });
    el.find('select[name=ba]').val(appid).change(function(e) {
      var appid = jQuery(this).val();
      var views = Desktop.apps[appid].views;
      var html = ['<option value="">- 请选择视图 -</option>'], i;
      for (i in views) {
        html.push('<option value="' + i + '">' + views[i] + '</option>');
      }
      selView.html(html.join(''));
    });
    if(c == 1){
      $(el).find('input').css({width:'150px'});
      $(el).find('select').css({width:'165px'});
      $(el).find('p.hd').css({width:'200px'});
    }
    if (typeof Desktop.apps[appid] !== 'undefined') {
      var views = Desktop.apps[appid].views;
      var html = ['<option value="">- 请选择视图 -</option>'], i;
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
    var self = Desktop;
    var result = [];
    jQuery('#department div.column').each(function(i, column) {
      if (typeof result[i] === 'undefined') {
        result[i] = [];
      }
      jQuery(column).children().each(function(j, block) {
        result[i].push(self.getBlock(jQuery(block)));
      });
    });

    // 写入data
    jQuery('#data').val(jQuery.toJSON(result));
    // 提交表单
    jQuery('form#layout_form').submit();
  },
  rebuildBlock: function(data) {
    var self = Desktop;
    var columns = [];
    var newBlock, c, b, i, j;
    for (i in data) {
      if (typeof columns[i] === 'undefined') {
        columns[i] = jQuery('#department div.column.c' + i);
      }
      c = data[i];
      for (j in c) {
        b = c[j]; 
        newBlock = self.tplBlock.clone();
        self.setBlock(newBlock, b[0], b[1], b[2], i);
        columns[i].append(newBlock);console.dir(columns[i]);
        self.count = self.count + 1;
        newBlock.attr('id', 'block_' + (self.count)).show();
      }
    }
  }
};

jQuery(function() {
  Desktop.init();
});
