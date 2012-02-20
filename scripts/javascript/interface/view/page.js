(function() {
	hackenbush.selectedPage = function(page) {
		$('.selected').removeClass('selected');
		$('.'+page).addClass('selected');
	}

	hackenbush.loadPage = function(page) {
		$.ajax({
			type: 'POST',
			url: './scripts/php/interface/view/'+page+'.php',
			complete: console.log('AJAX response received !'),
			success: function(data)	{
				var main = $('#main');
				main.html();
				main.html(data);	
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.error('Error: ' + textStatus);
			}
		});
	}
})();
