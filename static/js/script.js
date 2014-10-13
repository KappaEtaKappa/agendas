
$(document).ready(function(){
	var snapper = new Snap({
	  	element: document.getElementById('content')
	});
	snapper.settings({
		disable: 'right'
	});
	var toggle = false;
	$('#open-button').click(function(){
		if(!toggle)
			snapper.open('left');
		else
			snapper.close('left');
		toggle = !toggle;
	});
})
