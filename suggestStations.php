<?php
header('Content-Type: text/html;charset=UTF-8');
$aa = $_POST['keyword']; //получаем из ajax номер поля (1 или 2)
$searchCity = $aa;
$s = urlencode($searchCity);
$url = "https://www.onetwotrip.com/_api/rzd/suggestStations/?searchText=$s&lang=ru&limit=10&flat=true";
$data = @file_get_contents($url);
// если получили данные
if($data){
	$dataJson = json_decode($data, true);
	$results=$dataJson['result'];
	foreach ($results as & $result_item) {
	  echo "<li class=\"form__stations-list-item\" onclick=\"set_item(this,'".$result_item['id']."','".$result_item['name']."')\">".$result_item['name']."</li>";
	}
}
else{
    echo "Сервер не доступен!";
}
?>
