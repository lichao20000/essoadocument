
jQuery.fn.fadeSlideShow = function(options) {
	return this.each(function(){
		settings = jQuery.extend({
     		width: 650, // default width of the slideshow
     		height: 160, // default height of the slideshow
			speed: 1000, // default animation transition speed
			interval: 3500, // default interval between image change
			PlayPauseElement: 'fssPlayPause', // default css id for the play / pause element
			PlayText: 'Play', // default play text
			PauseText: 'Pause', // default pause text
			NextElement: 'fssNext', // default id for next button
			NextElementText: 'Next >', // default text for next button
			PrevElement: 'fssPrev', // default id for prev button
			PrevElementText: '< Prev', // default text for prev button
			ListElement: 'fssList', // default id for image / content controll list
			ListLi: 'fssLi', // default class for li's in the image / content controll 
			ListLiActive: 'fssActive', // default class for active state in the controll list
			addListToId: false, // add the controll list to special id in your code - default false
			allowKeyboardCtrl: true, // allow keyboard controlls left / right / space
			autoplay: true // autoplay the slideshow
	 	}, options);
		
		// set style for wrapper element
		jQuery(this).css({
			width: settings.width,
			height: settings.height,
			position: 'relative',
			overflow: 'hidden'
		});
		
		// set styles for child element
		jQuery('> *',this).css({
			position: 'absolute',
			width: settings.width,
			height: settings.height
		});
		
		
		
		// count number of slides
		Slides = jQuery('> *', this).length;		
		Slides = Slides - 1;
		ActSlide = Slides;
		
		// Set jQuery Slide short var
		jQslide = jQuery('> *', this);
		// save this
		fssThis = this;
		
		jQslide.hide();
		jQslide.eq(ActSlide).show();
		
		autoplay = function(){			
			
			intval = setInterval(function(){				
				jQslide.eq(ActSlide-1).fadeIn(settings.speed);
				jQslide.eq(ActSlide-1).siblings().fadeOut(500);
				
				// if list is on change the active class
				if(settings.ListElement){
					setActLi = (Slides - ActSlide) + 1;
					if(setActLi > Slides){setActLi=0;}
					jQuery('#'+settings.ListElement+' li').removeClass(settings.ListLiActive);
					jQuery('#'+settings.ListElement+' li').eq(setActLi).addClass(settings.ListLiActive);
				}
				
				if(ActSlide <= 0){
					//jQslide.hide();				
					ActSlide = Slides;
					jQslide.eq(ActSlide).show();
				}else{
					ActSlide = ActSlide - 1;	
				}
			}, settings.interval);
			
			if(settings.PlayPauseElement){
				jQuery('#'+settings.PlayPauseElement).html(settings.PauseText);
			}
		}
		
		stopAutoplay = function(){
			clearInterval(intval);
			intval = false;
			if(settings.PlayPauseElement){
				jQuery('#'+settings.PlayPauseElement).html(settings.PlayText);
			}
			
		}
		
		jumpTo = function(newIndex){
			if(newIndex < 0){newIndex = Slides;}
			else if(newIndex > Slides){newIndex = 0;}
			
			
			jQslide.eq(newIndex).fadeIn(settings.speed);
			jQslide.eq(newIndex).siblings().fadeOut(500);
			
			// set the active slide
			ActSlide = newIndex;

			if(settings.ListElement){
				// set active
				jQuery('#'+settings.ListElement+' li').removeClass(settings.ListLiActive);
				jQuery('#'+settings.ListElement+' li').eq((Slides-newIndex)).addClass(settings.ListLiActive);
			}
		}
		
		// if list is on render it
		if(settings.ListElement){
			i=0;
			li = '';
			while(i<=Slides){
				if(i==0){
					li = li+'<li class="'+settings.ListLi+i+' '+settings.ListLiActive+'"><a href="#">'+(i+1)+'<\/a><\/li>';
				}else{
					li = li+'<li class="'+settings.ListLi+i+'"><a href="#">'+(i+1)+'<\/a><\/li>';
				}
				i++;
			}
			List = '<ul id="'+settings.ListElement+'">'+li+'<\/ul>';
			
			// add list to a special id or append after the slideshow
			if(settings.addListToId){
				jQuery('#scrollable-trigger').html(List);
			}else{
				jQuery('#scrollable-trigger').html(List);
			}
			
			jQuery('#'+settings.ListElement+' a').bind('click', function(){
				index = jQuery('#'+settings.ListElement+' a').index(this);
				stopAutoplay();
				ReverseIndex = Slides-index;			
				jumpTo(ReverseIndex);
				
				setInterval(function(){
					if(intval==false){
						autoplay();
					}
				},6000);
				return false;
			});
			
		}
		
		if(settings.PlayPauseElement){
			if(!jQuery('#'+settings.PlayPauseElement).css('display')){
				//jQuery(this).after('<a href="#" id="'+settings.PlayPauseElement+'"><\/a>');
			}
			
			if(settings.autoplay){
				//jQuery('#'+settings.PlayPauseElement).html(settings.PauseText);
			}else{
				//jQuery('#'+settings.PlayPauseElement).html(settings.PlayText);
			}
			
			jQuery('#'+settings.PlayPauseElement).bind('click', function(){
				if(intval){
					stopAutoplay();
				}else{
					autoplay();
				}
				return false;
			});
		}
		
		if(settings.NextElement){
			if(!jQuery('#'+settings.NextElement).css('display')){
				jQuery(this).after('<a href="#" id="'+settings.NextElement+'">'+settings.NextElementText+'<\/a>');
			}
			
			jQuery('#'+settings.NextElement).bind('click', function(){
				nextSlide = ActSlide-1;
				stopAutoplay();
				jumpTo(nextSlide);
				return false;
			});
		}
		
		if(settings.PrevElement){
			if(!jQuery('#'+settings.PrevElement).css('display')){
				jQuery(this).after('<a href="#" id="'+settings.PrevElement+'">'+settings.PrevElementText+'<\/a>');
			}
			
			jQuery('#'+settings.PrevElement).bind('click', function(){
				prevSlide = ActSlide+1;
				stopAutoplay();
				jumpTo(prevSlide);
				return false;
			});
		}
		
		if(settings.allowKeyboardCtrl){
			jQuery(document).bind('keydown', function(e){
				if(e.which==39){
					nextSlide = ActSlide-1;
					stopAutoplay();
					jumpTo(nextSlide);
				}else if(e.which==37){
					prevSlide = ActSlide+1;
					stopAutoplay();
					jumpTo(prevSlide);
				}else if(e.which==32){
					if(intval){stopAutoplay();}
					else{autoplay();}
					return false;
				}
			});
		}
		
		jQuery('#slideshowWrapper').hover(
			function(){
				stopAutoplay();
			},
			function(){
				autoplay();
			}
		);
		
		// start autoplay or set it to false
		if(settings.autoplay){autoplay();}else{intval=false;}
		
	});
};