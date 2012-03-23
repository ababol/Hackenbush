<?php
	require_once '../modele/hackenbushGame.php';

	$gamesData = HackenBush::getInstance()->getGames();

	if (isset($gamesData)) {
		echo "<div class='load'>";
		$gamesNumber = count($gamesData);
		for ($i = 0; $i < $gamesNumber; $i++) {
			echo "<div class='game' id='".$gamesData[$i]->name."'>";
			echo '<img src="'.$gamesData[$i]->imageData.'" alt="'.$gamesData[$i]->name.'"/>'.$gamesData[$i]->name;
			echo "</div>";
		}
		echo "</div>";
		echo "<script type='text/javascript'>
				var load = $('.load');
				console.log('test');
				load.delegate('div', 'click', function(ev) {
					memoryCard.loadGame(ev.currentTarget.id);
				});
			</script>";
	} else
		echo "There isn't game saved.";
?>