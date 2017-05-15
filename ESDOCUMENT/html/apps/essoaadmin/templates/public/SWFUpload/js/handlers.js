
/* This is an example of how to cancel all the files queued up.  It's made somewhat generic.  Just pass your SWFUpload
object in to this method and it loops through cancelling the uploads. */
function cancelQueue(instance) {
	document.getElementById(instance.customSettings.cancelButtonId).disabled = true;
	var startBtn = document.getElementById(instance.customSettings.startButtonId);
	startBtn.disabled = true;
	startBtn.className = "";
	instance.stopUpload();
	var stats;
	
	do {
		stats = instance.getStats();
		instance.cancelUpload();
	} while (stats.files_queued !== 0);
	return false;
}

function startQueue(instance) {
	try {
		instance.startUpload();
	} catch (ex) {
		instance.debug(ex);
	}
	return false;
}

/* **********************
   Event Handlers
   These are my custom event handlers to make my
   web application behave the way I went when SWFUpload
   completes different tasks.  These aren't part of the SWFUpload
   package.  They are part of my application.  Without these none
   of the actions SWFUpload makes will show up in my application.
   ********************** */
function swfuploadLoaded()
{
	// swfupload加载后执行
}
function fileDialogStart() {
	/* I don't need to do anything here */
}
function fileQueued(file) {
	try {
		// You might include code here that prevents the form from being submitted while the upload is in
		// progress.  Then you'll want to put code in the Queue Complete handler to "unblock" the form
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setStatus("等待上传...");
		progress.toggleCancel(true, this);

	} catch (ex) {
		this.debug(ex);
	}

}

function fileQueueError(file, errorCode, message) {
	try {
		if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({width: 150,content: "不能选择太多的文件。\n" + (message == 0 ? "已经达到上传文件限制。" : "最多可以添加   " + message + " 个文件。"),icon: 'error',time: 3});
			return;
		}

		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setError();
		progress.toggleCancel(false);

		switch (errorCode) {
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			progress.setStatus("文件太大。文件大小限制" + this.settings.file_size_limit/1024 + "MB");
			this.debug("错误: 文件太大, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			progress.setStatus("文件大小不能为0。");
			this.debug("错误: 0尺寸文件, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			progress.setStatus("文件格式不可用。");
			this.debug("错误: 文件格式不可用, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			//alert("选择的文件太多.  " +  (message > 1 ? "最多可以添加 " +  message + " 个文件" : "不能再添加文件了."));
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({width: 150,content: "选择的文件太多.  " +  (message > 1 ? "最多可以添加 " +  message + " 个文件" : "不能再添加文件了."),icon: 'error',time: 3});
			break;
		default:
			if (file !== null) {
				progress.setStatus("未知错误。");
			}
			this.debug("错误代码: " + errorCode + ", 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		}
	} catch (ex) {
        this.debug(ex);
    }
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
	try {
		if (this.getStats().files_queued > 0) {
			document.getElementById(this.customSettings.cancelButtonId).disabled = false;
			var startBtn = document.getElementById(this.customSettings.startButtonId);
			startBtn.disabled = false;
			startBtn.className = "aui_state_highlight";
		}
	} catch (ex)  {
        this.debug(ex);
	}
}

function uploadStart(file) {
	try {
		/* I don't want to do any file validation or anything,  I'll just update the UI and return true to indicate that the upload should start */
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setStatus("正在上传...");
		progress.toggleCancel(true, this);
	}
	catch (ex) {
	}
	
	return true;
}

function uploadProgress(file, bytesLoaded, bytesTotal) {

	try {
		var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setProgress(percent);
		progress.setStatus("正在上传...");
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadSuccess(file, serverData) {
	try {
		if(this.customSettings.progressTarget){
			var progress = new FileProgress(file, this.customSettings.progressTarget);
			progress.setComplete();
			progress.setStatus("上传完毕.");
			progress.toggleCancel(false);
		}
		if(typeof this.customSettings.uploadSuccess === "function"){
			this.customSettings.uploadSuccess(file, serverData, this.getStats().files_queued);
		}
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadComplete(file) {
	try {
		/*  I want the next upload to continue automatically so I'll call startUpload here */
		if (this.getStats().files_queued === 0) {
			document.getElementById(this.customSettings.cancelButtonId).disabled = true;
			var startBtn = document.getElementById(this.customSettings.startButtonId);
			startBtn.disabled = true;
			startBtn.className = "";
		} else {	
			this.startUpload();
		}
	} catch (ex) {
		this.debug(ex);
	}

}

function uploadError(file, errorCode, message) {
	try {
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setError();
		progress.toggleCancel(false);

		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			progress.setStatus("上传出错: " + message);
			this.debug("错误: HTTP错误, 文件名: " + file.name + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
			progress.setStatus("配置错误");
			this.debug("错误: No backend file, 文件名: " + file.name + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			progress.setStatus("上传失败.");
			this.debug("错误: 上传失败, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			progress.setStatus("服务器 (IO) 错误");
			this.debug("错误: IO错误, 文件名: " + file.name + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			progress.setStatus("安全问题");
			this.debug("错误: 安全问题, 文件名: " + file.name + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			progress.setStatus("上传超出限制.");
			this.debug("错误: 上传超出限制, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
			progress.setStatus("文件未找到.");
			this.debug("错误: 文件未找到, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			progress.setStatus("验证失败.  跳过上传.");
			this.debug("错误: 文件验证失败, 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			if (this.getStats().files_queued === 0) {
				document.getElementById(this.customSettings.cancelButtonId).disabled = true;
				var startBtn = document.getElementById(this.customSettings.startButtonId);
				startBtn.disabled = true;
				startBtn.className = "";
			}
			progress.setStatus("取消上传");
			progress.setCancelled();
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			progress.setStatus("停止上传");
			break;
		default:
			progress.setStatus("未知错误: " + error_code);
			this.debug("错误: " + errorCode + ", 文件名: " + file.name + ", 文件大小: " + file.size + ", 信息: " + message);
			break;
		}
	} catch (ex) {
        this.debug(ex);
    }
}
//上传图片即时显示
function imageDialogComplete(numFilesSelected, numFilesQueued) {
	try {
		this.startUpload();
	} catch (ex) {
		this.debug(ex);
	}
}