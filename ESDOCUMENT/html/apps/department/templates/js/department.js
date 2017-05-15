App.Department = {
  dMembers: null,
  dTree: null,
  dSelectBox: null,
  dSelected: null,
  dOpe: null,
  urlPeople: null,
  initialize: function(el, urlOrg, urlPeople) {
    var self = App.Department, dTree, dSelectBox, dSelected, dOpe;
    self.dMembers = el;
    self.urlPeople = urlPeople,
    dTree = self.dTree = el.find('#org_tree');
    dSelectBox = self.dSelectBox = el.find('#department_selectbox');
    dSelectBox.find('a.btn_select_people:eq(0)').click(function(e) {
      e.preventDefault();
      var dChk = dSelectBox.find('input:checkbox');
      if (dChk.length > 1) {
        dChk.eq(0).attr('checked', false);
        dChk.slice(1).attr('checked', 'checked');
      } else if (dChk.length === 1) {
        alert('当前部门没有下属人员');
      } else {
        alert('请先选择部门');
      }
    });
    dSelected = self.dSelected = el.find('#department_selected');
    dOpe = self.dOpe = el.find('#department_ope');
    dOpe.find('a:eq(0)').click(function(e) {
      e.preventDefault();
      var dChk = dSelectBox.find('input:checkbox:checked');
      var dSel = dSelected.find('table:eq(0)');
      if (dChk.length) {
        dChk.each(function(i, obj) {
          if (!self.findExists(obj.name)) {
            $(obj).closest('tr').clone().appendTo(dSel).find('input:checkbox:checked').attr('checked', false);
          }
        });
      } else {
        alert('未选择需要加入部门或人员');
      }
    });
    dOpe.find('a:eq(1)').click(function(e) {
      e.preventDefault();
      var dChk = dSelected.find('input:checkbox:checked');
      if (dChk.length) {
        dChk.closest('tr').remove();
      } else {
        alert('未选择需要取消的部门或人员');
      }
    });
    $('#save_members').click(function(e) {
      e.preventDefault();
      App.Department.dSelected.find('input:checkbox').attr('checked', 'checked');
      $('#form_selected').submit();
    });
    self.initTree(urlOrg);
  },
  findExists: function(id) {
    var dSelected = App.Department.dSelected.find('table:eq(0)');
    return dSelected.find('input[name="' + id + '"]').length;
  },
  initTree : function(url) {
    var self = App.Department;
    self.dTree.tree({
      url: url,
      method: 'get',
      onClick: function(node){
        var org_id = node.id;
        var url = self.urlPeople;
        //获取该组织里的所有人员
        $.getJSON(url, {id: org_id}, function(data) {
          if (typeof data === 'object') {
            var i, row, dRow, id, checked, el = self.dSelectBox.find('table:eq(0)');
            el.empty();
            for (i in data) {
              if (data.hasOwnProperty(i)) {
                row = data[i];
                id = 'm[' + row.type + '_' + row.id + ']';
                if (self.findExists(id)) {
                  checked = ' checked="checked"';
                } else {
                  checked = '';
                }
                dRow = $('<tr><td><input type="checkbox"' + checked + ' name="' + id + '" class="marginRight5" style="vertical-align:middle"><label>' + row.name + ' <span class="color999">(' + row.email + ')</span></label></td></tr>')
                el.append(dRow);
              }
            }
          }
        });
      }
    });
    return this;
  }
}
