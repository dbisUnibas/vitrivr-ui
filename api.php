<?php
/* functions */

function queryAPI($jsonQuery) {
	$service_port = 12345;
	$address = "localhost";

	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		echo "connection error: " . socket_strerror(socket_last_error()) . "n";
		return "";
	}

	$result = socket_connect($socket, $address, $service_port);
	if ($result === false) {
		echo "connection error: ($result) " . socket_strerror(socket_last_error($socket)) . "n";
		return "";
	}

	$in = stripslashes($jsonQuery);
	socket_write($socket, $in, strlen($in));
	socket_write($socket, ';', 1);

	// Other ini stuff
	//@ini_set('output_buffering', 'Off');
	//@ini_set('output_handler', '');

	#JSON Array header
	//$msg = "{\n [\n";
	$msg = "{\n   \"array\": [\n";
	echo $msg;

	$buffer = "";
	while ($out = socket_read($socket, 2048)) {
		//print_r($out);
		echo $out;
		//maybe str_pad isn't needed?
		//echo str_pad($out, 2048, " ");
		ob_flush();
		flush();
	}

	#JSON Array end
	$msg = "]\n }";
	echo $msg;
	echo PHP_EOL;
	ob_flush();
	flush();
	socket_close($socket);

	return "";
}

/* actual logic */
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!empty($_POST)) {
	try {
		$queryObject = json_decode(stripslashes($_POST['query']));

		if ($queryObject -> queryType == 'multiSketch') {

			foreach ($queryObject->query as $currentQuery) {
				//prepare image for Java
				if (isset($currentQuery -> img)) {
					$currentQuery -> img = str_replace(' ', '+', $currentQuery -> img);
					$currentQuery -> img = str_replace("\n", '', $currentQuery -> img);
				}
			}

			$json = json_encode($queryObject);
			queryAPI($json);

		} else {
			$json = json_encode($queryObject);
			queryAPI($json);
			//echo "{\n \"type\":\"error\"\n}";
			//echo PHP_EOL;
			//ob_flush();
			//flush();
		}
	} catch (Exception $e) {
		die($e -> getMessage());
		echo "{\n \"type\":\"error\"\n}";
		echo PHP_EOL;
		ob_flush();
		flush();
	}

}
?>
