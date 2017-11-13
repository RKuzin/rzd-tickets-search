<?php
setlocale(LC_ALL, 'ru_RU.UTF-8');
header('Content-Type: text/html;charset=UTF-8');

$fromId = $_POST['StartStationId']; //получаем из ajax id станций и дату поездки
$toId = $_POST['EndStationId'];
$date = $_POST['DateJorney'];
$fromName = $_POST['StartStationName'];
$toName = $_POST['EndStationName'];

$searchCity = $aa;
$s = urlencode($searchCity);
$date = str_replace("-","",$date); //очищаем дату от черточек, хотя будет работать и так
// example: GET $API_HOST/_api/rzd/metaTimetable/?from=22823&to=22871&date=29012017&source=web&long=37.6235121&lat=55.7788674&device_id=nJAQQAlPNaXvhy1wo%2BLxsN3v&device_name=web
//$url = "https://www.onetwotrip.com/_api/rzd/suggestStations/?searchText=$s&lang=ru&limit=10&flat=true";
$url = "https://www.onetwotrip.com/_api/rzd/metaTimetable/?from=$fromId&to=$toId&date=$date&source=web&device_id=nJAQQAlPNaXvhy1wo%2BLxsN3v&device_name=web";

$data = @file_get_contents($url);
// если получили данные
//var_dump($data);
if($data){
	$dataJson = json_decode($data, true); // декодируем полученные данные
    $resultsCount = count($results);
	if ($dataJson['success']) {
		$results=$dataJson['result'];
		if (count($results) > 0){
		$trainNumber=$result_item['trainNumber'];
		//Определяем количество найденых поездов

		foreach ($results as & $result_item) {
			$trainNumber=$result_item['trainNumber'];
			$trainName=$result_item['name'];	
			$trainNameTag='';
			if ($trainName !== NULL){
				$trainNameTag='<span class="train-card__train-name">«'.$trainName.'»</span>';
			}
			$startRouteName = $result_item['route'][0];
			$endRouteName = $result_item['route'][1];
			$depDateDigital = strtotime(substr($result_item['departure']['time'],0,10));  //вырезаем дату из строки вида 2017-01-29T00:20:00 и преобразуем в цифровой формат
			$departureDate = strftime('%e %b %G, %a', $depDateDigital); //форматируем в дату вида 20 Окт 2017
			$departureTime=substr($result_item['departure']['time'],11,5);
			$durationHours = intval($result_item['durationInMinutes']/60);
			$durationMinutes = $result_item['durationInMinutes'] - $durationHours*60;
			$arrDateDigital = strtotime(substr($result_item['arrival']['time'],0,10));  //вырезаем дату из строки вида 2017-01-29T00:20:00 и преобразуем в цифровой формат
			$arrivalDate = strftime('%e %b %G, %a', $arrDateDigital); //форматируем в дату вида 20 Окт 2017
			$arrivalTime = substr($result_item['arrival']['time'],11,5);
			$depStationName = $result_item['from']['station'];
			$depStationCode = $result_item['from']['code'];
			$arrStationName = $result_item['to']['station'];
			$arrStationCode = $result_item['to']['code'];
  echo <<<END
  <div class="train-card">
    <div class="train-card__trip-info">
      <div class="train-card__train-number">$trainNumber$trainNameTag</div>
      <div class="train-card__route">$startRouteName — $endRouteName</div>
      <div class="train-card__trip-info-wrapper">
        <div class="train-card__dep-info" data-name-from="$fromName" data-id-from="$fromId">
          <div class="train-card__date" data-train-date="$date">$departureDate</div>
          <div class="train-card__time">$departureTime</div>
        </div>
        <div class="train-card__total-time">$durationHours ч. $durationMinutes мин.</div>
        <div class="train-card__arr-info" data-name-to="$toName" data-id-to="$toId" >
          <div class="train-card__date">$arrivalDate</div>
          <div class="train-card__time">$arrivalTime</div>
        </div>
      </div>
      <div class="train-card__trip-info-wrapper">
        <div class="train-card__station" data-code-from="$depStationCode">$depStationName</div>
        <div class="train-card__station" data-code-to="$arrStationCode">$arrStationName</div>
      </div>
    </div>
    <div class="train-card__trains-cat-info">
END;
			for ($i=0; $i<count($result_item['places']); $i++ ){  //выводим типы вагонов и свободных мест
				$trainType = $result_item['places'][$i]['typeName'];
				$trainTypeNumber = $result_item['places'][$i]['type'];
				$freeSeats = $result_item['places'][$i]['freeSeats'];
				if (($freeSeats == 1) || (($freeSeats>20)&($freeSeats%10 == 1))){
					$seatsName = "место";
				}
				ElseIf ( ($freeSeats>20) & ($freeSeats%10 > 1) & ($freeSeats%10 < 5)){
					$seatsName = "места";
				}
				Else {
					$seatsName = "мест";
				}
				$ticketPrice = $result_item['places'][$i]['cost'];
echo <<<END
      <div class="train-card__trains-cat-item">
        <div class="train-card__train-type" data-train-type="$trainTypeNumber">$trainType&nbsp;</div>
        <div class="train-card__train-seats">$freeSeats $seatsName</div>
        <div class="train-card__price">от $ticketPrice р.</div>
      </div>
END;
			}
			$minTicketPrice = $result_item['places'][0]['cost'];

echo <<<END
    </div>
    <div class="train-card__button-box">
			<div class="train-card__min-price">от <span>$minTicketPrice</span> р.</div>
		  <button class="train-card__button" type="button" onclick="trainSelect(this)">
				<span class="train-card__button-text">Купить билет ></span>
				<span class="train-card__button-text_mobile">Купить от $minTicketPrice р.</span>
			</button>
		</div>
  </div>
END;
		}
		}
		else {
	echo <<<END
	<div class="warning">
		<img class="warning__image" src="img/warning-icon.png" alt="">
		<div class="warning__message">По вашему запросу поезда не найдены.</br>Измените название станций или дату, затем повторите поиск.</div>
	</div>
END;
		}
	}
}
else{
    echo "Сервер не доступен!";
}

?>
