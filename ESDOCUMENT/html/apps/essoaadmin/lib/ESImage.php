<?php
	/**
	 * 图片处理类
	 * @author wangtao
	 * @2013-01-16
	 * @modify author fangjixiang
	 * @modify date 2013-04-15
	 */
class ESImage{
	
	private $imagePath;//图片路径
	private $width;//缩放图片宽度
	private $height;//缩放图片高度
	private $postfix;//后缀名称
	private $fileName; // 图片原始名字 // @author:fangjixiang
	//构造函数设置缩放高度和宽度
	public function __construct($imagePath,$width,$height,$fileName,$postfix='thumb'){
		$this->imagePath=$imagePath;
		$this->width=$width;
		$this->height=$height;
		$this->postfix=$postfix;
		$this->fileName = $fileName; // @author:fangjixiang
	}
	/**
	 * 计算等比缩放并创建画布
	 */
	public function thumbSize(){
		if(is_file($this->imagePath)){
			$imageInfo=getImageSize($this->imagePath);
			$imgWidth=$imageInfo[0];//图片实际宽度
			$imgHeight=$imageInfo[1];//图片实际高度
			
			//计算宽高比例,获取缩略图的宽度和高度
			if($imgWidth >= $imgHeight)
			{
				$thumbWidth  = $this->width;
				$thumbHeight = ($this->width * $imgHeight ) / $imgWidth;
			}
			else
			{
				$thumbWidth  = ($this->height * $imgWidth ) / $imgHeight ;
				$thumbHeight = $this->height;
			}
			$imageResourse=$this->createImage();
			$imageTarget = imageCreateTrueColor($thumbWidth,$thumbHeight);
			$result=imagecopyresampled($imageTarget,$imageResourse,0,0,0,0,$thumbWidth,$thumbHeight,$imgWidth,$imgHeight);
			if($result){
				$imageName=$this->printOutImage($imageTarget);
				return array('src_image'=>"/".$this->imagePath,'dst_image'=>"/".$imageName, 'fileName'=> $this->fileName);
			}
			
		}
	}
	/**
	 * 根据原始图片格式创建画布
	 */
	private function createImage(){
		$fileName=$this->imagePath;
		$extension = $this->getImageExtension();
		switch($extension)
	    {
	        case 'jpg' :
	        case 'jpeg':
	        {
	        	$imageRes = imagecreatefromjpeg($fileName);
	        }
	        break;

	        case 'gif' :
	        {
	        	$imageRes = imagecreatefromgif($fileName);
	        }
	        break;

	        case 'png' :
	        {
	        	$imageRes = imagecreatefrompng($fileName);
	        }
	        break;

	        case 'bmp' :
	        {
				$imageRes = imagecreatefromwbmp($fileName);
	        }
	        break;
	    }
	    return $imageRes;
	}
	/**
	 * 根据原始图片格式输出对应格式的图片
	 */
	private function printOutImage($imageRes){
		$extension = $this->getImageExtension();
		$fileDir=dirname($this->imagePath);
		if(!is_writeable($fileDir)){
			return false;
		}
		$newName=basename($this->imagePath,'.'.$extension);
		//$randNum = mt_rand(100,999);
		$imageName=$fileDir.'/'.$newName.'_'.$this->postfix.'.'.$extension;
		switch($extension)
		{
			case 'jpg' :
			case 'jpeg':
				{
					imagejpeg ($imageRes,$imageName,100);
				}
				break;
		
			case 'gif' :
				{
					imagegif ($imageRes,$imageName);
					
				}
				break;
		
			case 'png' :
				{
					imagepng($imageRes,$imageName);
					
				}
				break;
		
			case 'bmp' :
				{
					imagewbmp ($imageRes,$imageName);
					
				}
				break;
		}
		imageDestroy($imageRes);
		return $imageName;
	}
	
	/**
	 * 获取图片扩展名
	 */
	private function getImageExtension(){
		$fileInfo = pathinfo($this->imagePath);
		$extension = strtolower($fileInfo['extension']);
		return $extension;
	}
}