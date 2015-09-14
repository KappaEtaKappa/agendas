
$(document).ready(function(){
	var snapper = new Snap({
	  	element: document.getElementById('content')
	});
	snapper.settings({
	});
	var toggle = false;
	var h_toggle = false;
	$('#open-button').click(function(){
		if(!toggle)
			snapper.open('left');
		else
			snapper.close('left');
		toggle = !toggle;
	});
	$('#open-history').click(function(){
		if(!h_toggle)
			snapper.open('right');
		else
			snapper.close('right');
		h_toggle = !h_toggle;
	});
})
