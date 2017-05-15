/*
 
	{
		author:fangjixiang,
		date:2012/12/06,
		function : upload images
	}

 */

CKEDITOR.plugins.add("upload",{
		requires:["dialog"],
		//lang:["en"],
		init:function (a){
			a.addCommand("upload", new CKEDITOR.dialogCommand("upload"));
			a.ui.addButton("Upload",{
				label:"插入图片",
				command:"upload",
				icon:this.path + "upload.gif"
			});
			CKEDITOR.dialog.add("upload", this.path + "dialogs/upload.js");
		}
	}
);